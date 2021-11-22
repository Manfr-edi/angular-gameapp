import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentData } from '@angular/fire/firestore';
import { AuthService } from './auth.service';



@Injectable({
providedIn: 'root'
})
export class UserLoggedService {



userDoc: AngularFirestoreDocument;



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