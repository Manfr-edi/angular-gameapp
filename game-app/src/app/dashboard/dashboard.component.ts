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

  


  constructor(public authService: AuthService, public db: AngularFirestore) {

  }

  ngOnInit() {
  }

  logout() {
    this.authService.signOut();
  }


}
