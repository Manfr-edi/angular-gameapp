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

  /**
    * Questo costruttore permette di reagire alle modifiche di authState permettendo di avere le informazioni
    * riguardo l'utente sempre aggiornate.
  */
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

  /**
    * Permette di inoltrare un'email di verifica all'utente attualmente loggato.
  */
  public sendEmailVerification(): void {
    this.authState?.sendEmailVerification();
  }

  /**
    * Permette la registrazione di un utente mediante username, email e password.
    * @returns Restituisce un errore oppure undefined che rappresenta l'avvenuta registrazione
  */
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

  /**
    * Permette il login di un utente mediante email e password.
    * @returns Restituisce un errore oppure undefined che rappresenta l'avvenuta registrazione
  */
  loginWithEmail(email: string, password: string): Promise<AuthError | undefined> {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then(async (data) => {
        await this.getDataAdminUser(data.user!.uid).then(() => this.authState = data.user)
        return undefined;
      })
      .catch(err => this.getError(err.code));
  }

  /**
    * Permette il logout di un utente invalidando la sessione corrente.
  */
  signOut(): void {
    this.afAuth.signOut().then(() => {
      this.authState = null;
      this.username = "";
      this.isadmin = false;
    })
  }

  /**
    * Permette di inviare un'email di reset password all'utente correntemente loggato.
    * @returns Restituisce un errore oppure undefined che rappresenta il corretto invio dell'email
  */
  resetPassword(passwordResetEmail: string): Promise<AuthError | undefined> {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
      .then(() => undefined)
      .catch(err => this.getError(err.code));
  }

  /**
    * Permette cambiare la password attraverso l'uso del codice ricevuto mediante email di reset.
    * @returns Restituisce un errore oppure undefined che rappresenta il corretto cambiamento della password.
  */
  changePassword(code: string, new_psw: string): Promise<AuthError | undefined> {
    return this.afAuth.confirmPasswordReset(code, new_psw)
      .then(() => undefined)
      .catch(e => this.getError(e.code));
  }

  /**
    * Permette di verificare l'email dell'utente attualmente loggato.
  */
  verifyEmail(code: string) {
    return this.afAuth.applyActionCode(code)
      .then(() => undefined)
      .catch(err => this.getError(err.code));;
  }

  /**
    * Trasforma il codice di errore di Auth in un oggetto AuthError
    * @returns Oggetto AuthError corrispondende all'errore presentato in ingresso
  */
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

  /**
    * Per l'userid presentato in ingresso verifica che esso sia un Admin e ne preleva l'username.
  */
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