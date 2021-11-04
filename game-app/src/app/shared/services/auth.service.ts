
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFireAuth} from '@angular/fire/auth';
import firebase from 'firebase/app';
import 'firebase/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';

enum loginstate {SUCCESS, FALIED, UNVERIFIED};

@Injectable()
export class AuthService {

  authState: any = null;
 
  constructor(private afAuth: AngularFireAuth, private router: Router, private fdb: AngularFirestore) {
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  get isUserAnonymousLoggedIn(): boolean {
    return (this.authState !== null) ? this.authState.isAnonymous : false
  }

  get currentUserId(): string {
    return (this.authState !== null) ? this.authState.uid : ''
  }

  get currentUserName(): string {
    return this.authState['email']
    
  }

  get currentUser(): any {
    return (this.authState !== null) ? this.authState : null;
  }

  get isUserEmailLoggedIn(): boolean {
    if ((this.authState !== null) && (!this.isUserAnonymousLoggedIn)) {
      return true
    } else {
      return false
    }
  }


  signUpWithEmail(username:string, email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password)
      .then((data) => {
        this.authState = data.user;
        console.log(data.user?.uid)        
			  this.fdb.collection("Users").doc(data.user?.uid).set({ 
                                  username: username,
                                  email: email });
        data.user?.sendEmailVerification();
        //this.authState = userCredential;
        //userCredential.user?.sendEmailVerification();
        //window.alert('Abbiamo inviato una mail di verifica');
      
      })
      .catch(error => {
        console.log(error)
        throw error
      });
  }


  loginWithEmail(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then((data) => {      
        this.authState = data.user;
        if(!data.user?.emailVerified){
          this.signOut();
          throw new Error("L'email non e' verificata");                
        }
      })
      .catch(error => {
        console.log(error)
        throw error
      });
  }

  signOut(): void {
    this.afAuth.signOut();
    this.router.navigate(['/'])
  }



   ForgotPassword(passwordResetEmail: string) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      window.alert('Password reset email sent, check your inbox.');
    }).catch((error) => {
      window.alert(error)
    })
  }
}