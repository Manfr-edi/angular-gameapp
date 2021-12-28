import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentData } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { userlist } from 'src/app/data/userlist/userlist';
import { AuthService } from './auth.service';
import { UtilService } from './util.service';

export interface MessageInfo {
	id: string;
	text: string;
	sender: string;
	time: Date;
};

@Injectable({
	providedIn: 'root'
})
export class UserLoggedService {
	userDoc: AngularFirestoreDocument;
	userlists = userlist

	constructor(private db: AngularFirestore, private authService: AuthService, private util: UtilService) {
		this.userDoc = db.doc('Users/' + authService.currentUserId);
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
    * Restituisce l'id dell'utente attualmente loggato
    * @returns id utente loggato
    */
	getUserID() {
		return this.userDoc.ref.id;
	}

	/**
    * Restiuisce il documento dell'utente il quale id è presentato in ingresso, nel caso non sia definito
	* si considera l'utente attualmente loggato.
    * @param {string} userid id utente 
	* @returns documento dell'utente richiesto
    */
	getUserDoc(userid?: string) {
		return userid ? this.db.doc("Users/" + userid) : this.userDoc;
	}

	/**
    * Restiuisce un attributo dell'utente il quale id è presentato in ingresso, nel caso non sia definito
	* si considera l'utente attualmente loggato.
	* @param {string} par nome dell'attributo 
    * @param {string} userid id utente 
	* @returns valore dell'attributo richiesto
    */
	async getUserDataParam(par: string, userid?: string): Promise<any> {
		return (await this.getUserDoc(userid).ref.get()).get(par);
	}

	/**
    * Permette di aggiornare il documento relativo all'utente indicato, nel caso non sia definito
	* si considera l'utente attualmente loggato.
	* @param {Partial<DocumentData>} data struttura che indica gli attributi e i relativi valori da aggiornare 
    * @param {string} userid id utente 
	* @returns true nel caso l'aggiornamento sia avvenuto correttamente, false altrimenti
    */
	updateUser(data: Partial<DocumentData>, userid?: string): Promise<boolean> {
		return this.getUserDoc(userid).update(data).then(() => true).catch(e => false);
	}

	/**
    * Permette caricare l'immagine profilo dell'utente indicato, nel caso non sia definito si considera l'utente
	* attualmente loggato.
	* @param {File} img immagine profilo da caricare
	* @param {(perc: number) => void} progress funzione che viene richiamanta ogni qualvolta è presente un progresso
	* nell'upload del file
    * @param {string} userid id utente 
	* @returns true nel caso il caricamento sia avvenuto correttamente, false altrimenti
    */
	uploadUserImg(img: File, progress?: (perc: number) => void, userid?: string): Promise<boolean> {
		return this.util.uploadFile(this.util.getUserImageChild(userid ? userid : this.getUserID()), img, progress);
	}

	/**
    * Permette eliminare l'immagine profilo dell'utente indicato, nel caso non sia definito si considera l'utente
	* attualmente loggato.
    * @param {string} userid id utente 
	* @returns true nel caso la cancellazione sia avvenuta correttamente, false altrimenti
    */
	cancelUserImg(userid?: string): Promise<boolean>{
		return this.util.deleteFile(this.util.getUserImageChild(userid ? userid : this.getUserID()));
	}

	/*************************************
	 * 
	 * 
	 *            Amici
	 * 
	 * 
	 * 
	 * 
	 **************************************/

	/**
    * Restituisce la lista degli amici dell'utente indicato, nel caso non sia definito si considera l'utente
	* attualmente loggato.
    * @param {string} userid id utente 
	* @returns lista amici utente indicato
    */
	getFriends(userid?: string) {
		return this.getUserDoc(userid).collection("Friends");
	}

	/**
    * Ricerca mediante l'username fra gli amici dell'utente indicato, nel caso non sia definito si considera l'utente
	* attualmente loggato.
	* @param {string} username username utilizzato per la ricerca
    * @param {string} userid id utente 
	* @returns lista amici utente indicato
    */
	searchFriends(username: string, userid?: string) {
		return this.getUserDoc(userid).collection("Friends", ref => this.util.searchByField(ref, "username", username));
	}

	/**
    * Verifica che l'utente il quale id è userid, se non è indicato viene considerato l'utente attualmente loggato, 
	* abbia tra gli amici l'utente il quale id è possibleFriendID.
	* @param {string} possibleFriendID id del possibile amico
    * @param {string} userid id utente 
	* @returns true nel caso i due utenti sono amici, false altrimenti
    */
	async checkIsFriend(possibleFriendID: string, userid?: string): Promise<boolean> {
		return (await this.getUserDoc(userid).collection("Friends").doc(possibleFriendID).ref.get()).exists;
	}

	removeFriend(friendID: string, userid?: string) {
		let uid = userid ? userid : this.getUserID();

		this.getUserDoc(uid).collection("Friends").doc(friendID).delete();
		this.getUserDoc(friendID).collection("Friends").doc(uid).delete();
	}

	/**
    * Restituisce l'id della amico, partendo dall'id della chat e dall'id di un utente, nel caso quest'ultimo
	* non viene indicato viene considerato l'id dell'utente loggato.
	* @param {string} chatID id della chat
    * @param {string} userid id utente 
	* @returns id dell'amico con la quale si ha la chat
    */
	getFriendIDFromChatID(chatID: string, userid?: string) {
		let uid = userid ? userid : this.getUserID();
		return chatID.substring(0, 28) === uid ? chatID.substring(28) : chatID.substring(0, 28);
	}

	/**
    * Restituisce la lista degli amici dell'utente indica, se non viene indicato si considera l'utente loggato,
	* con la quale si ha una chat in corso oppure non si ha una chat in base al parametro withChat.
	* @param {boolean} withChat Se true, vengono considerati gli amici con una chat, se false senza chat
    * @param {string} userid id utente 
	* @returns lista amici con o senza chat. Viene restituito undefined se non ci sono amici
    */
	async getFriendsWithChat(withChat: boolean, userid?: string): Promise<AngularFirestoreCollection | undefined> {
		let id = userid ? userid : this.getUserID();

		let doc = this.getUserDoc(userid);
		let chats = await this.getUserDataParam("chats", userid) as string[];
		if (chats != undefined && chats.length > 0) {
			console.log("Ho le chat")
			let idFriends: string[] = new Array;

			chats.map(d => {
				let s = d.substring(0, 28)
				idFriends.push(s == id ? d.substring(28) : s)
			})

			return doc.collection("Friends",
				ref => ref.where(firebase.default.firestore.FieldPath.documentId(),
					withChat ? "in" : "not-in", idFriends));
		}
		else
		{
			console.log("Non ho le chat")
			if( !withChat )
				return doc.collection("Friends");
		}
		return undefined;
	}

	/*************************************
	 * 
	 * 
	 *            Richieste
	 * 
	 * 
	 * 
	 * 
	 **************************************/

	/**
    * Restituisce la lista di richieste di amicizia che un utente ha ricevuto, nel caso quest'ultimo
	* non viene indicato viene considerato l'id dell'utente loggato.
    * @param {string} userid id utente 
	* @returns lista richieste di amicizia ricevuto da un utente
    */
	getRequests(userid?: string) {
		return this.getUserDoc(userid).collection("Requests");
	}

	/**
    * Verifica che l'utente con id userid, se non viene indicato viene considerato l'id dell'utente attualmente loggato,
	* abbia una richiesta da un utente con id requesteID
	* @param {string} requesterID id utente che ha inviato la possibile richiesta di amicizia
    * @param {string} userid id utente 
	* @returns true se la richiesta è stata inoltrata, false altrimenti
    */
	checkRequest(requesterID: string, userid?: string): Promise<boolean> {
		return this.getUserDoc(userid).collection("Requests").doc(requesterID).ref.get().then(doc => doc.exists).catch(e => false);
	}

	/**
    * Permette ad un utente con id userid, se non viene indicato viene considerato l'id dell'utente attualmente loggato,
	* di inviare una richiesta ad un utente con id requiredID e username requiredUsername
	* @param {string} requiredID id dell'utente al quale si vuole mandare la richiesta
	* @param {string} requiredUsername username dell'utente al quale si vuole mandare la richiesta
    * @param {string} userid id utente che vuole mandare la richiesta
    */
	sendRequest(requiredID: string, requiredUsername: string, userid?: string) {
		let uid = userid ? userid : this.getUserID();

		this.getUserDoc(requiredID).collection("Requests").doc(uid).set({ username: requiredUsername, time: firebase.default.firestore.FieldValue.serverTimestamp() });
		this.getUserDoc(requiredID).collection("Notification").doc().set({ userid: uid, username: requiredUsername, type: "request", time: firebase.default.firestore.FieldValue.serverTimestamp(), seen: false });
	}

	/**
    * Permette ad un utente con id: userid e username: username, se non viene indicato viene considerato l'id dell'utente attualmente loggato 
	* ed il relativo username, di accettare una richiesta di amicizia di un utente con id friendID e username friendUsername
	* @param {string} friendID id dell'utente che ha mandato la richiesta di amicizia
	* @param {string} friendUsername username dell'utente che ha mandato la richiesta di amicizia
	* @param {string} userid id dell'utente che ha ricevuto la richiesta di amicizia
    * @param {string} username username dell'utente che ha ricevuto la richiesta di amicizia
    */
	async acceptRequest(friendID: string, friendUsername: string, userid?: string, username?: string) {
		let uid = userid ? userid : this.getUserID();
		let uname = username ? username : await this.getUserDataParam("username", uid);

		//Segno l'amicizia
		this.getUserDoc(uid).collection("Friends").doc(friendID).set({ username: friendUsername });
		this.getUserDoc(friendID).collection("Friends").doc(uid).set({ username: uname });
		//Rimuovo la richiesta
		this.removeRequest(friendID, uid);
		//Invio notifica

		this.getUserDoc(friendID).collection("Notification").doc().set({
			userid: uid, username: uname,
			type: "accepted", time: firebase.default.firestore.FieldValue.serverTimestamp(), seen: false
		});
	}

	/**
    * Permette ad un utente con id: userid, se non viene indicato viene considerato l'id dell'utente attualmente loggato,
	* di rimuovere una richiesta di amicizia di un utente con id requestorID
	* @param {string} requestorID id dell'utente che ha mandato la richiesta di amicizia
	* @param {string} userid id dell'utente che ha ricevuto la richiesta di amicizia
    */
	removeRequest(requestorID: string, userid?: string) {
		//Rimuovo la richiesta
		this.getUserDoc(userid).collection("Requests").doc(requestorID).delete();

		//Rimuovo la notifica relativa a tale richiesta
		this.getUserDoc(userid).collection("Notification", ref => ref.where("type", "==", "request").where("userid", "==", requestorID)).get().forEach(
			docs => docs.forEach(
				d => this.deleteNotification(d.id)));
	}

	/*************************************
	 * 
	 * 
	 *            Chat
	 * 
	 * 
	 * 
	 * 
	 **************************************/

	/**
    * Restituisce l'id di una chat tra due utenti. Nel caso userid non viene specificato viene considerato l'utente
	* attualmente loggato.
	* @param {string} user1 id primo utente
	* @param {string} userid id secondo utente
	* @returns {string} id della chat
    */
	getChatID(user1: string, userid?: string) {
		let uid = userid ? userid : this.getUserID();
		return user1 < uid ? user1 + uid : uid + user1;
	}

	/**
    * Restituisce la chat mediante id
	* @param {string} user1 id primo utente
	* @param {string} userid id secondo utente
	* @returns chat che corrisponde all'id
    */
	getChat(id: string) {
		return this.db.doc("Chats/" + id);
	}

	/**
    * Restituisce la chat tra due utenti. Nel caso userid non viene specificato viene considerato l'utente
	* attualmente loggato.
	* @param {string} friendID id primo utente
	* @param {string} userid id secondo utente
	* @returns {string} chat tra i due utenti
    */
	getChatByUsers(friendID: string, userid?: string) {
		return this.getChat(this.getChatID(friendID, userid));
	}

	/**
    * Verifica che la chat tra i due utenti esista. Nel caso userid non viene specificato viene considerato l'utente
	* attualmente loggato.
	* @param {string} friendID id primo utente
	* @param {string} userid id secondo utente
	* @returns {string} true se la chat esiste, false altrimenti
    */
	async chatExists(friendID: string, userid?: string): Promise<boolean> {
		//Computo il chat id
		let chatId = this.getChatID(friendID, userid);
		//Cerco l'id nell'utente 1
		let chats = (await this.getUserDataParam("chats", friendID) as string[]);
		//Se chats esiste e in esso � presente la chat, restituisce true
		return chats && chats.findIndex(v => v === chatId) != -1;
	}

	/**
    * Verifica che la chat il quale id è fornito in ingresso esista.
	* @param {string} chatID id chat
	* @returns {string} true se la chat esiste, false altrimenti
    */
	async chatExistsByID(chatID: string): Promise<boolean> {
		return (await this.db.collection("Chats").doc(chatID).ref.get()).exists;
	}

	/**
    * Crea la chat tra due utenti. Nel caso userid non viene specificato viene considerato l'utente
	* attualmente loggato.
	* @param {string} friendID id primo utente
	* @param {string} userid id secondo utente
    */
	async createChat(friendID: string, userid?: string) {
		//Genero l'id
		let id = this.getChatID(friendID, userid);

		//Controllo che la chat non esista gia
		if (!(await this.chatExists(friendID, userid))) {
			this.updateUser({ chats: firebase.default.firestore.FieldValue.arrayUnion(id) }, friendID);
			this.updateUser({ chats: firebase.default.firestore.FieldValue.arrayUnion(id) }, userid);
		}
	}

	/**
    * Restituisce la lista dei messaggi ordinati secondo il tempo di invio decrescentemente appartenenti ad una lista
	* il quale id è presentato in ingresso
	* @param {string} idChat id della chat
	* @returns messaggi di una chat ordinati
    */
	getMessaggesOrdered(idChat: string) {
		return this.getChat(idChat).collection("messages", ref => ref.orderBy("time", "desc"));
	}

	/**
    * Permette ad un utente il quale id è sender, se non indicato viene utilizzato l'id dell'utente attualmente loggato,
	* di inviare un messaggio in una chat il quale id è idChat.
	* @param {string} idChat id della chat
	* @param {string} message testo del messaggio
	* @param {string} sender id del mittente del messaggio
    */
	async sendMessage(idChat: string, message: string, sender?: string) {
		let s = sender ? sender : this.getUserID();

		let username = await this.getUserDataParam("username", s);
		this.getChat(idChat).collection("messages").doc().set(
			{ text: message, time: firebase.default.firestore.FieldValue.serverTimestamp(), sender: username });

		var user = this.getFriendIDFromChatID(idChat, s);

		this.getUserDoc(user).collection("Notification").doc().set({ userid: s, username: username, type: "message", time: firebase.default.firestore.FieldValue.serverTimestamp(), seen: false })
	}

	/*************************************
	 * 
	 * 
	 *            Notifiche
	 * 
	 * 
	 * 
	 * 
	 **************************************/

	/**
    * Restituisce la lista di notifiche di un utente il quale id è presentato in ingresso, nel caso non sia definito
	* viene considerato l'id dell'utente loggato.
	* @param {string} userid id dell'utente
	* @returns notifiche utente
    */
	getNotifications(userid?: string) {
		return this.getUserDoc(userid).collection("Notification");
	}

	/**
    * Restituisce la lista di notifiche di un utente il quale id è presentato in ingresso, nel caso non sia definito
	* viene considerato l'id dell'utente loggato. Le notifche sono ordinare mediante il tempo di ricezione in modo decrescente
	* @param {string} userid id dell'utente
	* @returns notifiche utente ordinate
    */
	getNotificationsOrdered(userid?: string) {
		return this.getUserDoc(userid).collection("Notification", ref => ref.orderBy('time', 'desc'))
	}

	/**
    * Restituisce la lista di notifiche non visualizzate di un utente il quale id è presentato in ingresso, 
	* nel caso non sia definito viene considerato l'id dell'utente loggato.
	* @param {string} userid id dell'utente
	* @returns notifiche utente non visualizzate
    */
	getUnseenNotifications(userid?: string) {
		return this.getUserDoc(userid).collection("Notification", ref => ref.where('seen', '==', false))
	}

	/**
    * Permette di settare come visualizzate una notifica con id notificationID di un utente il quale id è presentato
	* in ingresso, nel caso non sia definito viene considerato l'id dell'utente loggato.
	* @param {string} notificationID id della notifica
	* @param {string} userid id dell'utente
    */
	setNotificationSeen(notificationID: string, userid?: string) {
		this.getUserDoc(userid).collection("Notification").doc(notificationID).update({ seen: true });
	}

	/**
    * Permette di eliminare una notifica con id notificationID di un utente il quale id è presentato
	* in ingresso, nel caso non sia definito viene considerato l'id dell'utente loggato.
	* @param {string} notificationID id della notifica
	* @param {string} userid id dell'utente
    */
	deleteNotification(notificationID: string, userid?: string) {
		this.getUserDoc(userid).collection("Notification").doc(notificationID).delete();
	}

	/**
    * Permette di settare come visualizzate tutte le notifiche di un utente il quale id è presentato
	* in ingresso, nel caso non sia definito viene considerato l'id dell'utente loggato.
	* @param {string} userid id dell'utente
    */
	seenAllNotifications(userid?: string) {
		this.getUnseenNotifications(userid).get().forEach(
			docs => docs.forEach(
				d => d.ref.update({ seen: true })
			)
		)
	}

	/**
    * Permette di eliminare tutte le notifiche di un utente il quale id è presentato
	* in ingresso, nel caso non sia definito viene considerato l'id dell'utente loggato.
	* @param {string} userid id dell'utente
    */
	deleteAllNotifications(userid?: string) {
		this.getUserDoc(userid).collection("Notification").get().forEach(
			docs => docs.forEach(
				d => d.ref.delete()
			)
		)
	}
}
