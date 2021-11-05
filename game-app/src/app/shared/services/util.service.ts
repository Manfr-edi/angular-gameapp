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
}
