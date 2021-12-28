import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class GameCollectionService {

  private catalogue: AngularFirestoreCollection<any>;

  constructor(private db: AngularFirestore, private util: UtilService) {
    this.catalogue = this.db.collection("Games");
  }

  /**
    * Restituisce l'intero catalogo dei videogiochi.
    * @returns catalogo dei videogiochi
  */
  getCatalogue() {
    return this.catalogue;
  }

  /**
    * Restituisce l'intero catalogo dei videogiochi, ed una mappa che per ogni entry presenta come chiave l'id del gioco e 
    * come valore l'url della copertina del videogioco.
    * @returns catalogo dei videogiochi e relative copertine
  */
  getCatalogueWithImageUrls(): { catalogue: AngularFirestoreCollection<any>, urls: Promise<Map<string, string>> } {
    return { catalogue: this.getCatalogue(), urls: this.util.loadGameListImgUrls(this.getCatalogue()) };
  }

  /**
    * Restituisce il videogioco corrispondende al gameid.
    * @returns videogioco con id: gameid
  */
  getGame(gameid: string) {
    return this.db.doc('Games/' + gameid);
  }

  /**
    * Restituisce il videogioco corrispondende al gameid e l'url della sua immagine di copertina
    * @returns videogioco con id: gameid e url immagine copertina
  */
  getGameWithImageUrl(gameid: string): { game: AngularFirestoreDocument<any>, url: Promise<string> } {
    return { game: this.getGame(gameid), url: this.util.getGameImageUrl(gameid) };
  }

  /**
    * Restituisce il videogioco corrispondende al titolo.
    * @returns videogioco con title: titolo
  */
  getGameByTitle(title: string) {
    return this.db.collection('Games', ref => ref.where('title', '==', title));
  }

  /**
   * Restituisce la lista di videogiochi che corrispondono alla ricerca per titolo.
   * @returns lista di videogiochi
 */
  searchGamesByTitle(title: string) {
    return this.db.collection('Games', ref =>
      ref.where('title', '>=', title).where('title', '<=', title + '\uf8ff'));
  }

   /**
    * Aggiorna CompletedAvg e CompletedCount di un gioco con gameid, considerando il vecchio tempo che impiegava un utente,
    * ed il nuovo.
    * Nel caso completedTime_old == 0, si rappresenta il caso in cui un utente sta aggiungendo tale gioco alla lista dei completati.
    * Nel caso completedTime == 0, si rappresenta il caso in cui un utente sta rimuovendo tale gioco alla lista dei completati.
    * Nei restanti casi si considera la modifica da parte dell'utente del suo tempo di completamento
    * @returns true nel caso di corretto aggiornamento, false altrimenti
  */
  async updateCompletedAvg(gameid: string, completedTime_old: number, completedTime: number): Promise<boolean> {
    let gameDoc = this.catalogue.doc(gameid);

    //Tempo medio memorizzato nel database
    let completedTimeAvg_cur = (await gameDoc.ref.get()).get("completedtimeavg");
    //Contatore dei giochi completati memorizzato nel database
    let completedTimeCount_cur = (await gameDoc.ref.get()).get("completedtimecount");

    var par = { completedtimeavg: 0, completedtimecount: 0 };

    if (completedTimeAvg_cur === undefined)
      par = { completedtimeavg: completedTime, completedtimecount: 1 };
    else {
      par.completedtimecount = completedTimeCount_cur + (completedTime_old == 0 ? 1 : 0) + (completedTime == 0 ? -1 : 0);
      if (par.completedtimecount > 0)
        par.completedtimeavg = ((completedTimeAvg_cur * completedTimeCount_cur) - completedTime_old + completedTime) / par.completedtimecount;
      else
        par.completedtimeavg = 0;
    }
    return gameDoc.update(par).then(() => true).catch(err => false);
  }

  /**
    * Aggiorna VoteAvg e VoteCount di un gioco con gameid, considerando il vecchio voto assegnato da un utente,
    * ed il nuovo.
    * Nel caso vote_old == 0, si rappresenta il caso in cui un utente sta aggiungendo a tael gioco un voto.
    * Nel caso vote == 0, si rappresenta il caso in cui un utente sta rimuovendo il voto a tale gioco.
    * Nei restanti casi si considera la modifica da parte dell'utente del suo voto.
    * @returns true nel caso di corretto aggiornamento, false altrimenti
  */
  async updateVoteAvg(gameid: string, vote_old: number, vote: number): Promise<boolean> {
    let gameDoc = this.catalogue.doc(gameid);

    if (vote == vote_old && vote == 0)
      return true;
    //Voto memorizzato nel database
    let vote_cur = (await gameDoc.ref.get()).get("voteavg");
    //Contatore dei voti memorizzato nel database
    let votecount_cur = (await gameDoc.ref.get()).get("votecount");

    var par = { voteavg: 0, votecount: 0 };

    if (votecount_cur === undefined)
      par = { voteavg: vote, votecount: vote > 0 ? 1 : 0 };
    else {
      par.votecount = votecount_cur + (vote_old == 0 ? 1 : 0) + (vote == 0 ? -1 : 0);
      if (par.votecount > 0)
        par.voteavg = ((vote_cur * votecount_cur) - vote_old + vote) / par.votecount;
      else
        par.voteavg = 0;
    }

    return gameDoc.update(par).then(() => true).catch(err => false);
  }

  /**
    * Restituisce tutti i dati relativi ad un gioco.
    * @returns dati relativi ad un gioco
  */
  async getDataGame(gameid: string) {
    return await this.db.doc('Games/' + gameid).ref.get();
  }

  /**
    * Restituisce il valore di un attributo di un gioco
    * @returns valore attributo gioco
  */
  async getDataFieldGame(gameid: string, field: string) {
    return (await this.db.doc('Games/' + gameid).ref.get()).get(field);
  }

}
