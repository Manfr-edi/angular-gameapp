import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class GameCollectionService {

  private catalogue: AngularFirestoreCollection<any>;

  constructor(public db: AngularFirestore, public util: UtilService) {
    this.catalogue = this.db.collection("Games");
  }

  getCatalogue() {
    return this.catalogue;
  }

  getCatalogueWithImageUrls(): { catalogue: AngularFirestoreCollection<any>, urls: Promise<Map<string, string>> } {
    return { catalogue: this.getCatalogue(), urls: this.getImageUrls(this.getCatalogue()) };
  }

  getGame(gameid: string) {
    return this.db.doc('Games/' + gameid);
  }

  getGameWithImageUrl(gameid: string): { game: AngularFirestoreDocument<any>, url: Promise<string> } {
    return { game: this.getGame(gameid), url: this.util.getGameImageUrl(gameid) };
  }

  getGamesByTitle(title: string) {
    return this.db.collection('Games', ref =>
      ref.where('title', '>=', title).where('title', '<=', title + '\uf8ff'));
  }

  getGameByTitle(title: string)
  {
    return this.db.collection('Games', ref => ref.where('title', '==', title));
  }

  //Nel caso in cui sto inserendo il tempo di completamento
  //completedTime_old DEVE essere pari a 0
  //Nel caso in cui sto rimuovendo il tempo di completamento
  //completedTime DEVE essere pari a 0
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

  //Nel caso in cui sto inserendo il voto
  //vote_old DEVE essere pari a 0
  //Nel caso in cui sto rimuovendo il voto
  //vote DEVE essere pari a 0
  //Nel caso vote == old_vote == 0, non accade nulla
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

  async getDataGame(gameid: string) {
    return await this.db.doc('Games/' + gameid).ref.get();
  }

  async getDataFieldGame(gameid: string, field: string) {
    return (await this.db.doc('Games/' + gameid).ref.get()).get(field);
  }

  getImageUrls(games: AngularFirestoreCollection): Promise<Map<string, string>> {
    return new Promise<Map<string, string>>((resolve, reject) => {
      let urls: Map<string, string> = new Map;
      games.get().forEach(games =>
        games.forEach(game => this.util.getGameImageUrl(game.id).then(url => urls.set(game.id, url)))).then(
          () => resolve(urls));
    });
  }

}
