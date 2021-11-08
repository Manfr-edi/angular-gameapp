import {Component, OnInit} from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { Observable,  } from 'rxjs';

import { AngularFirestore } from '@angular/fire/firestore';
import { userlist } from '../data/userlist/userlist';


import { UtilService } from '../shared/services/util.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  //Utilities
  util: UtilService;

  selectedPlatform: string;
  gametitle: string;
  time = 0;
  note: string;
  vote = 0;

  games$: Observable<any[]>;
  
  updateForm = false;

  constructor(public authService: AuthService, public db: AngularFirestore) {
      this.util = new UtilService();
      this.selectedPlatform='';
      this.gametitle='';
      this.note=''
      this.games$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(userlist[0].code).snapshotChanges();
  }

  ngOnInit() {
  }

  logout() {
    this.authService.signOut();
  }

  RemoveGame(id: string){
    this.db.collection('Users').doc(this.authService.currentUserId).collection(userlist[0].code).doc(id).delete();
  }

  UpdateForm(){
    this.updateForm = !this.updateForm;
    if(this.updateForm){
      
    }
    console.log(this.updateForm)
  }

  AddGame(){}
}
