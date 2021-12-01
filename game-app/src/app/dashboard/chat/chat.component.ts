import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { UserLoggedService, MessageInfo } from 'src/app/services/user-logged.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  //Ricerca Amico
  searchFriendToggle = false;
  users$?: Observable<any[]> = new Observable;

  //Chat
  idCurChat = ""; //ID della chat corrente
  message: string = "";
  messages$: Observable<any> = new Observable;

  //Chats
  chats: { lastMessage: MessageInfo | undefined, chatID: string }[] = [];
  newChat: boolean = false;
  idFriend: string = "";

  constructor(public db: AngularFirestore, public authService: AuthService, public userLoggedService: UserLoggedService) {

  }

  async ngOnInit() {
    this.userLoggedService.getUserDoc().snapshotChanges().subscribe(d => {
      this.chats = [];
      let c = (d.payload.get("chats") as string[]);
      if (c != undefined && c.length != 0)
        c.forEach(async chat => {
          //prendo l'ultimo messaggio
          this.chats.push({ lastMessage: (await this.userLoggedService.getLastMessageInfo(chat)), chatID: chat });
        })
    });
  }

  searchFriend(event: any) {
    this.users$ = this.userLoggedService.searchFriends(event.target.value.toLowerCase())?.snapshotChanges();
  }

  createChat(idFriend: string) {
    //this.userLoggedService.createChat(idFriend);
    this.newChat = true;
    this.idFriend = idFriend;
    this.openChat(this.userLoggedService.getChatID(idFriend));
  }

  async openChat(idChat: string) {
    //Disabilito la ricerca dell'amico
    this.searchFriendToggle = false;
    this.users$ = new Observable;

    this.idCurChat = idChat;
    if (!this.newChat)
      this.messages$ = this.userLoggedService.getMessaggesOrdered(idChat).snapshotChanges();
    else
      this.messages$ = new Observable;
  }


  sendMessage() {
    if (this.message !== '') {
      if (this.newChat) {
        this.newChat = false;
        this.userLoggedService.createChat(this.idFriend);
        this.openChat(this.idCurChat);
      }
      this.userLoggedService.sendMessage(this.idCurChat, this.message);
      this.message = "";
    }
    else
      window.alert("Impossibile mandare un messaggio vuoto");

  }
}
