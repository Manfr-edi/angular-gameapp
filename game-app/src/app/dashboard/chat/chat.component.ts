import { Component, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserLoggedService } from 'src/app/services/user-logged.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnChanges {

  @Input() chatID: string = "";
 
  messages$: Observable<any> = new Observable;
  messageTxt: string = "";
  curChatExists: boolean = false;
  friendID: string = "";
  friendUsername = "";

  constructor(public authService: AuthService, private userLoggedService: UserLoggedService, public util: UtilService) {
  }
  async ngOnInit(){
    this.friendUsername = await this.getFriendUsername();
  }
  async ngOnChanges(changes: any) {
    this.messages$ = this.userLoggedService.getMessaggesOrdered(this.chatID).valueChanges();
    this.userLoggedService.chatExistsByID(this.chatID).then(e => this.curChatExists = e)
    this.friendID = this.userLoggedService.getFriendIDFromChatID(this.chatID);
    this.friendUsername = await this.getFriendUsername();
  }

  async sendMessage() {
    if (!this.curChatExists)
      await this.userLoggedService.createChat(this.friendID);

    this.userLoggedService.sendMessage(this.chatID, this.messageTxt).then(
      d => this.messageTxt = "");
  }

  onKeyUpMsg(event: any) {
    if (event.keyCode === 13) {
      if (this.messageTxt != '')
        this.sendMessage();
    }
  }

  async getFriendUsername(){
    let friendUser = await this.userLoggedService.getUserDataParam("username",this.friendID);
    return friendUser;
  }

}
