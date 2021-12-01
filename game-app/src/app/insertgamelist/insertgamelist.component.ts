import { Component, Input, OnChanges } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserCollectionService } from '../services/user-collection.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { userlist } from '../data/userlist/userlist';
import { GameCollectionService } from '../services/game-collection.service';

@Component({
  selector: 'app-insertgamelist',
  templateUrl: './insertgamelist.component.html',
  styleUrls: ['./insertgamelist.component.css']
})
export class InsertgamelistComponent implements OnChanges {

  //L'input gameid è obbligatorio ed indica l'id del gioco da aggiornare o da inserire
  //L'input updateList è facoltativo ed indica in quale lista spostare il gioco, quindi risulta obbligatorio in caso di Update 
  @Input() gameid: string = "";
  @Input() updateList: string = "";

  //Data
  userlists = userlist;

  //Dati per l'inserimento
  selectedList: string = '';
  selectedPlatform: string = '';
  gametitle: string = '';
  gamegenre: string = '';
  time: number = 0;
  note: string = '';
  vote: number = 0
  price: number = 0;
  show: boolean = false;
  platformsGame: string[] = [];

  constructor(public authService: AuthService, public userCollectionService: UserCollectionService, public gameCollectionService: GameCollectionService,
    public db: AngularFirestore) {
  }

  async UpdateForm() {
    //Dati del gioco nel catalogo
    let game = await this.gameCollectionService.getDataGame(this.gameid);

    //Piattaforme sulle quali è disponibile un gioco
    this.platformsGame = game.get('platform');
    //Titolo del gioco
    this.gametitle = game.get("title");
    //Genere del gioco
    this.gamegenre = game.get("genre");

    ///Nel caso si tratti di un update
    if (this.updateList !== '') {
      this.selectedList = this.updateList;
      //Dati relatiivi al gioco nella lista dell'utente
      let gameUserList = await this.userCollectionService.getGameDataFromList(this.gameid, this.updateList);

      //Dati per i giochi completati e in gioco
      if (this.updateList !== this.userlists[2].code) {
        this.selectedPlatform = gameUserList.get("platform");
        this.price = gameUserList.get("price");
      }
      else
        this.selectedPlatform = this.platformsGame[0];

      //Dati per giochi completati
      if (this.updateList === this.userlists[0].code) {
        this.note = gameUserList.get("note");
        this.time = gameUserList.get("completetime");
        this.vote = gameUserList.get("vote");
      }
    }
    else {
      this.selectedPlatform = this.platformsGame[0];
      this.selectedList = userlist[0].code;
    }
  }

  async ngOnChanges(changes: any) {

    //La form viene mostrata nel caso in cui sto facendo un Update oppure
    //nel caso in cui sto facendo un add di un gioco non inserito in un'altra lista
    if (this.updateList !== '' || await this.userCollectionService.CheckUniqueList(this.gameid)) {
      this.show = true;
      this.UpdateForm();
    }
  }

}
