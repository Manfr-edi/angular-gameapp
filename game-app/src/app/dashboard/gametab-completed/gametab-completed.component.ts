import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Observable, of } from 'rxjs';

import { AngularFirestore, AngularFirestoreCollection, QuerySnapshot, DocumentData } from '@angular/fire/firestore';
import { userlist } from '../../data/userlist/userlist';



import { UtilService } from '../../shared/services/util.service';
import { GameListService } from '../../shared/services/game-list.service';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';
import { getAttrsForDirectiveMatching } from '@angular/compiler/src/render3/view/util';

import * as firebase from 'firebase';

@Component({
  selector: 'app-gametab-completed',
  templateUrl: './gametab-completed.component.html',
  styleUrls: ['./gametab-completed.component.css']
})
export class GametabCompletedComponent implements OnInit {

  genreList = genreList;
  platformList = platformList;
  userlists = userlist;
  viewlist: string;

  //Filtri
  genreSelected = "";
  platformSelected = "";

  selectedList: string;
  selectedPlatform: string;
  gameid: string;
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


    this.viewlist = this.userlists[0].code;

    this.util = new UtilService();
    this.selectedList = this.userlists[0].code;
    this.selectedPlatform = '';
    this.gameid = '';
    this.gametitle = '';
    this.note = ''
    this.games$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.viewlist).snapshotChanges();
    this.game$ = new Observable;
    this.cgame$ = new Observable;

  }

  ngOnInit(): void {
  }

  UpdateList(actualList: string): void {
    this.viewlist = actualList;
    this.games$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.viewlist).snapshotChanges();
  }

  async onChangeFilter() {

    if (this.genreSelected != "")
      if (this.platformSelected != "") {
        this.games$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.viewlist, ref =>
          ref.where('genre', '==', this.genreSelected).where('platform', '==', this.platformSelected)
        ).snapshotChanges();
      }
      else
        this.games$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.viewlist, ref =>
          ref.where('genre', '==', this.genreSelected)
        ).snapshotChanges();
    else
      if (this.platformSelected == "")
        this.games$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.viewlist).snapshotChanges();
      else
        this.games$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.viewlist, ref =>
          ref.where('platform', '==', this.platformSelected)
        ).snapshotChanges();


    /*
    if (this.genreSelected != "") {
      let ids: Array<string> = [];
      let genre = this.genreSelected;
      console.log("genere: ", genre);

      await this.db.collection("Games").ref.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          if (doc.get("genre") == genre) {
            ids.push(doc.id);
            console.log(doc.id, " => ", doc.data());
          }
        })
      });

      this.games$ =
        this.db.collection("Users").doc(this.authService.currentUserId).collection(this.viewlist,
          ref => ref.where(firebase.default.firestore.FieldPath.documentId(), 'in', ids)).snapshotChanges();
    }
    else
      this.games$ =
        this.db.collection("Users").doc(this.authService.currentUserId).collection(this.viewlist).snapshotChanges();

        */
  }

  


  avg(games: any[]) {
    let sum = 0;
    for (let game of games)
      sum += game.payload.doc.data().CompleteTime;
    return sum / games.length;
  }

  async UpdateForm(id: string) {
    this.updateForm = !this.updateForm;
    if (this.updateForm) {
      this.game$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.viewlist).doc(id).valueChanges();
      this.cgame$ = this.db.collection('Games').doc(id).valueChanges();
      this.gametitle = '';
      this.selectedPlatform = '';
      this.note = '';
      this.time = 0;
      this.vote = 0;
      if (this.viewlist === this.userlists[0].code) {
        this.gameid = id;
        this.game$.subscribe(g => this.gametitle = g.title);
        this.game$.subscribe(g => this.selectedPlatform = g.platform);
        this.game$.subscribe(g => this.note = g.Note);
        this.game$.subscribe(g => this.time = g.CompleteTime);
        this.game$.subscribe(g => this.vote = g.Vote);
      }
      else {
        this.gameid = id;
        this.game$.subscribe(g => this.gametitle = g.title);
        this.game$.subscribe(g => this.note = g.Note);
      }
    }
  }



}
