import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { userlist } from '../data/userlist/userlist';
import { UtilService } from '../services/util.service';
import { AuthService } from '../services/auth.service';
import { GameCatalogueComponent } from '../game-catalogue/game-catalogue.component';
import { GameCollectionService } from '../services/game-collection.service';


@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.css']
})


export class GameDetailsComponent implements OnInit {

  //Game
  game$: Observable<any>;
  gameid = '';

  constructor(private route: ActivatedRoute, public util: UtilService, public authService: AuthService, public db: AngularFirestore,
    public gameCollectionService: GameCollectionService) {
    //Lettura id del gioco
    const routeParams = this.route.snapshot.paramMap;
    this.gameid = String(routeParams.get('id'));

    //Lettura dati gioco
    this.game$ = gameCollectionService.getGame(this.gameid).valueChanges();
  }

  ngOnInit() {

  }

}
