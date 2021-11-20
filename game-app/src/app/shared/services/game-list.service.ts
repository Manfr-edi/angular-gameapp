import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection, DocumentData, Query, DocumentSnapshot, CollectionReference } from '@angular/fire/firestore';

import { userlist } from '../../data/userlist/userlist';
import { AuthService } from '../../shared/services/auth.service';
import { GameCatalogueService } from './game-catalogue.service';
import { UserLoggedService } from './user-logged.service';

@Injectable({
  providedIn: 'root'
})
export class GameListService {

  userlists = userlist;

  constructor(public authService: AuthService, public db: AngularFirestore, public gameCatalogueService: GameCatalogueService,
    public userLoggedService: UserLoggedService) {
     }

  getList(list: string): AngularFirestoreCollection {
    return this.userLoggedService.getUserDoc().collection(list);
  }

  //Questa funzione restituisce la collezione dei giochi presenti in una determinata lista dell'utente attualmente loggato
  //che rispetta dei filtri presentati in ingresso, in particare i filtri sono di uguaglianza e i valori non devono essere nulli.
  getGamesWithEqualFilterNotEmpty(list: string, filter: { par: string; val: any }[]): AngularFirestoreCollection {

    return this.userLoggedService.getUserDoc().collection(list, ref =>
      {
        let a = (ref as Query<DocumentData>);
        if (filter.length > 0)
          for (let f of filter)
            if (f.val !== '')
              a = a.where(f.par, "==", f.val);
        return a;
      });
  }

  async getGameDataFromList(gameid: string, list: string): Promise<any> {
    return (await this.getGameFromList(gameid, list).ref.get());
  }

  getGameFromList(gameid: string, list: string): AngularFirestoreDocument {
    return this.getList(list).doc(gameid);
  }

  async RemoveGame(selectedList: string, id: string) {
    if (selectedList === userlist[0].code)
      this.gameCatalogueService.updateCompletedAvg(id, (await this.getGameDataFromList(id, selectedList)).get("completetime"), 0);
    this.getGameFromList(id, selectedList).delete();
  }

  async CheckUniqueList(id: string): Promise<boolean> {
    for (let l of userlist)
      if ((await this.getGameDataFromList(id, l.code)).exists)
        return false;

    return true;
  }

  async UpdateGame(selectedList: string, previousList: string, gameid: string, gametitle: string, note: string, time: number, vote: number, selectedPlatform: string, genre: string, price: number) {

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
        this.gameCatalogueService.updateCompletedAvg(gameid, (await this.getGameDataFromList(gameid, selectedList)).get("completetime"), time);
      this.getGameFromList(gameid, selectedList).update(Object.fromEntries(doc));
    }
    else {
      if (previousList !== '') //Non si tratta di un'aggiunta, devo rimuovere il gioco dalla lista precedente
        this.RemoveGame(previousList, gameid);

      this.getGameFromList(gameid, selectedList).set(Object.fromEntries(doc));

      //Aggiornamento tempi di completamento nel catalogo
      if (selectedList === userlist[0].code)
        this.gameCatalogueService.updateCompletedAvg(gameid, 0, time);
    }
    window.alert("e' stato modificato il gioco");
  }



}
