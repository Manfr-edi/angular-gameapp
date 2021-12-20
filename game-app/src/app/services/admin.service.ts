import { Platform } from '@angular/cdk/platform';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { GameCollectionService } from './game-collection.service';
import * as firebase from 'firebase';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(public gameCollectionService: GameCollectionService, private db: AngularFirestore, private util: UtilService) { }

  deleteGame(gameid: string): Promise<boolean> {
    return this.gameCollectionService.getGame(gameid).delete()
      .then(() => true)
      .catch(e => false);
  }

  updateGame(title: string, developer: string, price: number, release: Date, publisher: string,
    platform: string[], genre: string[], bio: string, img: File, progress?: (perc: number) => void, gameid?: string): Promise<boolean> {

    let doc = this.db.collection("Games").doc(gameid);

    //Faccio prima l'upload dell'immagine, in modo che se fallisce non ho sporcato il db.
    return this.uploadGameImg(doc.ref.id, img, progress)
      .then(r =>
        doc.set({
          title: title, developer: developer, price: price,
          release: release, publisher: publisher, platform: platform, genre: genre, bio: bio
        }).then(() => true).catch(err => false))
      .catch(e => false);
  }

  private uploadGameImg(gameid: string, img: File, progress?: (perc: number) => void): Promise<boolean> {
    let uploadTask = firebase.default.storage().ref().child(this.util.getGameImageChild(gameid)).put(img);

    uploadTask.on('state_changed', snapshot => { //Upload in progress
      if (progress)
        progress(snapshot.bytesTransferred / snapshot.totalBytes * 100)
    },
      err => {
        return null;
      },
      () => { //Upload riuscito
        //uploadTask.snapshot.ref.getDownloadURL().then(url => { this.imgUrl = url });
      })

    return uploadTask.then(() => true).catch(err => false);
  }
}
