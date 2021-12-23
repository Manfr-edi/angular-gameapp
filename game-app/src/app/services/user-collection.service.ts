import { Platform } from '@angular/cdk/platform';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection, DocumentData, Query } from '@angular/fire/firestore';
import { userlist } from '../data/userlist/userlist';
import { AuthService } from '../services/auth.service';
import { GameCollectionService } from './game-collection.service';
import { UserLoggedService } from './user-logged.service';

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

	constructor(public authService: AuthService, public db: AngularFirestore,
		public gameCollectionService: GameCollectionService, public userLoggedService: UserLoggedService) {
	}

	//Nel caso di aggiunta di un nuovo gioco : selectedList != '' e previousList == ''
	//Nel caso di aggiornamento di un gioco(stessa lista) : selectedList == previousList && selectedList != ''
	//Nel caso di aggiornamento di un gioco(cambio lista) : selectedList != previousList && selectedList != '' && previousList != ''
	//Nel caso selectedList == '' : non accade nulla => false
	async UpdateGame(selectedList: string, previousList: string, gameid: string, gametitle: string, note: string,
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
				return this.RemoveGame(previousList, gameid, userid) //Gestisce di gia un'eventuale ripristino
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

	async RemoveGame(selectedList: string, gameid: string, userid?: string): Promise<boolean> {
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

	private updateVoteCompleteTimeAvg(gameid: string, list: string, time: number, vote: number, old_time: number,
		old_vote: number, old_doc?: DocumentData) {
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

	async GetSpese(filters?: { platform?: string, genre?: string }, userid?: string): Promise<Spese> {
		let sum = 0;
		let count = 0;

		for (let i = 0; i < 2; i++) {
			await (filters ? this.getGamesWithPlatGenNotEmpty(userlist[i].code, filters, userid) :
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

	async CheckUniqueList(id: string, userid?: string): Promise<boolean> {
		for (let l of userlist)
			if ((await this.getGameDataFromList(id, l.code, userid)).exists)
				return false;
		return true;
	}

	getList(list: string, userid?: string): AngularFirestoreCollection {
		return this.userLoggedService.getUserDoc(userid).collection(list);
	}

	getListWithImageUrls(list: string, userid?: string): { list: AngularFirestoreCollection, urls: Promise<Map<string, string>> } {
		let coll = this.userLoggedService.getUserDoc(userid).collection(list);
		return { list: coll, urls: this.gameCollectionService.getImageUrls(coll) };
	}

	async getGameDataFromList(gameid: string, list: string, userid?: string): Promise<DocumentData> {
		return (await this.getGameFromList(gameid, list, userid).ref.get());
	}

	getGameFromList(gameid: string, list: string, userid?: string): AngularFirestoreDocument {
		return this.getList(list, userid).doc(gameid);
	}

	//Questa funzione restituisce la collezione dei giochi presenti in una determinata lista dell'utente indicato
	//che rispetta dei filtri(piattaforma e genere) presentati in ingresso, nel caso un filtro è '', non viene considerato
	getGamesWithPlatGenNotEmpty(list: string, filters: { platform?: string, genre?: string }, userid?: string): AngularFirestoreCollection {
		return this.userLoggedService.getUserDoc(userid).collection(list, ref => {
			let a = (ref as Query<DocumentData>);
			if (filters.platform && filters.platform !== '')
				a = a.where("platform", "==", filters.platform);
			if (filters.genre && filters.genre !== '')
				a = a.where("genre", "array-contains", filters.genre)
			return a;
		});
	}


}
