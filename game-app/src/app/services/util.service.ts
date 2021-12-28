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

  /**
    * Restituisce il tempo trascorso dal momemto della chiamate ed un timestamp in una stringa del tipo
    * '2 ore fa'.
    * @param {firebase.default.firestore.Timestamp} timestamp tempo
    * @returns stringa che rappresenta il tempo trascorso
    */
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

  /**
    * Restituisce il formato dell'ora che viene utilizzato in tutta l'applicazione.
    * @returns 'dd/MM/YYYY'
    */
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

  /**
    * Permette di caricare un file su Clound Storage.
    * @param {string} childName nome che avrà la risorsa sul Cloud Storage
    * @param {File} file file che viene caricato sul Cloud Storage
    * @param { (perc: number) => void} progress funzione che viene richiamata ogni qualvolta si aggiorna la percentuale
    * di caricamento del file.
    * @returns true nel caso il file sia stato caricato correttamente, false altrimenti
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

  /**
    * Permette di cancellare un file dal Clound Storage.
    * @param {string} childName nome della risorsa sul Cloud Storage
    * @returns true nel caso il file sia stato cancellato correttamente, false altrimenti
    */
  deleteFile(childName: string): Promise<boolean> {
    return firebase.default.storage().ref().child(childName).delete().then(() => true).catch(e => false)
  }

  /**
    * Restituisce la lista degli URL delle immagini di profilo di una lista di utenti presentata in ingresso.
    * @param {AngularFirestoreCollection<DocumentData>} list lista di utenti
    * @returns una mappa che ha per chiavi l'insieme dei userid e per valore il corrispondende url, se presente
    */
  loadUserListImgUrls(list: AngularFirestoreCollection<DocumentData>): Promise<Map<string, string>> {
    let map: Map<string, string> = new Map;
    return list.get().forEach(us => us.forEach(u =>
      this.getUserImageUrl(u.id).then(url => {
        if (url)
          map.set(u.id, url)
      }))).then(() => map)
  }

  /**
    * Restituisce la lista degli URL delle immagini di copertina di una lista di giochi presentata in ingresso.
    * @param {AngularFirestoreCollection<DocumentData>} list lista di giochi
    * @returns una mappa che ha per chiavi l'insieme dei gameid e per valore il corrispondende url
    */
  loadGameListImgUrls(list: AngularFirestoreCollection<DocumentData>): Promise<Map<string, string>> {
    let map: Map<string, string> = new Map;
    return list.get().forEach(us => us.forEach(u =>
      this.getGameImageUrl(u.id).then(url => {
        map.set(u.id, url)
      }))).then(() => map)
  }

  /**
    * Restituisce il nome della risorsa rappresentativa dell'immagine di profilo di un utente presente sul Cloud Storage
    * @param {string} userid id dell'utente
    * @returns nome della risorsa rappresentativa dell'immagine di profilo di un utente
    */
  getUserImageChild(userid: string): string {
    return "Users/" + userid + ".jpg";
  }

  /**
     * Restituisce l'URL dell'immagine di profilo di un utente se presente.
     * @param {string} userid id dell'utente
     * @returns url dell'immagine del profilo dell'utente se presente, altrimenti undefined
     */
  getUserImageUrl(userid: string): Promise<string | undefined> {
    return firebase.default.storage().ref(this.getUserImageChild(userid)).getDownloadURL()
      .then(s => s)
      .catch(e => undefined);
  }

  /**
    * Restituisce il nome della risorsa rappresentativa dell'immagine di copertina di un gioco presente sul Cloud Storage
    * @param {string} gameid id del gioco
    * @returns nome della risorsa rappresentativa dell'immagine di copertina di un gioco
    */
  getGameImageChild(gameid: string): string {
    return "Games/" + gameid + '.jpg';
  }

  /**
    * Restituisce l'URL dell'immagine di copertina di un gioco.
    * @param {string} gameid id del gioco
    * @returns url dell'immagine di copertina del gioco
    */
  getGameImageUrl(gameid: string): Promise<string> {
    return firebase.default.storage().ref(this.getGameImageChild(gameid)).getDownloadURL();
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

  /**
    * Effettua la ricerca degli utenti mediante il loro indirizzo email.
    * @param {string} email email utilizzata per la ricerca
    * @returns lista di utenti che rispettano la ricerca.
    */
  searchUserByEmail(email: string) {
    return this.db.collection('Users', ref => this.searchByField(ref, "email", email));
  }

  /**
    * Effettua la ricerca degli utenti mediante il loro username.
    * @param {string} username username utilizzato per la ricerca
    * @returns lista di utenti che rispettano la ricerca.
    */
  searchUser(username: string): AngularFirestoreCollection<DocumentData> {
    return this.db.collection('Users', ref => this.searchByField(ref, "username", username));
  }
  /**
    * Effettua la ricerca in una lista mediante un campo presentato in ingresso.
    * @param {CollectionReference<DocumentData>} ref lista di documenti sul quale fare la ricerca
    * @param fieldname nome dell'attributo sul quale ricercare
    * @param fieldval valore del campo di ricerca
    * @returns lista di utenti che rispettano la ricerca.
    */
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

  /**
    * Restituisce la media de tempi di completamento dei giochi presentati in ingresso.
    * @param {any[]} games lista di giochi
    * @returns media dei tempi di completamento
    */
  avgCompleteTime(games: any[]) {
    if (!games || games.length == 0) {
      return 0;
    }
    let sumTime = 0;
    for (let game of games)
      sumTime += game.payload.doc.data().completetime;

    return Math.round((sumTime / games.length) * 100) / 100;
  }

  /**
    * Prende in ingresso una stringa e restituisce una stringa simile, ma che presente una lettera maiuscola dopo 
    * ogni carattere vuoto.
    * @param {string} str stringa di testo
    * @returns stringa di testa con tutte le parole che iniziano per una maiuscola
    */
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


  /**
     * Restituisce l'insieme di Validators che occorrono a controllare la struttura di un campo di tipo Password.
     * @returns insieme di validators per controllare la struttura di una password
     */
  getPasswordValidators() {
    return Validators.compose([Validators.minLength(6)]);
  }

  /**
     * Restituisce la mappa di valori da fornire al metodo getFieldMsgError, per ottenere gli errori per un campo password.
     * @returns mappa di valori per messaggi errore di una password
     */
  passwordFieldErrorParameters(): Map<string, string> {
    return new Map([["minLength", "6"]]);
  }

  
 /**
     * Restituisce l'insieme di Validators che occorrono a controllare la struttura di un campo di tipo Username.
     * @returns insieme di validators per controllare la struttura di un username
     */
  getUsernameValidators() {
    return Validators.compose([Validators.minLength(6)]);
  }

  /**
     * Restituisce la mappa di valori da fornire al metodo getFieldMsgError, per ottenere gli errori per un campo username.
     * @returns mappa di valori per messaggi errore di un username
     */
  usernameFieldErrorParameters(): Map<string, string> {
    return new Map([["minLength", "6"]]);
  }

  /**
     * Restituisce l'insieme di Validators che occorrono a controllare la struttura di un campo di tipo Price.
     * @returns insieme di validators per controllare la struttura di un price
     */
  getPriceValidators() {
    return Validators.compose([Validators.min(0.01), Validators.max(9999),
    CustomValidators.max2DecimalValidator()]);
  }

  /**
     * Restituisce la mappa di valori da fornire al metodo getFieldMsgError, per ottenere gli errori per un campo Price.
     * @returns mappa di valori per messaggi errore di un price
     */
  priceFieldErrorParameters(): Map<string, string> {
    return new Map([['min', "0.01"], ['max', "9999"]]);
  }

  /**
     * Restituisce l'insieme di Validators che occorrono a controllare la struttura di un campo di tipo Complted Time.
     * @returns insieme di validators per controllare la struttura di un Completed Time
     */
  getCompletedTimeValidators() {
    return Validators.compose([Validators.min(0.01), Validators.max(9999),
    CustomValidators.max2DecimalValidator()]);
  }

  /**
     * Restituisce la mappa di valori da fornire al metodo getFieldMsgError, per ottenere gli errori per un campo Completed Time.
     * @returns mappa di valori per messaggi errore di un Completed Time
     */
  completedTimeFieldErrorParameters(): Map<string, string> {
    return new Map([['min', "0.01"], ['max', "9999"]]);
  }

  /**
     * Restiruisce un messaggio di errore per il campo field. Il messaggio sarà una string del tipo:
     * "name deve essere tipo_errore di parameter[tipo_errore]" nel caso vi sia un errore, undefined altrimenti.
     * @param field control per l'input da controllare
     * @param name nome dell'input che viene mostrato nel messaggio di errore
     * @param parameter mappa contenente un valore da mostrare nel messaggio di errore per ciascun tipo di errore da controllare.
     * @returns messaggio di errore per il campo field, undefined se non è presente nessun errore.
     */
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



