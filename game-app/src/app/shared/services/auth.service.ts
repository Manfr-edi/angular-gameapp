
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import 'firebase/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable()
export class AuthService {

  authState: any = null;

  constructor(private afAuth: AngularFireAuth, private router: Router, private db: AngularFirestore) {
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
    return ((this.authState !== null) && (!this.isUserAnonymousLoggedIn));
  }

  get isUserEmailVerified(): boolean {
    return (this.isUserEmailLoggedIn && this.authState?.emailVerified);
  }

  public sendEmailVerification(): void{
    this.authState?.sendEmailVerification();
  }

  async signUpWithEmail(username: string, email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password)
      .then((data) => {
        this.authState = data.user;
        this.db.collection("Users").doc(data.user?.uid).set({
          username: username,
          email: email
        });
        data.user?.sendEmailVerification();
      })
      .catch(error => {
        throw error
      });
  }


  async loginWithEmail(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then((data) => {
        this.authState = data.user;
      })
      .catch(error => {
        throw error
      });
  }

  signOut(): void {
    this.afAuth.signOut();
    this.router.navigate(['/'])
  }



  async ForgotPassword(passwordResetEmail: string) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
      .then(() => {

        //TOGLIERE
        window.alert('Password reset email sent, check your inbox.');
      }).catch((error) => {
        window.alert(error)
      })
  }
}