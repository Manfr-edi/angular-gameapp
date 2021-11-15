import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, QuerySnapshot, DocumentData } from '@angular/fire/firestore';

import { userlist } from '../../data/userlist/userlist';
import { AuthService } from '../../shared/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameListService {

  game: any;
  //Riferimento al documento relativo all'utente loggato
  userDoc: AngularFirestoreDocument<any>;

  userlists = userlist;

  
  constructor(public authService: AuthService, public db: AngularFirestore) {
    this.game = db.collection('Games');
    this.userDoc = this.db.collection("Users").doc(this.authService.currentUserId);
  }


  async AddGame(selectedList: string, gameid: string, gametitle: string, note: string, time: number, vote: number, selectedPlatform: string, genre: string, price: number) {

    console.log(price);
    //Riferimento al documento relativo all'utente loggato
    var ref = this.db.collection("Users").doc(this.authService.currentUserId);

    //if( this.CheckUniqueList(gameid)){return;}
    if (await this.CheckUniqueList(gameid).then(result => !result)) {
      //TODO:SI PUO RIAGGIUNGERE A QUALE LISTA ERA INSERITO?
      window.alert("Gioco gia' inserito in un'altra lista ");
      return
    }

    //Genero il documento base per inserire un gioco in una lista
    let doc = new Map<String, any>([
      ["title", gametitle],
      ["Note", note],
      ["genre", genre]
    ]);

    //Controlli per l'inserimento in lista completati
    if (selectedList === this.userlists[0].code) {
      if (time <= 0 || time > 9999) {
        window.alert("Non hai inserito un tempo di completamento valido");
        return;
      }

      //Nel caso il tempo di completamento sia valido
      doc.set("CompleteTime", time);

      //Nel caso sia stato inserito un voto valido, lo inserisco, altrimenti no essendo opzionale
      if (vote > 0) {
        var y: number = +vote;
        doc.set("Vote", y);
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
    this.userDoc.collection(selectedList).doc(gameid).set(Object.fromEntries(doc));
    window.alert("e' stato aggiunto il gioco alla lista");
  }

  RemoveGame(selectedList: string, id: string) {
    this.userDoc.collection(selectedList).doc(id).delete();
  }

  async CheckUniqueList(id: string): Promise<boolean> {
    //Riferimento al documento relativo all'utente loggato
    var ref = this.db.collection("Users").doc(this.authService.currentUserId);
    //Controlli per verificare che il gioco non sia presente già in una lista
    for (var i = 0; i < this.userlists.length; i++) {
      if (await this.userDoc.collection(this.userlists[i].code).doc(id).ref.get().then(
        game => game.exists)) {
        //window.alert("Gioco gia' inserito in lista " + this.userlists[i].name);
        return false;
      }

    }
    return true;
  }

  async UpdateGame(selectedList: string, previousList: string, gameid: string, note: string, time: number, vote: number, selectedPlatform: string, gametitle: string, price: number) {

    
    var ref = this.db.collection("Users").doc(this.authService.currentUserId);

    //Genero il documento base per inserire un gioco in una lista
    let doc = new Map<String, any>([
      ["title", gametitle],
      ["Note", note]
    ]);


    //Controlli per l'inserimento in lista completati
    if (selectedList === this.userlists[0].code) {
      if (time <= 0 || time > 9999) {
        window.alert("Non hai inserito un tempo di completamento valido");
        return;
      }

      //Nel caso il tempo di completamento sia valido
      doc.set("CompleteTime", time);



      //Nel caso sia stato inserito un voto valido, lo inserisco, altrimenti no essendo opzionale
      if (vote > 0) {
        var y: number = +vote;
        doc.set("Vote", y);
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
    if (selectedList === previousList)
      this.userDoc.collection(selectedList).doc(gameid).update(Object.fromEntries(doc));
    else {
      this.RemoveGame(previousList, gameid);
      this.userDoc.collection(selectedList).doc(gameid).set(Object.fromEntries(doc));
    }
    window.alert("e' stato modificato il gioco");
  }

  async AvgTime(gameid: string): Promise<number> {
    let sum = 0;
    let count = 0;
    var userlength = 0;

    var query: Promise<QuerySnapshot<DocumentData>>;
    await this.db.collection("Users").ref.get().then(u => {userlength = u.size});
    
    const querySnapshot =  (await this.db.collection("Users").ref.get()).forEach(function (doc){doc.ref.collection("Completed").doc(gameid).get().then(game => game.exists)
    {
       doc.ref.collection("Completed").doc(gameid).get().then(game =>  console.log(game.get("CompleteTime")));
    }
  })
  return sum;


  }
}
