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
  templateUrl: './gametab.component.html',
  styleUrls: ['./gametab.component.css']
})
export class GametabComponent implements OnInit {

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
  price = 0;

  games$: Observable<any[]>;

  //Piattaforme per un determinato gioco
  platformsGame: string[] = [];

  userDoc: AngularFirestoreDocument;

  constructor(public authService: AuthService, public gameListService: GameListService, public db: AngularFirestore) {
    //Init delle variabili
    this.util = new UtilService();
    this.games$ = new Observable;

    this.selectedList = this.userlists[0].code;
    this.userDoc = this.db.doc('Users/' + this.authService.currentUserId);
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


 /* async UpdateForm(id: string) {

    this.selectedList = this.viewlist;
    let g = await this.userDoc.collection(this.viewlist).doc(id).ref.get();

    this.platformsGame = (await this.db.doc('Games/' + id).ref.get()).get('platform');

    //Dati generici
    this.gameid = id;
    this.gametitle = g.get("title");

    //Dati per i giochi completati e in gioco
    if (this.viewlist !== this.userlists[2].code) {
      this.selectedPlatform = g.get("platform");
      this.price = g.get("price");
    }
    else
      this.selectedPlatform = this.platformsGame[0];

    //Dati per giochi completati
    if (this.viewlist === this.userlists[0].code) {
      this.note = g.get("note");
      this.time = g.get("completetime");
      this.vote = g.get("vote");
    }
  }*/

}
