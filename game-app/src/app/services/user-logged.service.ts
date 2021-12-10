import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentData, CollectionReference, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { userlist } from 'src/app/data/userlist/userlist';
import * as firebase from 'firebase'

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

	constructor(public db: AngularFirestore, public authService: AuthService) {
		this.userDoc = db.doc('Users/' + this.authService.currentUserId);
	}

	//Questo metodo restituisce il documento relativo all'utente per il quale si � indicato l'id
	//nel caso in cui l'id non viene passato, viene restituito il documento relativo
	//all'utente attualmente loggato
	getUserDoc(userid?: string) {
		return userid ? this.db.doc("Users/" + userid) : this.userDoc;
	}

	getID() {
		return this.userDoc.ref.id;
	}

	async getDataParam(par: string, userid?: string): Promise<any> {
		return (await this.getUserDoc(userid).ref.get()).get(par);
	}

	update(data: Partial<DocumentData>, userid?: string) {
		this.getUserDoc(userid).update(data);
	}

	search(username: string) {
		return this.db.collection('Users', ref => this.searchByUsername(ref, username));
	}

	//Questa funzione effettua la ricerca mediante l'username
	private searchByUsername(ref: CollectionReference<DocumentData>, username: string) {
		return ref.where('username', '>=', username).where('username', '<=', username + '\uf8ff');
	}

	//Funzionalita per la lista amici

	getFriends(userid?: string) {
		return this.getUserDoc(userid).collection("Friends");
	}

	searchFriends(username: string, userid?: string) {
		return this.getUserDoc(userid).collection("Friends", ref => this.searchByUsername(ref, username));
	}

	sendRequest(id: string, username: string, userid: string) {
		this.getUserDoc(id).collection("Requests").doc(userid).set({ username: username, time: firebase.default.firestore.FieldValue.serverTimestamp() });
		this.getUserDoc(id).collection("Notification").doc().set({ userid: userid, username: username, type: "request", time: firebase.default.firestore.FieldValue.serverTimestamp(), seen: false });
	}

	getRequests(userid?: string) {
		return this.getUserDoc(userid).collection("Requests");
	}

	async acceptRequest(id: string, username: string, userid: string) {
		this.getUserDoc(userid).collection("Friends").doc(id).set({ username: username });
		this.getUserDoc(id).collection("Friends").doc(userid).set({ username: this.authService.currentUserName });
		this.removeRequest(id, userid);
		let username1 = await this.getDataParam("username", userid);
		this.getUserDoc(id).collection("Notification").doc().set({
			userid: userid, username: username1,
			type: "accepted", time: firebase.default.firestore.FieldValue.serverTimestamp(), seen: false
		});
	}

	removeRequest(id: string, userid?: string) {
		//this.getUserDoc(userid).collection("Notification").doc(id).delete();
		this.getUserDoc(userid).collection("Requests").doc(id).delete();

		this.getUserDoc(userid).collection("Notification", ref => ref.where("type", "==", "request").where("userid", "==", id)).get().forEach(
			docs => docs.forEach(
				d => this.deleteNotification(d.id)));
	}

	removeFriend(id: string, userid: string) {
		this.getUserDoc(userid).collection("Friends").doc(id).delete();
		this.getUserDoc(id).collection("Friends").doc(userid).delete();
	}

	async checkIsFriend(userid: string, curUserId?: string): Promise<boolean> {
		return (await this.getUserDoc(curUserId).collection("Friends").doc(userid).ref.get()).exists;
	}

	async checkRequest(userid: string, curUserId: string): Promise<boolean> {
		return (await this.getUserDoc(userid).collection("Requests").doc(curUserId).ref.get()).exists;
	}

	//Funzionalit� di chat

	getChatID(user1: string, user2?: string) {
		let u2 = user2 ? user2 : this.getID();
		return user1 < u2 ? user1 + u2 : u2 + user1;
	}

	getChat(id: string) {
		return this.db.doc("Chats/" + id);
	}

	//Questo metodo restituisce il documento relativo alla chat tra due utenti
	//Il secondo utente pu� essere omesso, nel caso viene considerato l'utente loggato
	getChatByUsers(user1: string, user2?: string) {
		return this.getChat(this.getChatID(user1, user2));
	}

	async chatExists(user1: string, user2?: string): Promise<boolean> {
		//Computo il chat id
		let chatId = this.getChatID(user1, user2);
		//Cerco l'id nell'utente 1
		let chats = (await this.getDataParam("chats", user1) as string[]);
		//Se chats esiste e in esso � presente la chat, restituisce true
		return chats && chats.findIndex(v => v === chatId) != -1;
	}

	async chatExistsByID(chatID: string): Promise<boolean> {
		return (await this.db.collection("Chats").doc(chatID).ref.get()).exists;
	}

	async getFriendsWithChat(withChat: boolean, userid?: string): Promise<AngularFirestoreCollection | undefined> {
		let id = userid ? userid : this.getID();

		let doc = this.getUserDoc(userid);
		let chats = await this.getDataParam("chats", userid) as string[];
		if (chats != undefined && chats.length > 0) {
			let idFriends: string[] = new Array;

			chats.map(d => {
				let s = d.substr(0, 28);
				idFriends.push(s == id ? d.substr(28) : s);
			}
			)

			return doc.collection("Friends",
				ref => ref.where(firebase.default.firestore.FieldPath.documentId(),
					withChat ? "in" : "not-in", idFriends));
		}

		return undefined;
	}

	async createChat(user1: string, user2?: string) {
		//Genero l'id
		let id = this.getChatID(user1, user2);

		//Controllo che la chat non esista gia
		if (!(await this.chatExists(user1, user2))) {
			this.update({ chats: firebase.default.firestore.FieldValue.arrayUnion(id) }, user1);
			this.update({ chats: firebase.default.firestore.FieldValue.arrayUnion(id) }, user2);
		}
	}

	getMessaggesOrdered(idChat: string) {
		return this.getChat(idChat).collection("messages", ref => ref.orderBy("time"));
	}

	async sendMessage(idChat: string, message: string, sender?: string) {
		let s = sender ? sender : this.getID();

		let username = await this.getDataParam("username", s);
		this.getChat(idChat).collection("messages").doc().set(
			{ text: message, time: firebase.default.firestore.FieldValue.serverTimestamp(), sender: username });

		var user = idChat.substring(0, 28) === s ? idChat.substring(28) : idChat.substring(0, 28);

		this.getUserDoc(user).collection("Notification").doc().set({ userid: s, username: username, type: "message", time: firebase.default.firestore.FieldValue.serverTimestamp(), seen: false })
	}

	//Questo metodo restituisce l'ultimo messaggio presente nella chat, se quest'ultima � vuota restituisce null.
	async getLastMessageInfo(idChat: string): Promise<MessageInfo | undefined> {

		let m: MessageInfo | undefined;
		(await this.getChat(idChat).collection("messages", ref => ref.orderBy("time").limit(1)).ref.get()).docs.forEach(async d => {
			m = { id: d.id, sender: d.get("sender"), text: d.get("text"), time: d.get("time") }
		});
		return m;
	}


	getNotification(userid?: string) {
		return this.getUserDoc(userid).collection("Notification", ref => ref.orderBy('time'))


	}

	getUnseenNotification(userid?: string) {
		return this.getUserDoc(userid).collection("Notification", ref => ref.where('seen', '==', false).orderBy('time'))
	}


	setNotificationSeen(notificationid: string, userid?: string) {
		this.getUserDoc(userid).collection("Notification").doc(notificationid).update({ seen: true });
	}

	deleteNotification(notificationid: string, userid?: string) {
		this.getUserDoc(userid).collection("Notification").doc(notificationid).delete();
	}

	seenAllNotification(userid?: string) {
		this.getUnseenNotification(userid).get().forEach(
			docs => docs.forEach(
				d => d.ref.update({ seen: true })
			)
		)
	}

	deleteAllNotification(userid?: string) {
		this.getUserDoc(userid).collection("Notification").get().forEach(
			docs => docs.forEach(
				d => d.ref.delete()
			)
		)
	}
}
