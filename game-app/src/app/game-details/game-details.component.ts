import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';



import { platformList } from '../data/platform/platform';
import { userlist } from '../data/userlist/userlist';

import { UtilService } from '../shared/services/util.service';
import { AuthService } from '../shared/services/auth.service';


@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.css']
})


export class GameDetailsComponent implements OnInit {

  //Utilities
  util: UtilService;
  platforms = platformList;
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

  constructor(private route: ActivatedRoute, public authService: AuthService, public db: AngularFirestore) {

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
    this.game$ = db.collection('Games').doc(this.gameid).valueChanges();

    //La piattaforma di default è la prima possibile per il gioco
    this.game$.subscribe(game => this.selectedPlatform = game.platform[0]);
    this.game$.subscribe(g => this.gametitle = g.title);
  }

  ngOnInit() {
  }

  async AddGame() {

    //Riferimento al documento relativo all'utente loggato
    var ref = this.db.collection("Users").doc(this.authService.currentUserId);

    //Controlli per verificare che il gioco non sia presente già in una lista
    for (var i = 0; i < this.userlists.length; i++) {
      if (await ref.collection(this.userlists[i].code).ref.where("id", "==", this.gameid).get().then(
        game => !game.empty)) {
        window.alert("Gioco gia' inserito in lista " + this.userlists[i].name);
        return;
      }
    }

    //Genero il documento base per inserire un gioco in una lista
     let doc = new Map<String, any>([
        ["title", this.gametitle],
        ["Note", this.note]
    ]);

    //Controlli per l'inserimento in lista completati
    if( this.selectedList === this.userlists[0].code)
    {
      if( this.time <= 0 || this.time > 9999 )
      {
        window.alert("Non hai inserito un tempo di completamento valido");
        return;
      }

      //Nel caso il tempo di completamento sia valido
      doc.set("CompleteTime", this.time);

      //Viene inserita la piattaforma
      doc.set("platform", this.selectedPlatform);

      //Nel caso sia stato inserito un voto valido, lo inserisco, altrimenti no essendo opzionale
      if( this.vote > 0){
        var y: number = +this.vote;
        doc.set("Vote", y);
      }
        
    }

    //Inserimento documento nel database
    ref.collection(this.selectedList).doc(this.gameid).set(Object.fromEntries(doc));
    window.alert("e' stato aggiunto il gioco alla lista");
  }

}
