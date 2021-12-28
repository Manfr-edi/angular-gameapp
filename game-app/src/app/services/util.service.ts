import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { AbstractControl, Validators } from '@angular/forms';
import * as firebase from 'firebase';
import { CustomValidators } from '../custom-validators';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(public db: AngularFirestore) { }

  /*************************************
   * 
   * 
   *            Util
   * 
   * 
   * 
   * 
   **************************************/

  getMsgTime(timestamp: firebase.default.firestore.Timestamp) {

    if (timestamp != null) {
      let diff = (new Date().getTime() / 1000) - timestamp.seconds; //Tempo trascorso in secondi

      function calculate(div: number, t: string) {
        let m = diff / div;
        let o = Math.round(m) + t + " fa";

        if (Math.floor(m) > 0.5)
          o = "< " + o;
        return o;
      }

      if (diff < 1)
        return "ora";

      //Tempo minore di un minuto
      if (diff < 60)
        return calculate(1, 's');

      //Tempo minore di un ora
      if (diff < 60 * 60)
        return calculate(60, 'm');

      //Tempo minore di un giorno
      if (diff < 60 * 60 * 24)
        return calculate(60 * 60, 'h');

      //Per il resto vado in gioni
      return calculate(60 * 60 * 24, 'g');
    }

    return "";
  }

  getDateFormat(): string {
    return 'dd/MM/YYYY';
  }

  /*************************************
   * 
   * 
   *            File e Immagini
   * 
   * 
   * 
   * 
   **************************************/

  /*
    Questo metodo si occupa di caricare un file sul Cloud Storage
  */
  uploadFile(childName: string, file: File, progress?: (perc: number) => void): Promise<boolean> {
    let uploadTask = firebase.default.storage().ref().child(childName).put(file);

    uploadTask.on('state_changed', snapshot => { //Upload in progress
      if (progress)
        progress(snapshot.bytesTransferred / snapshot.totalBytes * 100)
    },
      err => {
        return null;
      },
      () => { //Upload riuscito
      })

    return uploadTask.then(() => true).catch(err => false);
  }

  deleteFile(childName: string) {
    return firebase.default.storage().ref().child(childName).delete();
  }

  loadUserListImgUrls(list: AngularFirestoreCollection<DocumentData>): Promise<Map<string, string>> {
    let map: Map<string, string> = new Map;
    return list.get().forEach(us => us.forEach(u =>
      this.getUserImageUrl(u.id).then(url => {
        if (url)
          map.set(u.id, url)
      }))).then(() => map)
  }

  loadGameListImgUrls(list: AngularFirestoreCollection<DocumentData>): Promise<Map<string, string>> {
    let map: Map<string, string> = new Map;
    return list.get().forEach(us => us.forEach(u =>
      this.getGameImageUrl(u.id).then(url => {
        if (url)
          map.set(u.id, url)
      }))).then(() => map)
  }

  /*
    Questo metodo restituisce l'url dell'immagine dell'utente se essa esiste, altrimenti restituisce undefined
  */
  getUserImageUrl(userid: string): Promise<string | undefined> {
    return firebase.default.storage().ref(this.getUserImageChild(userid)).getDownloadURL()
      .then(s => s)
      .catch(e => undefined);
  }

  getGameImageChild(gameid: string): string {
    return "Games/" + gameid + '.jpg';
  }

  getGameImageUrl(gameid: string): Promise<string> {
    return firebase.default.storage().ref(this.getGameImageChild(gameid)).getDownloadURL();
  }

  getUserImageChild(userid: string): string {
    return "Users/" + userid + ".jpg";
  }

  /*************************************
   * 
   * 
   *            Utente
   * 
   * 
   * 
   * 
   **************************************/

  searchUserByEmail(email: string) {
    return this.db.collection('Users', ref => this.searchByField(ref, "email", email));
  }

  searchUser(username: string): AngularFirestoreCollection<DocumentData> {
    return this.db.collection('Users', ref => this.searchByField(ref, "username", username));
  }

  //Questa funzione effettua la ricerca mediante un campo
  searchByField(ref: CollectionReference<DocumentData>, fieldname: string, fieldval: string) {
    return ref.where(fieldname, '>=', fieldval).where(fieldname, '<=', fieldval + '\uf8ff');
  }

  /*************************************
   * 
   * 
   *            Giochi
   * 
   * 
   * 
   * 
   **************************************/

  avgCompleteTime(games: any[]) {
    if (!games || games.length == 0) {
      return 0;
    }
    let sumTime = 0;
    for (let game of games)
      sumTime += game.payload.doc.data().completetime;

    return Math.round((sumTime / games.length) * 100) / 100;
  }

  capitalize(str: string) {
    var cap = "";
    var splitted = str.split(" ");
    for (let s of splitted) {
      cap += s.substring(0, 1).toUpperCase() + s.substring(1) + " ";
    }
    return cap;
  }

  /*************************************
   * 
   * 
   *            Validators
   * 
   * 
   * 
   * 
   **************************************/

  /*
    Questo metodo restituisce i Validators necessari a controllare la struttura della password
  */
  getPasswordValidators() {
    return Validators.compose([Validators.minLength(6)]);
  }

  passwordFieldErrorParameters(): Map<string, string> {
    return new Map([["minLength", "6"]]);
  }

  /*
    Questo metodo restituisce i Validators necessari a controllare la struttura dell'username
  */
  getUsernameValidators() {
    return Validators.compose([Validators.minLength(6)]);
  }

  usernameFieldErrorParameters(): Map<string, string> {
    return new Map([["minLength", "6"]]);
  }

  /*
   Questo metodo restituisce i Validators necessari a controllare la struttura del prezzo di un videogioco
 */
  getPriceValidators() {
    return Validators.compose([Validators.min(0.01), Validators.max(9999),
    CustomValidators.max2DecimalValidator()]);
  }

  priceFieldErrorParameters(): Map<string, string> {
    return new Map([['min', "0.01"], ['max', "9999"]]);
  }

  /*
   Questo metodo restituisce i Validators necessari a controllare la struttura del tempo di completamento di un videogioco
 */
  getCompletedTimeValidators() {
    return Validators.compose([Validators.min(0.01), Validators.max(9999),
    CustomValidators.max2DecimalValidator()]);
  }

  completedTimeFieldErrorParameters(): Map<string, string> {
    return new Map([['min', "0.01"], ['max', "9999"]]);
  }

  getFieldMsgError(field: AbstractControl, name: string, parameter?: Map<string, string>): string | undefined {

    if (field.hasError('required'))
      return name + " è obbligatorio!";
    else
      if (field.hasError('min'))
        return name + " deve essere almeno maggiore di " + parameter?.get('min');
      else
        if (field.hasError('max'))
          return name + " non può essere maggiore di " + parameter?.get('max');
        else
          if (field.hasError("minlength"))
            return name + " deve essere lungo almeno " + parameter?.get('minLength');
          else
            if (field.hasError("maxlength"))
              return name + " deve eserre lungo al massimo " + parameter?.get('maxLength');
            else
              if (field.hasError("email"))
                return name + " non è un'email valida!";

    return undefined;
  }


}



