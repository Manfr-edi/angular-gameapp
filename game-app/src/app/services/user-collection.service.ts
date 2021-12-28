import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentData, Query } from '@angular/fire/firestore';
import { userlist } from '../data/userlist/userlist';
import { GameCollectionService } from './game-collection.service';
import { UserLoggedService } from './user-logged.service';
import { UtilService } from './util.service';

export interface Spese {
	sumPrice: number;
	avgPrice: number;
	countBoughtGame: number;
}

@Injectable({
	providedIn: 'root'
})
export class UserCollectionService {

	userlists = userlist;

	constructor(private db: AngularFirestore, private gameCollectionService: GameCollectionService,
		private userLoggedService: UserLoggedService, private util: UtilService) {
	}

	/**
    * Restituisce una lista di giochi relativi ad un utente.
	* @param {string} userid Id dell'utente, nel caso non sia specificato si considera l'utente attualmente loggato
    * @returns lista di giochi di un utente
    */
	getList(list: string, userid?: string): AngularFirestoreCollection {
		return this.userLoggedService.getUserDoc(userid).collection(list);
	}

	/**
    * Restituisce una lista di giochi relativi ad un utente, ed una mappa contenente gli url delle relative immagini di copertina.
	* @param {string} list codice della lista utente
	* @param {string} userid Id dell'utente, nel caso non sia specificato si considera l'utente attualmente loggato
    * @returns lista di giochi di un utente e relative immagini di copertina
    */
	getListWithImageUrls(list: string, userid?: string): { list: AngularFirestoreCollection, urls: Promise<Map<string, string>> } {
		let coll = this.userLoggedService.getUserDoc(userid).collection(list);
		return { list: coll, urls: this.util.loadGameListImgUrls(coll) };
	}

	/**
    * Restituisce un gioco presente in una lista utente.
	* @param {string} gameid id del videogioco
	* @param {string} list codice della lista utente
	* @param {string} userid Id dell'utente, nel caso non sia specificato si considera l'utente attualmente loggato
    * @returns gioco presente in una lista utente
    */
	getGameFromList(gameid: string, list: string, userid?: string): AngularFirestoreDocument {
		return this.getList(list, userid).doc(gameid);
	}

	/**
    * Restituisce i dati di un gioco presente in una lista utente.
	* @param {string} gameid id del videogioco
	* @param {string} list codice della lista utente
	* @param {string} userid Id dell'utente, nel caso non sia specificato si considera l'utente attualmente loggato
    * @returns dati di un gioco presente in una lista utente
    */
	async getGameDataFromList(gameid: string, list: string, userid?: string): Promise<DocumentData> {
		return (await this.getGameFromList(gameid, list, userid).ref.get());
	}

	/**
    * Verifica che un gioco sia già presente in una lista utente.
	* @param {string} gameid id del videogioco
	* @param {string} userid Id dell'utente, nel caso non sia specificato si considera l'utente attualmente loggato
    * @returns true nel caso il gioco sia presente di già in una lista, false altrimenti
    */
	async checkUniqueList(gameid: string, userid?: string): Promise<boolean> {
		for (let l of userlist)
			return !(await this.getGameDataFromList(gameid, l.code, userid)).exists
		return true;
	}

	/**
    * Restituisce la lista di videogiochi di un utente, che rispetta due filtri, platform e genre.
	* @param {string} list codice della lista utente
	* @param {string} userid Id dell'utente, nel caso non sia specificato si considera l'utente attualmente loggato
    * @param { platform?: string, genre?: string } filters struttura che permette di specificare due filtri. La lista di giochi
	* avrà la stessa piattaforma, se specificata, e avrà almeno un genere in comune se specificato.
	* @param {string} userid Id dell'utente, nel caso non sia specificato si considera l'utente attualmente loggato
	* @returns gioco presente in una lista utente
    */
	getGamesWithFilters(list: string, filters: { platform?: string, genre?: string }, userid?: string): AngularFirestoreCollection {
		return this.userLoggedService.getUserDoc(userid).collection(list, ref => {
			let a = (ref as Query<DocumentData>);
			if (filters.platform && filters.platform !== '')
				a = a.where("platform", "==", filters.platform);
			if (filters.genre && filters.genre !== '')
				a = a.where("genre", "array-contains", filters.genre)
			return a;
		});
	}

	/**
    * Restituisce le il report relativo alle spese di un utente.
	* Per videogiochi acquistati si considerando sia quelli completati che quelli in corso.
	* @param {string} userid Id dell'utente, nel caso non sia specificato si considera l'utente attualmente loggato
    * @param { platform?: string, genre?: string } filters struttura che permette di specificare due filtri. La lista di giochi
	* avrà la stessa piattaforma, se specificata, e avrà almeno un genere in comune se specificato.
	* @param {string} userid Id dell'utente, nel caso non sia specificato si considera l'utente attualmente loggato
	* @returns report sulle spese di un utente
    */
	async getShoppingReport(filters?: { platform?: string, genre?: string }, userid?: string): Promise<Spese> {
		let sum = 0;
		let count = 0;

		for (let i = 0; i < 2; i++) {
			await (filters ? this.getGamesWithFilters(userlist[i].code, filters, userid) :
				this.getList(userlist[i].code, userid))
				.get().forEach(docs => docs.forEach(doc => {
					sum += doc.get("price");
					count++;
				}));
		}

		//Calcolo la media e aggiorno i dati
		if (count > 0)
			return { sumPrice: sum, avgPrice: sum / count, countBoughtGame: count };
		else
			return { sumPrice: 0, avgPrice: 0, countBoughtGame: 0 };
	}

	/********************************
	 * 
	 *        Modifica Lista
	 * 
	 ********************************/

	/**
    * Permette di aggiungere/modificare/spostare un gioco da un lista di un utente.
	* nel caso selectedList != '' e previousList == '', si considera il caso di aggiunta di un gico ad una lista.
	* nel caso selectedList == previousList e selectedList != '', si considera il caso di modifica di un gioco in una lista.
	* nel caso selectedList != previousList && selectedList != '', si considera il caso di modifica e spostamento di un gioco in una lista.
	* nel caso selectedList == '' non accade nulla.
	* Vengono aggiornati anche VoteAvg e CompletedAvg.
	* @param {string} userid Id dell'utente, nel caso non sia specificato si considera l'utente attualmente loggato
    * @param {string } selectedList lista di destinazione
	* @param {string} previousList lista di partenza
	* @returns true nel caso l'aggiornamento sia avvenuto correttamente, false altrimenti.
    */
	async updateGame(selectedList: string, previousList: string, gameid: string, gametitle: string, note: string,
		time: number, vote: number, selectedPlatform: string, genre: string, price: number, userid?: string): Promise<boolean> {

		//In questo caso non accade nulla
		if (selectedList == '')
			return false;

		let old_doc: DocumentData | undefined = undefined;

		//Salvo un riferimento al vecchio documento, se esiste, nel caso debbo ripristinare.
		//Effettuo il salvataggio solo nel caso di modifica di un gioco
		//Se il backup fallisce, viene restituito false
		//Se il gameid non esiste viene restituito false
		if (previousList != '') {
			old_doc = await this.getGameDataFromList(gameid, previousList, userid)
				.then(doc => doc.exists ? doc : undefined)
				.catch(e => undefined);
			if (!old_doc)
				return false;
		}

		//Genero il documento base per inserire un gioco in una lista
		let doc = new Map<String, any>([
			["title", gametitle],
			["note", note],
			["genre", genre]
		]);

		//Controlli per l'inserimento in lista completati
		if (selectedList === this.userlists[0].code) {
			//Nel caso il tempo di completamento sia valido
			doc.set("completetime", time);

			//Nel caso sia stato inserito un voto valido, lo inserisco, altrimenti no essendo opzionale
			if (vote > 0)
				doc.set("vote", vote);
		}

		//Nel caso la lista completati o in gioco
		if (selectedList !== this.userlists[2].code) {
			doc.set("price", price);
			doc.set("platform", selectedPlatform);
		}

		//Nel caso viene aggiornato un gioco gia presente in una lista
		if (previousList == selectedList)
			return this.getGameFromList(gameid, selectedList).update(Object.fromEntries(doc))
				.then(() => {
					let old_vote = old_doc!.get('vote');
					return this.updateVoteCompleteTimeAvg(gameid, selectedList, time, vote ? vote : 0,
						old_doc!.get("completetime"), old_vote ? old_vote : 0, old_doc)
				}).catch(e => { this.getGameFromList(gameid, selectedList).update(old_doc!); return false }); //Ripristino e restituisco false
		else
			//Nel caso di aggiunta di un gioco ad una lista
			if (previousList == '')
				return this.getGameFromList(gameid, selectedList).set(Object.fromEntries(doc))
					.then(() => this.updateVoteCompleteTimeAvg(gameid, selectedList, time, vote, 0, 0, old_doc))
					.catch(e => { this.getGameFromList(gameid, selectedList).update(old_doc!); return false });

			else //Nel caso modifica con cambio lista
				//Rimuovo il gioco dalla lista precedente
				return this.removeGame(previousList, gameid, userid) //Gestisce di gia un'eventuale ripristino
					.then(state => {
						if (state)//SE ho rimosso il gioco
						{
							return this.getGameFromList(gameid, selectedList).set(Object.fromEntries(doc))
								.then(() => this.updateVoteCompleteTimeAvg(gameid, selectedList, time, vote, 0, 0, old_doc))
								.catch(e => { this.getGameFromList(gameid, selectedList).update(old_doc!); return false });
						}

						return false;
					});

	}

	/**
    * Permette di rimuovere un gioco da un lista di un utente.
	* Vengono aggiornati anche VoteAvg e CompletedAvg.
	* @param {string} userid Id dell'utente, nel caso non sia specificato si considera l'utente attualmente loggato
    * @param {string } selectedList lista di appartenenza del gioco
	* @param {string} gameid id del gioco
	* @returns true nel caso la rimozione sia avvenuta correttamente, false altrimenti.
    */
	async removeGame(selectedList: string, gameid: string, userid?: string): Promise<boolean> {
		//Salvo un riferimento al vecchio documento, nel caso debbo ripristinare.
		//Se il backup fallisce, viene restituito false
		//Se il gameid non esiste viene restituito false
		let old_doc = await this.getGameDataFromList(gameid, selectedList, userid)
			.then(doc => doc.exists ? doc : undefined)
			.catch(e => undefined);
		if (!old_doc)
			return false;

		return this.getGameFromList(gameid, selectedList, userid).delete()
			.then(async () => {
				let old_vote = old_doc!.get('vote');
				return this.updateVoteCompleteTimeAvg(gameid, selectedList, 0, 0, old_doc!.get('completetime'),
					old_vote ? old_vote : 0, old_doc);
			})
			.catch(e => { this.getGameFromList(gameid, selectedList).update(old_doc!); return false }); //Ripristino e restituisco false
	}

	/**
    * Permette di aggiornare CompletedAvg e VoteAvg.
    * @param {string } list lista di appartenenza del gioco
	* @param {string} gameid id del gioco
	* @param {number} time nuovo completed time
	* @param {number} vote nuovo voto
	* @param {number} old_time precedente completed time
	* @param {number} old_vote precedente voto
	* @param {DocumentData} old_doc documento relativo al gioco precedente alla modifica, utile per ripristinare in caso di errore.
	* @returns true nel caso l'aggiornamento sia avvenuto correttamente, false altrimenti.
    */
	private updateVoteCompleteTimeAvg(gameid: string, list: string, time: number, vote: number, old_time: number,
		old_vote: number, old_doc?: DocumentData): Promise<boolean> {
		return this.gameCollectionService.updateVoteAvg(gameid, old_vote, list == userlist[0].code ? vote : 0) //Nel caso non sto nella lista Completed, il voto non va toccato
			.then(() => {
				if (list == userlist[0].code) //Nel caso la modifica riguarda la lista Completed
					return this.gameCollectionService.updateCompletedAvg(gameid, old_time, time)
						.then(() => true)
						.catch(e => { if (old_doc) this.getGameFromList(gameid, list).update(old_doc); return false }); //Ripristino e restituisco false
				return true
			})
			.catch(e => { if (old_doc) this.getGameFromList(gameid, list).update(old_doc); return false }); //Ripristino e restituisco false
	}

}
