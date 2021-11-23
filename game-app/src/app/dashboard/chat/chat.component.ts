import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators'
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/shared/services/auth.service';

import * as firebase from 'firebase';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  inserisci = false;
  users$: Observable<any[]> = new Observable;

  idFriend = "";
  idCurChat: string | undefined = "";
  mex: string = "";

  mostraChat = false;

  messaggi$: Observable<any> = new Observable;
  chats$: Observable<any> = new Observable;

  constructor(public db: AngularFirestore, public authService: AuthService) { }

  ngOnInit(): void {
    const coll1 = this.db.collection("Chats", ref => ref.where("user1", "==", this.authService.currentUserId)).snapshotChanges();
    const coll2 = this.db.collection("Chats", ref => ref.where("user2", "==", this.authService.currentUserId)).snapshotChanges();

    this.chats$ = combineLatest<any[]>(coll1, coll2).pipe(map(arr => arr.reduce((acc, cur) => acc.concat(cur))));
  }

  onKey(event: any) {
    let username = event.target.value.toLowerCase();

    this.users$ = username !== "" ? this.db.collection("Users/" + this.authService.currentUserId + "/Friends/", ref =>
      ref.where('username', '>=', username).where('username', '<=', username + '\uf8ff')).snapshotChanges() : new Observable;

  }

  async avviaChat(id: string) {
    this.inserisci = false;
    this.users$ = new Observable;

    this.idFriend = id;


    if ((await this.db.collection("Chats").ref.where("user1", "==", this.authService.currentUserId).where("user2", "==", id).get()).empty)
      if ((await this.db.collection("Chats").ref.where("user2", "==", this.authService.currentUserId).where("user1", "==", id).get()).empty) {
        let doc = this.db.collection("Chats").doc();
        await doc.set({ user1: this.authService.currentUserId, user2: id });

        this.idCurChat = doc.ref.id
      }
      else
        this.idCurChat = (await this.db.collection("Chats").ref.where("user2", "==", this.authService.currentUserId).where("user1", "==", id).get()).docs.pop()?.id;
    else
      this.idCurChat = (await this.db.collection("Chats").ref.where("user1", "==", this.authService.currentUserId).where("user2", "==", id).get()).docs.pop()?.id;


    this.messaggi$ = this.db.doc("Chats/" + this.idCurChat).collection("messaggi", ref => ref.orderBy("time")).snapshotChanges();
    this.mostraChat = true;
  }

  async apriChat(idChat: string) {
    this.inserisci = false;
    this.users$ = new Observable;

    this.idCurChat = idChat;


    this.messaggi$ = this.db.doc("Chats/" + this.idCurChat).collection("messaggi", ref => ref.orderBy("time")).snapshotChanges();
    this.mostraChat = true;
  }

  inviaMex() {
    if (this.mex !== '') {
      this.db.doc("Chats/" + this.idCurChat).collection("messaggi").doc().set(
        { mex: this.mex, time: firebase.default.firestore.FieldValue.serverTimestamp(), sender: this.authService.currentUserId });
      this.mex = "";
    }
    else
      window.alert("Impossibile mandare un messaggio vuoto");

  }
}
