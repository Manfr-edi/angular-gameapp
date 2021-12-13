import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { UserLoggedService, MessageInfo } from 'src/app/services/user-logged.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-show-chats',
  templateUrl: './show-chats.component.html',
  styleUrls: ['./show-chats.component.css']
})
export class ShowChatsComponent {

  friendsChat$?: Observable<any>;
  friendsNoChat$?: Observable<any>;
  curChatID: string = "";

  friendsSearched$?: Observable<any>;

  constructor(public authService: AuthService, public userLoggedService: UserLoggedService, private route: ActivatedRoute) {

    let id = this.route.snapshot.paramMap.get('id');
    if (id)
      this.curChatID = id;

    this.userLoggedService.getFriendsWithChat(true).then(
      data => this.friendsChat$ = data ? data.snapshotChanges() : new Observable);
    this.userLoggedService.getFriendsWithChat(false).then(
      data => this.friendsNoChat$ = data ? data.snapshotChanges() : new Observable);
  }

  searchFriends(txt: string) {
    this.friendsSearched$ = txt != null && txt.length > 0 ?
      this.userLoggedService.searchFriends(txt.toLowerCase()).snapshotChanges() : undefined;
  }

  friendSelected(idFriend: string) {
    this.curChatID = this.userLoggedService.getChatID(idFriend);
  }
}
