import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentData, CollectionReference } from '@angular/fire/firestore';
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

	//Questo metodo restituisce il documento relativo all'utente per il quale si è indicato l'id
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
		return username === "" ? null : this.db.collection('Users', ref => this.searchByUsername(ref, username));
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
		return username === "" ? null : this.getUserDoc(userid).collection("Friends", ref => this.searchByUsername(ref, username!));
	}

	addFriend(id: string, username: string, userid?: string): void {
		this.getUserDoc(userid).collection("Friends").doc(id).set({ username: username });
	}

	removeFriend(id: string, userid?: string): void {
		this.getUserDoc(userid).collection("Friends").doc(id).delete();
	}

	async checkIsFriend(userid: string, curUserId?: string) : Promise<boolean>
	{
		return (await this.getUserDoc(curUserId).collection("Friends").doc(userid).ref.get()).exists;
	}

	//Funzionalità di chat

	getChatID(user1: string, user2?: string) {
		let u2 = user2 ? user2 : this.getID();
		return user1 < u2 ? user1 + u2 : u2 + user1;
	}

	getChat(id: string) {
		return this.db.doc("Chats/" + id);
	}

	//Questo metodo restituisce il documento relativo alla chat tra due utenti
	//Il secondo utente può essere omesso, nel caso viene considerato l'utente loggato
	getChatByUsers(user1: string, user2?: string) {
		return this.getChat(this.getChatID(user1, user2));
	}

	async chatExist(user1: string, user2?: string): Promise<boolean> {
		//Computo il chat id
		let chatId = this.getChatID(user1, user2);
		//Cerco l'id nell'utente 1
		let chats = (await this.getDataParam("chats", user1) as string[]);
		//Se chats esiste e in esso è presente la chat, restituisce true
		return chats && chats.findIndex(v => v === chatId) != -1;
	}

	async createChat(user1: string, user2?: string) {
		//Genero l'id
		let id = this.getChatID(user1, user2);

		//Controllo che la chat non esista gia
		if (!(await this.chatExist(user1, user2))) {
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
	}

	//Questo metodo restituisce l'ultimo messaggio presente nella chat, se quest'ultima è vuota restituisce null.
	async getLastMessageInfo(idChat: string): Promise<MessageInfo | undefined> {

		let m: MessageInfo | undefined;
		(await this.getChat(idChat).collection("messages", ref => ref.orderBy("time").limit(1)).ref.get()).docs.forEach(async d => {
			m = { id: d.id, sender: d.get("sender"), text: d.get("text"), time: d.get("time") }
		});
		return m;
	}


}
