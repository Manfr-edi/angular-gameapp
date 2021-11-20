import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { userlist } from '../../data/userlist/userlist';
import { UtilService } from '../../shared/services/util.service';
import { GameListService } from '../../shared/services/game-list.service';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';
import { UserLoggedService } from 'src/app/shared/services/user-logged.service';

@Component({
  selector: 'app-gametab',
  templateUrl: './gametab.component.html',
  styleUrls: ['./gametab.component.css']
})
export class GametabComponent implements OnInit {

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

  constructor(public authService: AuthService, public gameListService: GameListService, public db: AngularFirestore,
    public userLoggedService: UserLoggedService, public util: UtilService) {
    //La lista di default � Completed
    this.selectedList = this.userlists[0].code;
    //Carico la lista dei giochi da visualizzare di default
    this.UpdateList(this.selectedList);
  }

  ngOnInit(): void {
  }

  UpdateList(actualList: string): void {
    this.viewlist = actualList;
    this.games$ = this.gameListService.getList(this.viewlist).snapshotChanges();
  }

  async onChangeFilter() {
    this.games$ = this.gameListService.getGamesWithEqualFilterNotEmpty(this.viewlist, 
      [{par:"platform", val:this.platformSelected}, {par:"genre", val:this.genreSelected}]).snapshotChanges();
  }
}
