import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, QuerySnapshot, DocumentData, AngularFirestoreCollection, Query } from '@angular/fire/firestore';

import { userlist } from '../../data/userlist/userlist';
import { AuthService } from '../../shared/services/auth.service';
import { GameCatalogueService } from './game-catalogue.service';

@Injectable({
  providedIn: 'root'
})
export class GameListService {

  game: any;
  userlists = userlist;

  constructor(public authService: AuthService, public db: AngularFirestore, public gameCatalogueService: GameCatalogueService) {
    this.game = db.collection('Games');      
  }


  async AddGame(selectedList: string, gameid: string, gametitle: string, note: string, time: number, vote: number, selectedPlatform: string, genre: string, price: number) {

   let userDoc = this.db.doc('Users/'+this.authService.currentUserId);

    //if( this.CheckUniqueList(gameid)){return;}
    if (await this.CheckUniqueList(gameid).then(result => !result)) {
      //TODO:SI PUO RIAGGIUNGERE A QUALE LISTA ERA INSERITO?
      window.alert("Gioco gia' inserito in un'altra lista ");
      return
    }

    //Genero il documento base per inserire un gioco in una lista
    let doc = new Map<String, any>([
      ["title", gametitle],
      ["note", note],
      ["genre", genre]
    ]);

    //Controlli per l'inserimento in lista completati
    if (selectedList === this.userlists[0].code) {
      if (time <= 0 || time > 9999) {
        window.alert("Non hai inserito un tempo di completamento valido");
        return;
      }

      //Nel caso il tempo di completamento sia valido
      doc.set("completetime", time);

      //Nel caso sia stato inserito un voto valido, lo inserisco, altrimenti no essendo opzionale
      if (vote > 0) {
        var y: number = +vote;
        doc.set("vote", y);
      }

    }

    //Nel caso la lista completati o in gioco
    if (selectedList !== this.userlists[2].code) {
      if (price <= 0 || price >= 9999) {
        window.alert("Non hai inserito prezzo di acquisto valido");
        return;
      }

      doc.set("price", price);
      //Viene inserita la piattaforma
      doc.set("platform", selectedPlatform);
    }

    //Inserimento documento nel database
    userDoc.collection(selectedList).doc(gameid).set(Object.fromEntries(doc));

    //Aggiornamento tempi di completamento nel catalogo
    if (selectedList == userlist[0].code)
      this.gameCatalogueService.updateCompletedAvg(gameid, 0, time);

    window.alert("e' stato aggiunto il gioco alla lista");
  }

  async RemoveGame(selectedList: string, id: string) {
    
    let userDoc = this.db.doc('Users/'+this.authService.currentUserId);

    if (selectedList === userlist[0].code)
      this.gameCatalogueService.updateCompletedAvg(id, await this.getParam(id, selectedList, "completetime"), 0);

    userDoc.collection(selectedList).doc(id).delete();
  }

  async CheckUniqueList(id: string): Promise<boolean> {
   
    let userDoc = this.db.doc('Users/'+this.authService.currentUserId);

    //Controlli per verificare che il gioco non sia presente gi� in una lista
    for (var i = 0; i < this.userlists.length; i++) {
      if (await userDoc.collection(this.userlists[i].code).doc(id).ref.get().then(
        game => game.exists)) {
        //window.alert("Gioco gia' inserito in lista " + this.userlists[i].name);
        return false;
      }

    }
    return true;
  }

  async UpdateGame(selectedList: string, previousList: string, gameid: string, note: string, time: number, vote: number, selectedPlatform: string, gametitle: string, price: number) {
    let userDoc = this.db.doc('Users/'+this.authService.currentUserId);
    //Genero il documento base per inserire un gioco in una lista
    let doc = new Map<String, any>([
      ["title", gametitle],
      ["note", note]
    ]);


    //Controlli per l'inserimento in lista completati
    if (selectedList === this.userlists[0].code) {
      if (time <= 0 || time > 9999) {
        window.alert("Non hai inserito un tempo di completamento valido");
        return;
      }

      //Nel caso il tempo di completamento sia valido
      doc.set("completetime", time);

      //Nel caso sia stato inserito un voto valido, lo inserisco, altrimenti no essendo opzionale
      if (vote > 0) {
        var y: number = +vote;
        doc.set("vote", y);
      }

    }

    //Nel caso la lista completati o in gioco
    if (selectedList !== this.userlists[2].code) {
      if (price <= 0 && price >= 9999) {
        window.alert("Non hai inserito prezzo di acquisto valido");
        return;
      }

      doc.set("price", price);
      //Viene inserita la piattaforma
      doc.set("platform", selectedPlatform);
    }

    //Inserimento documento nel database
    if (selectedList === previousList) {
      if (selectedList === userlist[0].code)
        this.gameCatalogueService.updateCompletedAvg(gameid, await this.getParam(gameid, selectedList, "completetime"), time);
      userDoc.collection(selectedList).doc(gameid).update(Object.fromEntries(doc));
    }
    else {
      this.RemoveGame(previousList, gameid);
      userDoc.collection(selectedList).doc(gameid).set(Object.fromEntries(doc));

      //Aggiornamento tempi di completamento nel catalogo
      if (selectedList === userlist[0].code)
        this.gameCatalogueService.updateCompletedAvg(gameid, 0, time);
    }
    window.alert("e' stato modificato il gioco");
  }

  async getParam(id: string, list: string, param: string): Promise<any> {
    let userDoc = this.db.doc('Users/'+this.authService.currentUserId);

    return (await userDoc.collection(list).doc(id).ref.get()).get(param);
  }
}
