import { Component, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';
import { UserLoggedService } from 'src/app/services/user-logged.service';
import { userlist } from '../../data/userlist/userlist';
import { AuthService } from '../../services/auth.service';
import { UserCollectionService } from '../../services/user-collection.service';
import { UtilService } from '../../services/util.service';

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
  filters: { platform?: string, genre?: string } = { platform: '', genre: '' };

  gameid: string = '';
  games$: Observable<any[]> = new Observable;
  urls: Map<string, string> = new Map;

  updateReport: EventEmitter<{ platform?: string, genre?: string }> = new EventEmitter;

  constructor(public authService: AuthService, public userCollectionService: UserCollectionService,
    private userLoggedService: UserLoggedService, public util: UtilService) {
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
    this.games$ = this.userCollectionService.getGamesWithFilters(this.viewlist, this.filters).snapshotChanges();
    this.updateReport.emit(this.filters);
  }

  completed(event: boolean) {
    this.updateForm = false;

    //Mando il segnale che permette di aggiornare il report delle spese
    this.updateReport.emit(this.filters);
  }
}
