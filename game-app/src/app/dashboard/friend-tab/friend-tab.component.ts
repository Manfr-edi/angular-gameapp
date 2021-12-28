import { Component, OnInit } from '@angular/core';
import { AngularFirestoreCollection, DocumentData } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserLoggedService } from 'src/app/services/user-logged.service';
import { UtilService } from 'src/app/services/util.service';
import { RemoveFriendDialogComponent } from './remove-friend-dialog/remove-friend-dialog.component';

@Component({
  selector: 'app-friend-tab',
  templateUrl: './friend-tab.component.html',
  styleUrls: ['./friend-tab.component.css']
})
export class FriendTabComponent implements OnInit {

  //Dati visualizzati
  users$?: Observable<any[]>;
  friends$: Observable<any[]>;
  requests$: Observable<any[]> = new Observable;

  imgUrlFriends: Map<string, string> = new Map;

  constructor(public authService: AuthService, public userLoggedService: UserLoggedService, private util: UtilService, public dialog: MatDialog) {
    this.users$ = new Observable();

    //Carico la lista degli amici e le relative foto profilo
    let friends = userLoggedService.getFriends();
    util.loadUserListImgUrls(friends).then(urls => this.imgUrlFriends = urls);
    this.friends$ = friends.snapshotChanges();
  }

  ngOnInit(): void {
    this.requests$ = this.userLoggedService.getRequests().snapshotChanges();
  }

  onKey(event: any) {
    let s = event.target.value as string;

    if (s == null || s.length == 0)
      this.users$ = new Observable();
    else
      this.users$ = this.util.searchUser(s.toLowerCase()).snapshotChanges();
  }

  acceptRequest(friendID: string, friendUsername: string) {
    this.userLoggedService.acceptRequest(friendID, friendUsername, this.authService.currentUserId)
      .then(() => {
        this.util.getUserImageUrl(friendID).then(url => { if (url) this.imgUrlFriends.set(friendID, url) });
      })
  }
  removeFriend(friendID: string, friendUsername: string) {
    const dialogRef = this.dialog.open(RemoveFriendDialogComponent,
      { data: { username: friendUsername } });

    dialogRef.afterClosed().subscribe(result => {

      if (result)
        this.userLoggedService.removeFriend(friendID, this.authService.currentUserId)
    });
  }


}
