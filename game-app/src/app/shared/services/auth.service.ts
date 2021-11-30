
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import 'firebase/auth';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class AuthService {

  authState: any = null;
  username: string = "";

  constructor(private afAuth: AngularFireAuth, private router: Router, private db: AngularFirestore) {
    this.afAuth.authState.subscribe((auth) => {
      if (auth != null) {
        this.authState = auth;
       this.db.doc("Users/" + this.currentUserId).ref.get().then(data => {
          this.username = data.get("username");
        });
      }
      else
        this.authState = null;
    });
  }

  get isUserAnonymousLoggedIn(): boolean {
    return (this.authState !== null) ? this.authState.isAnonymous : false
  }

  get currentUserId(): string {
    return (this.authState !== null) ? this.authState.uid : ''
  }

  get currentEmail(): string {
    return this.authState['email']
  }

  get currentUserName(): string {
    return this.username
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

  public sendEmailVerification(): void {
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



  async ResetPassword(passwordResetEmail: string) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        //TOGLIERE
        window.alert('Password reset email sent, check your inbox.');
      }).catch((error) => {
        window.alert(error)
      })
  }

  changePassword(code: string, new_psw: string)
  {
    this.afAuth.confirmPasswordReset(code, new_psw);
  }
}