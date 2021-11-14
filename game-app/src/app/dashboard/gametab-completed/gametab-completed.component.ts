import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { userlist } from '../../data/userlist/userlist';
import { UtilService } from '../../shared/services/util.service';
import { GameListService } from '../../shared/services/game-list.service';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';

@Component({
  selector: 'app-gametab-completed',
  templateUrl: './gametab-completed.component.html',
  styleUrls: ['./gametab-completed.component.css']
})
export class GametabCompletedComponent implements OnInit {

  //Data
  genreList = genreList;
  platformList = platformList;
  userlists = userlist;

  //Utility
  util: UtilService;
  viewlist: string = '';
  updateForm = false;

  //Filtri
  genreSelected = "";
  platformSelected = "";

  //Dati per Update Gioco
  gameid: string;
  selectedList: string;
  selectedPlatform: string;
  gametitle: string;
  time = 0;
  note: string;
  vote = 0;

  games$: Observable<any[]>;

  //Piattaforme per un determinato gioco
  platformsGame : string[] = [];

  userDoc: AngularFirestoreDocument;

  constructor(public authService: AuthService, public gamelistService: GameListService, public db: AngularFirestore) {
    //Init delle variabili
    this.util = new UtilService();
    this.games$ = new Observable;
    
    this.selectedList = this.userlists[0].code;
    this.userDoc = this.db.collection('Users').doc(this.authService.currentUserId);
    this.selectedPlatform = '';
    this.gameid = '';
    this.gametitle = '';
    this.note = ''

    //Carico la lista dei giochi da visualizzare di default
    this.UpdateList(this.userlists[0].code);
  }

  ngOnInit(): void {
  }

  UpdateList(actualList: string): void {
    this.viewlist = actualList;
    this.games$ = this.userDoc.collection(this.viewlist).snapshotChanges();
  }

  async onChangeFilter() {

    if (this.genreSelected != "")
      if (this.platformSelected != "") {
        this.games$ = this.userDoc.collection(this.viewlist, ref =>
          ref.where('genre', '==', this.genreSelected).where('platform', '==', this.platformSelected)
        ).snapshotChanges();
      }
      else
        this.games$ = this.userDoc.collection(this.viewlist, ref =>
          ref.where('genre', '==', this.genreSelected)
        ).snapshotChanges();
    else
      if (this.platformSelected == "")
        this.games$ = this.userDoc.collection(this.viewlist).snapshotChanges();
      else
        this.games$ = this.userDoc.collection(this.viewlist, ref =>
          ref.where('platform', '==', this.platformSelected)
        ).snapshotChanges();
  }

  avg(games: any[]) {
    let sum = 0;
    for (let game of games)
      sum += game.payload.doc.data().CompleteTime;
    return sum / games.length;
  }

  async UpdateForm(id: string) {

    let g = await this.userDoc.collection(this.viewlist).doc(id).ref.get();

    this.platformsGame = (await this.db.collection('Games').doc(id).ref.get()).get('platform');
    
    //Dati generici
    this.gameid = id;
    this.gametitle = g.get("title");

    //Dati per i giochi completati e desiderati
    if( this.viewlist !== this.userlists[2].code )
      this.selectedPlatform = g.get("platform");

    //Dati per giochi completati
    if (this.viewlist === this.userlists[0].code) {
      this.note = g.get("Note");
      this.time = g.get("CompleteTime");
      this.vote = g.get("Vote");
    }
  }

}
