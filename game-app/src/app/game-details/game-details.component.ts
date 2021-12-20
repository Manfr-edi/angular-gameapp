import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { userlist } from '../data/userlist/userlist';
import { UtilService } from '../services/util.service';
import { AuthService } from '../services/auth.service';
import { GameCatalogueComponent } from '../game-catalogue/game-catalogue.component';
import { UserCollectionService } from '../services/user-collection.service';
import { GameCollectionService } from '../services/game-collection.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { AddToListComponent } from './add-to-list/add-to-list.component';

import * as firebase from 'firebase'

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.css']
})

export class GameDetailsComponent {

  //Game
  gameid = '';
  game$: Observable<any>;
  imgUrl: string = "";

  show: boolean = true;

  constructor(private route: ActivatedRoute, public util: UtilService, public authService: AuthService,
    public gameCollectionService: GameCollectionService) {
    //Lettura id del gioco
    const routeParams = this.route.snapshot.paramMap;
    this.gameid = String(routeParams.get('id'));

    //Lettura dati gioco
    var game = gameCollectionService.getGameWithImageUrl(this.gameid);

    this.game$ = game.game.valueChanges();
    game.url.then(url => this.imgUrl = url);
  }

  onShowInsertFormChanged(show: boolean) {
    this.show = !show;
  }

}
