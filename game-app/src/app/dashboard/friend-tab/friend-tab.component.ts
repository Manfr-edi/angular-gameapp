import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserLoggedService } from 'src/app/services/user-logged.service';

@Component({
  selector: 'app-friend-tab',
  templateUrl: './friend-tab.component.html',
  styleUrls: ['./friend-tab.component.css']
})
export class FriendTabComponent implements OnInit {

  //Dati visualizzati
  users$?: Observable<any[]>;
  friends$: Observable<any[]>;

  constructor(public db: AngularFirestore, public authService: AuthService, public userLoggedService: UserLoggedService) {
    this.users$ = new Observable();
    this.friends$ = userLoggedService.getFriends().snapshotChanges();
  }

  ngOnInit(): void {
  }

  onKey(event: any) {
    this.users$ = this.userLoggedService.search(event.target.value.toLowerCase())?.snapshotChanges();
  }
}
