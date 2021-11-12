import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { userlist } from '../../data/userlist/userlist';
import { AuthService } from '../../shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GameListService {

  game: any;
  userlists = userlist;

  constructor(public authService: AuthService, public db: AngularFirestore) {
    this.game = db.collection('Games');
  }


  async AddGame(selectedList: string, gameid: string, gametitle: string, note: string, time: number, vote: number, selectedPlatform: string, genre: string, price: number) {

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
      ["genre", genre],
      ["price", price]
    ]);

    //Controlli per l'inserimento in lista completati
    if (selectedList === this.userlists[0].code) {
      if (time <= 0 || time > 9999) {
        window.alert("Non hai inserito un tempo di completamento valido");
        return;
      }

      //Nel caso il tempo di completamento sia valido
      doc.set("CompleteTime", time);

      //Viene inserita la piattaforma
      doc.set("platform", selectedPlatform);

      //Nel caso sia stato inserito un voto valido, lo inserisco, altrimenti no essendo opzionale
      if (vote > 0) {
        var y: number = +vote;
        doc.set("Vote", y);
      }

    }

    //Inserimento documento nel database
    ref.collection(selectedList).doc(gameid).set(Object.fromEntries(doc));
    window.alert("e' stato aggiunto il gioco alla lista");
  }

  RemoveGame(selectedList: string, id: string) {
    this.db.collection('Users').doc(this.authService.currentUserId).collection(selectedList).doc(id).delete();
  }

  async CheckUniqueList(id: string): Promise<boolean> {
    //Riferimento al documento relativo all'utente loggato
    var ref = this.db.collection("Users").doc(this.authService.currentUserId);
    //Controlli per verificare che il gioco non sia presente già in una lista
    for (var i = 0; i < this.userlists.length; i++) {
      if (await ref.collection(this.userlists[i].code).doc(id).ref.get().then(
        game => game.exists)) {
        //window.alert("Gioco gia' inserito in lista " + this.userlists[i].name);
        return false;
      }

    }
    return true;
  }

  async UpdateGame(selectedList: string, previousList: string, gameid: string, note: string, time: number, vote: number, selectedPlatform: string, gametitle: string) {

    //Riferimento al documento relativo all'utente loggato
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

      //Viene inserita la piattaforma
      doc.set("platform", selectedPlatform);

      //Nel caso sia stato inserito un voto valido, lo inserisco, altrimenti no essendo opzionale
      if (vote > 0) {
        var y: number = +vote;
        doc.set("Vote", y);
      }

    }

    //Inserimento documento nel database
    if (selectedList === previousList)
      ref.collection(selectedList).doc(gameid).update(Object.fromEntries(doc));
    else {
      console.log("CANCELLO" + selectedList + previousList)
      this.RemoveGame(previousList, gameid);
      ref.collection(selectedList).doc(gameid).set(Object.fromEntries(doc));
    }
    window.alert("e' stato modificato il gioco");
  }
}
