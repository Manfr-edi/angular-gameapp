import { Injectable } from '@angular/core';

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


}
