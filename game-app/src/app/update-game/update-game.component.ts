import {Component, OnInit} from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { Observable,  } from 'rxjs';

import { AngularFirestore } from '@angular/fire/firestore';
import { userlist } from '../data/userlist/userlist';


import { UtilService } from '../shared/services/util.service';

@Component({
  selector: 'app-update-game',
  templateUrl: './update-game.component.html',
  styleUrls: ['./update-game.component.css']
})
export class UpdateGameComponent implements OnInit {


  
  constructor(public authService: AuthService, public db: AngularFirestore) { 
    
  }

  ngOnInit(): void {
  }

}
