import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { userlist } from '../data/userlist/userlist';
import { AuthService } from '../services/auth.service';
import { GameCollectionService } from '../services/game-collection.service';
import { UserCollectionService } from '../services/user-collection.service';
import { UtilService } from '../services/util.service';

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
  gametitle: string = '';
  gamegenre: string = '';
  show: boolean = false;
  platformsGame: string[] = [];
  imgUrl: string = "";

  gameForm: FormGroup;

  isLoading: boolean = true;

  constructor(private authService: AuthService, private userCollectionService: UserCollectionService,
    private gameCollectionService: GameCollectionService, public util: UtilService, private fb: FormBuilder,
    private _snackBar: MatSnackBar) {

    this.gameForm = fb.group({
      destinationList: ['', Validators.required],
      time: [0, [Validators.required, util.getCompletedTimeValidators()]],
      vote: [0],
      platform: ['', Validators.required],
      price: [0, [Validators.required, util.getPriceValidators()]],
      note: ['']
    });
  }

  async ngOnChanges(changes: any) {

    //La form viene mostrata nel caso in cui sto facendo un Update oppure
    //nel caso in cui sto facendo un add di un gioco non inserito in un'altra lista
    if (this.updateList !== '' || await this.userCollectionService.CheckUniqueList(this.gameid)) {
      this.show = true
      this.updateForm().then(() => {
        this.onChangeList();
        this.util.getGameImageUrl(this.gameid).then(url => { this.imgUrl = url; this.isLoading = false; })
      });
    }
  }

  async updateForm() {
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
      //this.selectedList.setValue(this.updateList); CAMBIO
      this.gameForm.controls['destinationList'].setValue(this.updateList);
      //Dati relatiivi al gioco nella lista dell'utente
      let gameUserList = await this.userCollectionService.getGameDataFromList(this.gameid, this.updateList);

      //Dati per i giochi completati e in gioco
      if (this.updateList !== this.userlists[2].code) {
        this.gameForm.controls['platform'].setValue(this.platformsGame[0]);
        this.gameForm.controls['price'].setValue(gameUserList.get("price"));
      }
      else
        this.gameForm.controls['platform'].setValue(this.platformsGame[0]);

      //Dati per giochi completati
      if (this.updateList === this.userlists[0].code) {
        this.gameForm.controls['note'].setValue(gameUserList.get("note"));
        this.gameForm.controls['time'].setValue(gameUserList.get("completetime"));
        this.gameForm.controls['vote'].setValue(gameUserList.get("vote"));
      }
    }
    else {
      this.gameForm.controls['platform'].setValue(this.platformsGame[0]);
      this.gameForm.controls['destinationList'].setValue(userlist[0].code);
    }
  }

  onChangeList() {
    let list = this.gameForm.get("destinationList")?.value;

    if (list === userlist[0].code) //Completed
    {
      this.gameForm.get("time")?.enable();
      this.gameForm.get("vote")?.enable();
      this.gameForm.get("platform")?.enable();
      this.gameForm.get("price")?.enable();
    }
    else
      if (list === userlist[1].code) //In Game
      {
        this.gameForm.get("time")?.disable();
        this.gameForm.get("vote")?.disable();
        this.gameForm.get("platform")?.enable();
        this.gameForm.get("price")?.enable();
      }
      else //Desidered
      {
        this.gameForm.get("time")?.disable();
        this.gameForm.get("vote")?.disable();
        this.gameForm.get("platform")?.disable();
        this.gameForm.get("price")?.disable();
      }
  }

  async onSubmit() {
    this.userCollectionService.UpdateGame(this.gameForm.get("destinationList")?.value, this.updateList, this.gameid,
      this.gametitle, this.gameForm.get("note")?.value,
      this.gameForm.get("time")?.value, this.gameForm.get("vote")?.value,
      this.gameForm.get("platform")?.value, this.gamegenre, this.gameForm.get("price")?.value)
      .then(res => {
        this._snackBar.open(res ? "Lista videogiochi aggiornata correttamente!" :
          "Impossibile aggiornare lista videogiochi!", 'Ok', { duration: 2000 });
        this.completed.emit(res);
      });
  }

  checkField(field: string, name: string, map: Map<string, string>) {
    let msg = this.util.getFieldMsgError(this.gameForm.get(field) as FormControl, name, map);

    if (msg)
      this._snackBar.open(msg, 'Ok', { duration: 2000 });
  }

}
