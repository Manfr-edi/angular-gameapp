import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable,  } from 'rxjs';
import { UtilService } from '../shared/services/util.service';
import { AuthService } from '../shared/services/auth.service';
import { GameCatalogueService } from '../shared/services/game-catalogue.service';

@Component({
  selector: 'app-game-catalogue',
  templateUrl: './game-catalogue.component.html',
  styleUrls: ['./game-catalogue.component.css']
})

export class GameCatalogueComponent implements OnInit {

  //Dati visualizzati
  games$: Observable<any[]>;

  constructor(public db: AngularFirestore, public authService: AuthService, public gameCatalogueService: GameCatalogueService,
     public util: UtilService) {
    //Di default si mostra tutto il catalogo
    this.games$ = gameCatalogueService.getCatalogue().snapshotChanges();
  }

  onKey(event: any) {
    this.games$ = this.gameCatalogueService.getGamesByTitle(event.target.value.toLowerCase()).snapshotChanges();
  }

  ngOnInit() {
  }

}