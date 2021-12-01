import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class GameCollectionService {

  catalogue: AngularFirestoreCollection<any>;

  constructor(public db: AngularFirestore) {
    this.catalogue = this.db.collection("Games");
  }

  getCatalogue() {
    return this.catalogue;
  }

  getGamesByTitle(title: string) {
    return this.db.collection('Games', ref =>
      ref.where('title', '>=', title).where('title', '<=', title + '\uf8ff'));
  }

  //Nel caso in cui sto inserendo il tempo di completamento
  //completedTime_old DEVE essere pari a 0
  //Nel caso in cui sto rimuovendo il tempo di completamento
  //completedTime DEVE essere pari a 0
  async updateCompletedAvg(gameid: string, completedTime_old: number, completedTime: number) {
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

    gameDoc.update(par);

  }

  async getDataGame(gameid: string) {
    return await this.db.doc('Games/' + gameid).ref.get();
  }

  getGame(gameid: string) {
    return this.db.doc('Games/' + gameid);
  }

}
