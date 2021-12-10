import { UniqueSelectionDispatcherListener } from '@angular/cdk/collections';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserLoggedService, MessageInfo } from 'src/app/services/user-logged.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnChanges {

  @Input() chatID: string = "";
  @Input() friendID: string = "";

  messages$: Observable<any> = new Observable;
  messageTxt: string = "";
  curChatExists: boolean = false;

  constructor(public db: AngularFirestore, public authService: AuthService,
     public userLoggedService: UserLoggedService, public util: UtilService) {
  
  }

  ngOnChanges(changes: any) {
    this.messages$ = this.userLoggedService.getMessaggesOrdered(this.chatID).valueChanges();
    this.userLoggedService.chatExistsByID(this.chatID).then( e => this.curChatExists = e)
  }

  async sendMessage() {
      if( !this.curChatExists )
        await this.userLoggedService.createChat(this.friendID);

      this.userLoggedService.sendMessage(this.chatID, this.messageTxt).then(
        d => this.messageTxt = "");
  }

}
