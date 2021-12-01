import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable,  } from 'rxjs';
import { UtilService } from '../services/util.service';
import { AuthService } from '../services/auth.service';
import { GameCollectionService } from '../services/game-collection.service';

@Component({
  selector: 'app-game-catalogue',
  templateUrl: './game-catalogue.component.html',
  styleUrls: ['./game-catalogue.component.css']
})

export class GameCatalogueComponent implements OnInit {

  //Dati visualizzati
  games$: Observable<any[]>;

  constructor(public db: AngularFirestore, public authService: AuthService, public gameCollectionService: GameCollectionService,
     public util: UtilService) {
    //Di default si mostra tutto il catalogo
    this.games$ = gameCollectionService.getCatalogue().snapshotChanges();
  }

  onKey(event: any) {
    this.games$ = this.gameCollectionService.getGamesByTitle(event.target.value.toLowerCase()).snapshotChanges();
  }

  ngOnInit() {
  }

}