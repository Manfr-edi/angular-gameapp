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

	getUserID() {
		return this.userDoc.ref.id;
	}

	//Questo metodo restituisce il documento relativo all'utente per il quale si � indicato l'id
	//nel caso in cui l'id non viene passato, viene restituito il documento relativo
	//all'utente attualmente loggato
	getUserDoc(userid?: string) {
		return userid ? this.db.doc("Users/" + userid) : this.userDoc;
	}

	async getUserDataParam(par: string, userid?: string): Promise<any> {
		return (await this.getUserDoc(userid).ref.get()).get(par);
	}

	updateUser(data: Partial<DocumentData>, userid?: string): Promise<boolean> {
		return this.getUserDoc(userid).update(data).then(() => true).catch(e => false);
	}

	uploadUserImg(img: File, progress?: (perc: number) => void, userid?: string): Promise<boolean> {
		return this.util.uploadFile(this.util.getUserImageChild(userid ? userid : this.getUserID()), img, progress);
	}

	cancelUserImg(userid?: string) {
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

	getFriends(userid?: string) {
		return this.getUserDoc(userid).collection("Friends");
	}

	searchFriends(username: string, userid?: string) {
		return this.getUserDoc(userid).collection("Friends", ref => this.util.searchByField(ref, "username", username));
	}

	async checkIsFriend(possibleFriendID: string, userid?: string): Promise<boolean> {
		return (await this.getUserDoc(userid).collection("Friends").doc(possibleFriendID).ref.get()).exists;
	}

	removeFriend(friendID: string, userid?: string) {
		let uid = userid ? userid : this.getUserID();

		this.getUserDoc(uid).collection("Friends").doc(friendID).delete();
		this.getUserDoc(friendID).collection("Friends").doc(uid).delete();
	}

	getFriendIDFromChatID(chatID: string, userid?: string) {
		let uid = userid ? userid : this.getUserID();
		return chatID.substring(0, 28) === uid ? chatID.substring(28) : chatID.substring(0, 28);
	}

	async getFriendsWithChat(withChat: boolean, userid?: string): Promise<AngularFirestoreCollection | undefined> {
		let id = userid ? userid : this.getUserID();

		let doc = this.getUserDoc(userid);
		let chats = await this.getUserDataParam("chats", userid) as string[];
		if (chats != undefined && chats.length > 0) {
			let idFriends: string[] = new Array;

			chats.map(d => {
				let s = d.substring(0, 28)
				idFriends.push(s == id ? d.substring(28) : s)
			})

			return doc.collection("Friends",
				ref => ref.where(firebase.default.firestore.FieldPath.documentId(),
					withChat ? "in" : "not-in", idFriends));
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

	getRequests(userid?: string) {
		return this.getUserDoc(userid).collection("Requests");
	}

	checkRequest(requesterID: string, userid?: string): Promise<boolean> {
		return this.getUserDoc(userid).collection("Requests").doc(requesterID).ref.get().then(doc => doc.exists).catch(e => false);
	}

	sendRequest(requiredID: string, requiredUsername: string, userid?: string) {
		let uid = userid ? userid : this.getUserID();

		this.getUserDoc(requiredID).collection("Requests").doc(uid).set({ username: requiredUsername, time: firebase.default.firestore.FieldValue.serverTimestamp() });
		this.getUserDoc(requiredID).collection("Notification").doc().set({ userid: uid, username: requiredUsername, type: "request", time: firebase.default.firestore.FieldValue.serverTimestamp(), seen: false });
	}

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

	getChatID(user1: string, userid?: string) {
		let uid = userid ? userid : this.getUserID();
		return user1 < uid ? user1 + uid : uid + user1;
	}

	getChat(id: string) {
		return this.db.doc("Chats/" + id);
	}

	//Questo metodo restituisce il documento relativo alla chat tra due utenti
	//Il secondo utente pu� essere omesso, nel caso viene considerato l'utente loggato
	getChatByUsers(friendID: string, userid?: string) {
		return this.getChat(this.getChatID(friendID, userid));
	}

	async chatExists(friendID: string, userid?: string): Promise<boolean> {
		//Computo il chat id
		let chatId = this.getChatID(friendID, userid);
		//Cerco l'id nell'utente 1
		let chats = (await this.getUserDataParam("chats", friendID) as string[]);
		//Se chats esiste e in esso � presente la chat, restituisce true
		return chats && chats.findIndex(v => v === chatId) != -1;
	}

	async chatExistsByID(chatID: string): Promise<boolean> {
		return (await this.db.collection("Chats").doc(chatID).ref.get()).exists;
	}

	async createChat(friendID: string, userid?: string) {
		//Genero l'id
		let id = this.getChatID(friendID, userid);

		//Controllo che la chat non esista gia
		if (!(await this.chatExists(friendID, userid))) {
			this.updateUser({ chats: firebase.default.firestore.FieldValue.arrayUnion(id) }, friendID);
			this.updateUser({ chats: firebase.default.firestore.FieldValue.arrayUnion(id) }, userid);
		}
	}

	getMessaggesOrdered(idChat: string) {
		return this.getChat(idChat).collection("messages", ref => ref.orderBy("time", "desc"));
	}

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

	getNotifications(userid?: string) {
		return this.getUserDoc(userid).collection("Notification");
	}

	getNotificationsOrdered(userid?: string) {
		return this.getUserDoc(userid).collection("Notification", ref => ref.orderBy('time', 'desc'))
	}

	getUnseenNotifications(userid?: string) {
		return this.getUserDoc(userid).collection("Notification", ref => ref.where('seen', '==', false))
	}

	setNotificationSeen(notificationID: string, userid?: string) {
		this.getUserDoc(userid).collection("Notification").doc(notificationID).update({ seen: true });
	}

	deleteNotification(notificationID: string, userid?: string) {
		this.getUserDoc(userid).collection("Notification").doc(notificationID).delete();
	}

	seenAllNotifications(userid?: string) {
		this.getUnseenNotifications(userid).get().forEach(
			docs => docs.forEach(
				d => d.ref.update({ seen: true })
			)
		)
	}

	deleteAllNotifications(userid?: string) {
		this.getUserDoc(userid).collection("Notification").get().forEach(
			docs => docs.forEach(
				d => d.ref.delete()
			)
		)
	}
}
