import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class GameCatalogueService {

  catalogueDoc: AngularFirestoreCollection<any>;

  constructor(public db: AngularFirestore) { 

    this.catalogueDoc = this.db.collection("Games");
  }

  //Nel caso in cui sto inserendo il tempo di completamento
  //completedTime_old DEVE essere pari a 0
  //Nel caso in cui sto rimuovendo il tempo di completamento
  //completedTime DEVE essere pasi a 0
  async updateCompletedAvg(gameid: string, completedTime_old: number, completedTime: number)
  {
    let gameDoc = this.catalogueDoc.doc(gameid);

    let completedTimeAvg_cur = (await gameDoc.ref.get()).get("CompletedTimeAvg");
    let completedTimeCount_cur = (await gameDoc.ref.get()).get("CompletedTimeCount");

    var par = {CompletedTimeAvg : 0, CompletedTimeCount : 0 };

    if( completedTimeAvg_cur === undefined )
      par = {CompletedTimeAvg : completedTime, CompletedTimeCount: 1};
    else
    {
      par.CompletedTimeCount = completedTimeCount_cur + (completedTime_old == 0 ? 1 : 0) +  (completedTime == 0 ? -1 : 0);
      par.CompletedTimeAvg = ((completedTimeAvg_cur * completedTimeCount_cur) - completedTime_old + completedTime) / par.CompletedTimeCount;
    }

    gameDoc.update(par);

  }



}
