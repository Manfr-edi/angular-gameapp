import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { UtilService } from 'src/app/shared/services/util.service';
import { Observable, empty } from 'rxjs';
import { FriendListService } from 'src/app/shared/services/friend-list.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-friend-tab',
  templateUrl: './friend-tab.component.html',
  styleUrls: ['./friend-tab.component.css']
})
export class FriendTabComponent implements OnInit {

  //Utilities
  util: UtilService;


  //Dati visualizzati
  users$: Observable<any[]>;
  friends$: Observable<any[]>;

  constructor(public db: AngularFirestore, public friendListService: FriendListService, public authService: AuthService) {

    this.util = new UtilService();
    this.users$ = new Observable();
    this.friends$ = db.collection("Users/" + authService.currentUserId + "/Friends").snapshotChanges()
  }

  ngOnInit(): void {
  }

  onKey(event: any) {
    let username = event.target.value.toLowerCase();

    this.users$ = username === "" ? new Observable : this.db.collection('Users', ref =>
      ref.where('username', '>=', username).where('username', '<=', username + '\uf8ff')
    ).snapshotChanges();
  }



}
