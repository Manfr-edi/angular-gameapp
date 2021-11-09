import {Component, OnInit} from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Observable,  } from 'rxjs';

import { AngularFirestore } from '@angular/fire/firestore';
import { userlist } from '../../data/userlist/userlist';



import { UtilService } from '../../shared/services/util.service';
import { GameListService } from '../../shared/services/game-list.service';


@Component({
  selector: 'app-gametab-completed',
  templateUrl: './gametab-completed.component.html',
  styleUrls: ['./gametab-completed.component.css']
})
export class GametabCompletedComponent implements OnInit {

  userlists = userlist;

  selectedList: string;
  selectedPlatform: string;
  gametitle: string;
  time = 0;
  note: string;
  vote = 0;


  util: UtilService;
  games$: Observable<any[]>;

  updateForm = false;

  game$: Observable<any>;
  cgame$: Observable<any>;

  constructor(public authService: AuthService, public gamelistService: GameListService, public db: AngularFirestore) { 

      this.util = new UtilService();
      this.selectedList=this.userlists[0].code;
      this.selectedPlatform='';
      this.gametitle='';
      this.note=''
      this.games$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(userlist[0].code).snapshotChanges();
      this.game$ = new Observable;
      this.cgame$ = new Observable;
  }

  ngOnInit(): void {
  }

  RemoveGame(id: string){
    this.db.collection('Users').doc(this.authService.currentUserId).collection(userlist[0].code).doc(id).delete();
  }

  async UpdateForm(id: string){
    this.updateForm = !this.updateForm;
    if(this.updateForm){
      this.game$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(userlist[0].code).doc(id).valueChanges();
      this.cgame$ = this.db.collection('Games').doc(id).valueChanges();

      this.game$.subscribe(g=> this.gametitle=g.title);
      this.game$.subscribe(g=> this.selectedPlatform=g.platform);
      this.game$.subscribe(g=> this.note=g.Note);
      this.game$.subscribe(g=> this.time=g.CompleteTime);
      this.game$.subscribe(g=> this.vote=g.Vote);
    }
  }

 

}
