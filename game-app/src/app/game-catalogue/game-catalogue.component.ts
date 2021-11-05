import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable,  } from 'rxjs';
import { UtilService } from '../shared/services/util.service';

@Component({
  selector: 'app-game-catalogue',
  templateUrl: './game-catalogue.component.html',
  styleUrls: ['./game-catalogue.component.css']
})


export class GameCatalogueComponent implements OnInit {

  //Utilities
  util: UtilService;

  //Dati visualizzati
  games$: Observable<any[]>;


  constructor(public db: AngularFirestore) {
    this.util = new UtilService();
    //Di default si mostra tutto il catalogo
    this.games$ = this.db.collection('Games').snapshotChanges();
  }

  onKey(event: any) {
    let title = event.target.value.toLowerCase();

    this.games$ = this.db.collection('Games', ref =>
      ref.where('title', '>=', title).where('title', '<=', title + '\uf8ff')
    ).snapshotChanges();
  }

  ngOnInit() {
  }

}