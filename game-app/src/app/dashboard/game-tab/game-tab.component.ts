import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { userlist } from '../../data/userlist/userlist';
import { UtilService } from '../../services/util.service';
import { UserCollectionService } from '../../services/user-collection.service';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';
import { UserLoggedService } from 'src/app/services/user-logged.service';

@Component({
  selector: 'app-game-tab',
  templateUrl: './game-tab.component.html',
  styleUrls: ['./game-tab.component.css']
})
export class GameTabComponent implements OnInit {

  //Data
  genreList = genreList;
  platformList = platformList;
  userlists = userlist;

  //Utility
  viewlist: string = '';
  updateForm = false;

  //Filtri
  genreSelected = "";
  platformSelected = "";

  //Dati per Update Gioco
  gameid: string = '';
  selectedList: string = '';
  selectedPlatform: string = '';
  gametitle: string = '';
  time: number = 0;
  note: string = '';
  vote: number = 0;
  price: number = 0;

  games$: Observable<any[]> = new Observable;

  //Piattaforme per un determinato gioco
  platformsGame: string[] = [];

  constructor(public authService: AuthService, public userCollectionService: UserCollectionService, public db: AngularFirestore,
    public userLoggedService: UserLoggedService, public util: UtilService) {
    //La lista di default � Completed
    this.selectedList = this.userlists[0].code;
    //Carico la lista dei giochi da visualizzare di default
    this.UpdateList(this.selectedList);
  }

  ngOnInit(): void {
  }

  UpdateList(actualList: string): void {
    if (this.viewlist != actualList) {
      this.viewlist = actualList;
      this.games$ = this.userCollectionService.getList(this.viewlist).snapshotChanges();
    }
  }

  async onChangeFilter() {
    this.games$ = this.userCollectionService.getGamesWithEqualFilterNotEmpty(this.viewlist,
      [{ par: "platform", val: this.platformSelected }, { par: "genre", val: this.genreSelected }]).snapshotChanges();
  }

  completed(event: boolean) {
    this.updateForm = !event;
  }
}
