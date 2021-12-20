import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { userlist } from '../../data/userlist/userlist';
import { UtilService } from '../../services/util.service';
import { UserCollectionService } from '../../services/user-collection.service';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';
import { UserLoggedService } from 'src/app/services/user-logged.service';
import * as firebase from 'firebase'

@Component({
  selector: 'app-game-tab',
  templateUrl: './game-tab.component.html',
  styleUrls: ['./game-tab.component.css']
})
export class GameTabComponent {

  //Data
  genreList = genreList;
  platformList = platformList;
  userlists = userlist;

  //Utility
  viewlist: string = userlist[0].code;
  updateForm = false;

  //Filtri
  genreSelected = "";
  platformSelected = "";
  
  gameid: string = '';
  games$: Observable<any[]> = new Observable;
  urls: Map<string, string> = new Map;

  constructor(public authService: AuthService, public userCollectionService: UserCollectionService,
    public userLoggedService: UserLoggedService, public util: UtilService) {
    //Carico la lista dei giochi da visualizzare di default
    this.UpdateList(this.viewlist);
  }

  UpdateList(list: string): void {
    this.viewlist = list;
    //Ricalcolo gli urls solo quando cambio la lista, visto che al cambiare di un filtro i nuovi urls
    //sarebbero solo un sottoinsieme
    let t = this.userCollectionService.getListWithImageUrls(this.viewlist);
    this.games$ = t.list.snapshotChanges();
    t.urls.then(urls => this.urls = urls);
  }

  async onChangeFilter() {
    this.games$ = this.userCollectionService.getGamesWithEqualFilterNotEmpty(this.viewlist,
      [{ par: "platform", val: this.platformSelected }, { par: "genre", val: this.genreSelected }]).snapshotChanges();
  }

  async onChangeFilterGenre() {
    this.games$ = this.userCollectionService.getGamesWithEqualGenre(this.viewlist, this.genreSelected).snapshotChanges();
  }

  completed(event: boolean) {
    this.updateForm = !event;
  } 
}
