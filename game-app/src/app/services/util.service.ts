import { Injectable } from '@angular/core';
import { Md5 } from "md5-typescript";
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import { AbstractControl, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { AngularFirestore, CollectionReference, DocumentData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(public db: AngularFirestore) { }

  searchUserByEmail(email: string) {
    return this.db.collection('Users', ref => this.searchByField(ref, "email", email));
  }

  searchUser(username: string) {
    return this.db.collection('Users', ref => this.searchByField(ref, "username", username));
  }

  //Questa funzione effettua la ricerca mediante un campo
  searchByField(ref: CollectionReference<DocumentData>, fieldname:string, fieldval: string) {
    return ref.where(fieldname, '>=', fieldval).where(fieldname, '<=', fieldval + '\uf8ff');
  }

  capitalize(str: string) {
    var cap = "";
    var splitted = str.split(" ");
    for (let s of splitted) {
      cap += s.substring(0, 1).toUpperCase() + s.substring(1) + " ";
    }
    return cap;
  }

  avgTime(games: any[]) {
    if (!games || games.length == 0) {
      return 0;
    }
    let sumTime = 0;
    for (let game of games)
      sumTime += game.payload.doc.data().completetime;

    return Math.round((sumTime / games.length)*100)/100;
  }

  getGameImgUrl(title: string): string {
    return "assets/Games/" + Md5.init(title) + '.jpg';
  }

  getMsgTime(timestamp: Timestamp) {

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

  /*
    Questo metodo restituisce i Validators necessari a controllare la struttura della password
  */
  getPasswordValidators() {
    return Validators.compose([Validators.minLength(6)]);
  }

  passwordFieldErrorParameters() : Map<string,string> {
    return new Map([["minLength", "6"]]);
  }

  /*
    Questo metodo restituisce i Validators necessari a controllare la struttura dell'username
  */
  getUsernameValidators() {
    return Validators.compose([Validators.minLength(6)]);
  }

  usernameFieldErrorParameters() : Map<string,string> {
    return new Map([["minLength", "6"]]);
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
              if( field.hasError("email") )
                return name + " non è un'email valida!";

    return undefined;
  }

}



