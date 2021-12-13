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


@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.css']
})



export class GameDetailsComponent {

  //Game
  game$: Observable<any>;
  gameid = '';
  
  show: boolean = true;

  constructor(private route: ActivatedRoute, public util: UtilService, public authService: AuthService,
    public gameCollectionService: GameCollectionService, public userCollectionService: UserCollectionService) {
    //Lettura id del gioco
    const routeParams = this.route.snapshot.paramMap;
    this.gameid = String(routeParams.get('id'));

    //Lettura dati gioco
    this.game$ = gameCollectionService.getGame(this.gameid).valueChanges();
  }

  onShowInsertFormChanged(show: boolean)
  {
    this.show = !show;
  }

}
