import { Injectable } from '@angular/core';
import { SelectMultipleControlValueAccessor } from '@angular/forms';
import { Md5 } from "md5-typescript";
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  capitalize(str: string) {
    var cap = "";
    var splitted = str.split(" ");
    for (let s of splitted) {
      cap += s.substring(0, 1).toUpperCase() + s.substring(1) + " ";
    }
    return cap;
  }

  avgTime(games: any[]) {
    let sumTime = 0;
    for (let game of games)
      sumTime += game.payload.doc.data().completetime;

    return sumTime / games.length;
  }

  isValidMailFormat(email: string) {
    const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

    if ((email.length === 0) || (!EMAIL_REGEXP.test(email))) {
      return false;
    }

    return true;
  }

  isValidPswFormat(password: string) {
    return password.length > 6;
  }

  getImgUrl(title: string): string {
    return "assets/" + Md5.init(title) + '.jpg';
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
}
