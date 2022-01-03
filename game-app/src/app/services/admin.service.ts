import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { GameCollectionService } from './game-collection.service';
import { UtilService } from './util.service';
import { userlist } from '../data/userlist/userlist';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private gameCollectionService: GameCollectionService, private db: AngularFirestore, private util: UtilService) { }

  /**
    * Permette di aggiornare o caricare un gioco dal catalogo.
    * Nel caso si tratti di un'aggiunta al catalogo non bisogna specificare il gameid.
    * @returns true nel caso la modifica/aggiunta sia avvenuta correttamente, false altrimenti
  */
  updateGame(title: string, developer: string, price: number, release: Date, publisher: string,
    platform: string[], genre: string[], bio: string, img?: File, progress?: (perc: number) => void, gameid?: string): Promise<boolean> {

    //Tolgo l'orario dalla data
    release = new Date(release.getFullYear(), release.getMonth(), release.getDate());

    let doc = this.db.collection("Games").doc(gameid);

    if (img) {
      //Faccio prima l'upload dell'immagine, in modo che se fallisce non ho sporcato il db.
      //Se img è diverso da null, devo fornire il gameid
      return this.util.uploadFile(this.util.getGameImageChild(doc.ref.id), img, progress)
        .then(r => doc.set({
          title: title, developer: developer, price: price,
          release: release, publisher: publisher, platform: platform, genre: genre, bio: bio
        }).then(() => true).catch(err => false))
        .catch(e => false);
    }
    else
      return doc.update({
        title: title, developer: developer, price: price, release: release,
        publisher: publisher, platform: platform, genre: genre, bio: bio
      }).then(() => true).catch(err => false);
  }

 /**
    * Permette di rimuovere un gioco dal catalogo.
    * Rimuove ogni riferimento a al gioco per ogni Utente, e la relativa immagine di copertina.
    * @returns true nel caso la rimozione sia avvenuta correttamente, false altrimenti
  */
  deleteGame(gameid: string): Promise<boolean> {
    return this.gameCollectionService.getGame(gameid).delete()
      .then(() => {

        //Rimuovo immagine dal child
        firebase.default.storage().ref().child(this.util.getGameImageChild(gameid)).delete();

        //Rimuovo il gioco dalle userlist per ciascun utente
        this.db.collection("Users").get().forEach(users => users.forEach(user => {
          for (let list of userlist)
            this.db.collection("Users/").doc(user.id).collection(list.code).doc(gameid).delete();
        }))
        return true;
      }
      )
      .catch(e => false);
  }

}
