import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { userlist } from '../data/userlist/userlist';
import { UtilService } from '../shared/services/util.service';
import { AuthService } from '../shared/services/auth.service';
import { GameListService } from '../shared/services/game-list.service';
import { GameCatalogueComponent } from '../game-catalogue/game-catalogue.component';
import { GameCatalogueService } from '../shared/services/game-catalogue.service';


@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.css']
})


export class GameDetailsComponent implements OnInit {

  //Utilities
  util: UtilService;
  userlists = userlist;

  //Game
  game$: Observable<any>;
  gameid = '';

  //Dati per l'inserimento
  selectedList: string;
  selectedPlatform: string;
  gametitle: string;
  time = 0;
  note: string;
  vote = 0;
  price = 0;
  isunique = false;

  constructor(private route: ActivatedRoute, public authService: AuthService, public gamelistService: GameListService, public db: AngularFirestore) {

    //Inizializzazione variabili
    this.util = new UtilService();
    this.selectedList = this.userlists[0].code;
    this.selectedPlatform = '';
    this.gametitle= '';
    this.note = '';

    //Lettura id del gioco
    const routeParams = this.route.snapshot.paramMap;
    this.gameid = String(routeParams.get('id'));

    //Lettura dati gioco
    this.game$ = db.doc('Games/'+this.gameid).valueChanges();

    //La piattaforma di default è la prima possibile per il gioco
    this.game$.subscribe(game => this.selectedPlatform = game.platform[0]);
    this.game$.subscribe(g => this.gametitle = g.title);

    if( authService.isUserEmailLoggedIn )
      gamelistService.CheckUniqueList(this.gameid).then(result => this.isunique = result)};

  ngOnInit() {
  }

}
