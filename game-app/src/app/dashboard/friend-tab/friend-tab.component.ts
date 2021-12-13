import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserLoggedService } from 'src/app/services/user-logged.service';
import { UtilService } from 'src/app/services/util.service';

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

  constructor(public authService: AuthService, public userLoggedService: UserLoggedService, public util: UtilService) {
    this.users$ = new Observable();
    this.friends$ = userLoggedService.getFriends().snapshotChanges();
  }

  ngOnInit(): void {    
    this.requests$ = this.userLoggedService.getRequests().snapshotChanges();
  }

  onKey(event: any) {
    let s = event.target.value as string;

    if (s == null || s.length == 0)
      this.users$ = new Observable();
    else
     // this.users$ = this.userLoggedService.searchUser(s.toLowerCase()).snapshotChanges();
     this.users$ = this.util.searchUser(s.toLowerCase()).snapshotChanges();
  }


}
