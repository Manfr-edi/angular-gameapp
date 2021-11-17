import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { GameListService } from '../shared/services/game-list.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { userlist } from '../data/userlist/userlist';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-insertgamelist',
  templateUrl: './insertgamelist.component.html',
  styleUrls: ['./insertgamelist.component.css']
})
export class InsertgamelistComponent implements OnChanges {

  @Input() gameid: string = "";
  @Input() viewlist: string = "";

  userlists = userlist;

  game$: Observable<any> = new Observable;

  //Dati per l'inserimento
  selectedList: string;
  selectedPlatform: string;
  gametitle: string;
  time = 0;
  note: string;
  vote = 0;
  price = 0;
  show = false;

  //viewlist: string = '';//userlist[0].code;
  userDoc: AngularFirestoreDocument;
  platformsGame: string[] = [];

  constructor(private route: ActivatedRoute, public authService: AuthService, public gamelistService: GameListService, public db: AngularFirestore) {
    //Inizializzazione variabili
    this.selectedList = this.userlists[0].code;
    this.selectedPlatform = '';
    this.gametitle = '';
    this.note = '';

    this.userDoc = this.db.doc("Users/" + this.authService.currentUserId);

    
  }

  async UpdateForm() {
    this.selectedList = this.viewlist;
    let g = await this.userDoc.collection(this.viewlist).doc(this.gameid).ref.get();

    console.log(g);
    this.platformsGame = (await this.db.doc('Games/' + this.gameid).ref.get()).get('platform');

    //Dati generici
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
  }

  ngOnChanges(changes: any){

    console.log("il valore di viewlist "+ this.viewlist);
    console.log("il valore di gameid "+ this.gameid);

    //Lettura dati gioco
    this.game$ = this.db.doc('Games/' + this.gameid).valueChanges();

    //La piattaforma di default è la prima possibile per il gioco
    this.game$.subscribe(game => this.selectedPlatform = game.platform[0]);
    this.game$.subscribe(g => this.gametitle = g.title);
    this.gamelistService.CheckUniqueList(this.gameid).then(result => this.show = result);
    
    
    if(this.viewlist!=='')
      {this.UpdateForm();}
 }

}
