import { Injectable } from '@angular/core';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { GameCatalogueService } from './game-catalogue.service';

@Injectable({
  providedIn: 'root'
})
export class FriendListService {

userDoc : AngularFirestoreDocument;

  constructor(public authService: AuthService, public db: AngularFirestore, public gameCatalogueService: GameCatalogueService) {
    this.userDoc = this.db.doc('Users/'+this.authService.currentUserId);
  }

  AddFriend(id: string, username: string): void{
    this.userDoc.collection("Friends").doc(id).set({username: username});

  }

  RemoveFriend(id: string): void{
    this.userDoc.collection("Friends").doc(id).delete();
  }
  
}
