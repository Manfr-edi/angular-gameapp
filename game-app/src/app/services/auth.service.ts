
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import 'firebase/auth';
import { AngularFirestore } from '@angular/fire/firestore';

enum AuthError {
  CodeError,
  GeneralError,
  EmailError,
  WrongPsw
}

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

  async signUpWithEmail(username: string, email: string, password: string): Promise<AuthError | undefined> {
    return this.afAuth.createUserWithEmailAndPassword(email, password)
      .then((data) => {
        this.authState = data.user;
        return this.db.collection("Users").doc(data.user?.uid).set({
          username: username,
          email: email
        }).then(() => { data.user?.sendEmailVerification(); return undefined; }).catch(
          err => undefined)
          .catch(err => AuthError.GeneralError);
      })
      .catch(err => this.getError(err.code));
  }


  async loginWithEmail(email: string, password: string): Promise<AuthError | undefined> {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then((data) => {
        this.authState = data.user;
        return undefined;
      })
      .catch(err => this.getError(err.code));
  }

  signOut(): void {
    this.afAuth.signOut();
    this.router.navigate(['/'])
  }

  async ResetPassword(passwordResetEmail: string): Promise<AuthError | undefined> {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
      .then(() => undefined)
      .catch(err => this.getError(err.code));
  }

  async changePassword(code: string, new_psw: string): Promise<AuthError | undefined> {
    return this.afAuth.confirmPasswordReset(code, new_psw).then(() => undefined)
      .catch(e => this.getError(e.code));
  }

  verifyEmail(code: string) {
    return this.afAuth.applyActionCode(code).then(() => undefined)
      .catch(err => this.getError(err.code));;
  }

  private getError(code: string): AuthError {
    console.log("ErroreCode: " + code);
    switch (code) {
      case "auth/expired-action-code":
      case "auth/invalid-action-code":
        return AuthError.CodeError;

      case "auth/user-disabled":
      case "auth/user-not-found":
      case "auth/operation-not-allowed":
      case "auth/weak-password":
        return AuthError.GeneralError;

      //signUpWithEmail
      case "auth/email-already-in-use":
      case "auth/invalid-email":
        return AuthError.EmailError;

      case "auth/wrong-password":
        return AuthError.WrongPsw;

      default:
        return AuthError.GeneralError;
    }
  }
}