import { Component } from '@angular/core';
import { Observable, } from 'rxjs';
import { UtilService } from '../services/util.service';
import { AuthService } from '../services/auth.service';
import { GameCollectionService } from '../services/game-collection.service';

@Component({
  selector: 'app-game-catalogue',
  templateUrl: './game-catalogue.component.html',
  styleUrls: ['./game-catalogue.component.css']
})

export class GameCatalogueComponent {

  games$: Observable<any[]>;
  urls: Map<string, string> = new Map;

  constructor(public authService: AuthService, public gameCollectionService: GameCollectionService, public util: UtilService) {
    let games = gameCollectionService.getCatalogueWithImageUrls();
    this.games$ = games.catalogue.snapshotChanges();
    games.urls.then(urls => this.urls = urls);
  }

  onKey(event: any) {
    this.games$ = this.gameCollectionService.getGamesByTitle(event.target.value.toLowerCase()).snapshotChanges();
  }


}