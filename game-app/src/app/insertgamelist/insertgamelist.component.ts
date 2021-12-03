import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserCollectionService } from '../services/user-collection.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { userlist } from '../data/userlist/userlist';
import { GameCollectionService } from '../services/game-collection.service';
import { UtilService } from '../services/util.service';
import { FormControl, FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-insertgamelist',
  templateUrl: './insertgamelist.component.html',
  styleUrls: ['./insertgamelist.component.css']
})
export class InsertgamelistComponent implements OnChanges {

  //L'input gameid � obbligatorio ed indica l'id del gioco da aggiornare o da inserire
  //L'input updateList � facoltativo ed indica in quale lista spostare il gioco, quindi risulta obbligatorio in caso di Update 
  @Input() gameid: string = "";
  @Input() updateList: string = "";

  @Output() completed: EventEmitter<boolean> = new EventEmitter<boolean>();

  result: boolean = false;

  //Data
  userlists = userlist;

  //Dati per l'inserimento
  //selectedList: string = '';
  selectedList: FormControl = new FormControl('');
  selectedPlatform: FormControl = new FormControl('');
  gametitle: string = '';
  gamegenre: string = '';
  time: FormControl = new FormControl(0);
  note: FormControl = new FormControl('');
  vote: FormControl = new FormControl(0);
  price: FormControl = new FormControl(0);
  show: boolean = false;
  platformsGame: string[] = [];

  options: FormGroup;

  constructor(public authService: AuthService, public userCollectionService: UserCollectionService,
    public gameCollectionService: GameCollectionService, public db: AngularFirestore, public util: UtilService,
    fb: FormBuilder) {

    this.options = fb.group({
      selectedList: this.selectedList,
      time: this.time,
      note: this.note,
      selectedPlatform: this.selectedPlatform,
      vote: this.vote,
      price: this.price

    });
  }

  async UpdateForm() {
    //Dati del gioco nel catalogo
    let game = await this.gameCollectionService.getDataGame(this.gameid);

    //Piattaforme sulle quali � disponibile un gioco
    this.platformsGame = game.get('platform');
    //Titolo del gioco
    this.gametitle = game.get("title");
    //Genere del gioco
    this.gamegenre = game.get("genre");

    ///Nel caso si tratti di un update
    if (this.updateList !== '') {
      this.selectedList.setValue(this.updateList);
      //Dati relatiivi al gioco nella lista dell'utente
      let gameUserList = await this.userCollectionService.getGameDataFromList(this.gameid, this.updateList);

      //Dati per i giochi completati e in gioco
      if (this.updateList !== this.userlists[2].code) {
        this.selectedPlatform.setValue(gameUserList.get("platform"));
        this.price.setValue(gameUserList.get("price"));
      }
      else
        this.selectedPlatform.setValue(this.platformsGame[0]);

      //Dati per giochi completati
      if (this.updateList === this.userlists[0].code) {
        this.note.setValue(gameUserList.get("note"));
        this.time.setValue(gameUserList.get("completetime"));
        this.vote.setValue(gameUserList.get("vote"));
      }
    }
    else {
      this.selectedPlatform.setValue(this.platformsGame[0]);
      this.selectedList.setValue(userlist[0].code);
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

  async Update(){
    
   this.completed.emit(await this.userCollectionService.UpdateGame(this.selectedList.value, this.updateList, this.gameid,
      this.gametitle, this.note.value, this.time.value, this.vote.value, this.selectedPlatform.value, this.gamegenre, this.price.value));
      
   }

}
