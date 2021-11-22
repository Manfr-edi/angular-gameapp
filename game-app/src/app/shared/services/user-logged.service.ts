import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentData } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { GameListService } from './game-list.service';
import { userlist } from 'src/app/data/userlist/userlist';




@Injectable({
providedIn: 'root'
})
export class UserLoggedService {



userDoc: AngularFirestoreDocument;
userlists = userlist



constructor(public db: AngularFirestore, public authService: AuthService) {
this.userDoc = db.doc('Users/' + this.authService.currentUserId);
}



getUserDoc() {
return this.userDoc;
}



async getDataParam(par: string): Promise<any> {
return (await this.userDoc.ref.get()).get(par);
}



update(data: Partial<DocumentData>) {
this.userDoc.update(data);
}




}