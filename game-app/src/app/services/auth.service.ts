import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import 'firebase/auth';

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
  isadmin: boolean = false;

  isLoading: boolean = false;

  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore) {
    this.afAuth.authState.subscribe(async auth => {
      this.isLoading = true;
      if (auth != null)
        await this.getDataAdminUser(auth.uid).then(() => this.authState = auth);
      else
        this.authState = null;
      this.isLoading = false;
    });
  }

  get isLoadingUserInfo(): boolean {
    return this.isLoading;
  }

  get currentUserId(): string {
    return (this.authState !== null) ? this.authState.uid : ''
  }

  get currentEmail(): string {
    return this.authState['email']
  }

  get currentUsername(): string {
    return this.username
  }

  get currentUser(): any {
    return this.authState !== null ? this.authState : null;
  }

  get isLogged(): boolean {
    return this.authState != null;
  }

  get isUserEmailLoggedIn(): boolean {
    return this.authState !== null && !this.isadmin;
  }

  get isUserEmailVerified(): boolean {
    return this.isUserEmailLoggedIn && this.authState?.emailVerified;
  }

  get isAdmin(): boolean {
    return this.authState !== null && this.isadmin;
  }

  public sendEmailVerification(): void {
    this.authState?.sendEmailVerification();
  }

  signUpWithEmail(username: string, email: string, password: string): Promise<AuthError | undefined> {
    return this.afAuth.createUserWithEmailAndPassword(email, password)
      .then((data) => {
        this.authState = data.user;
        this.db.collection("Users").doc(data.user?.uid).set({
          username: username,
          email: email
        });
        data.user?.sendEmailVerification();

        return undefined;
      })
      .catch(err => this.getError(err.code));
  }

  loginWithEmail(email: string, password: string): Promise<AuthError | undefined> {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then(async (data) => {
        await this.getDataAdminUser(data.user!.uid).then(() => this.authState = data.user)
        return undefined;
      })
      .catch(err => this.getError(err.code));
  }

  signOut(): void {
    this.afAuth.signOut().then(() => {
      this.authState = null;
      this.username = "";
      this.isadmin = false;
    })
  }

  resetPassword(passwordResetEmail: string): Promise<AuthError | undefined> {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
      .then(() => undefined)
      .catch(err => this.getError(err.code));
  }

  changePassword(code: string, new_psw: string): Promise<AuthError | undefined> {
    return this.afAuth.confirmPasswordReset(code, new_psw)
      .then(() => undefined)
      .catch(e => this.getError(e.code));
  }

  verifyEmail(code: string) {
    return this.afAuth.applyActionCode(code)
      .then(() => undefined)
      .catch(err => this.getError(err.code));;
  }

  private getError(code: string): AuthError {
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

  private async getDataAdminUser(userid: string) {
    await this.db.doc("Admins/" + userid).ref.get().then(data => {

      if (data.exists) //Admin
      {
        this.isadmin = true;
        this.db.doc("Admins/" + userid).ref.get().then(data => this.username = data.get("username"));
      }
      else { //User
        this.isadmin = false;
        this.db.doc("Users/" + userid).ref.get().then(data => this.username = data.get("username"));
      }
    });
  }

}