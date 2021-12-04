import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { userlist } from '../data/userlist/userlist';
import { UtilService } from '../services/util.service';
import { AuthService } from '../services/auth.service';
import { GameCatalogueComponent } from '../game-catalogue/game-catalogue.component';
import { UserCollectionService} from '../services/user-collection.service';
import { GameCollectionService } from '../services/game-collection.service';
import { AngularFireStorage } from '@angular/fire/storage';


@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.css']
})



export class GameDetailsComponent implements OnInit {


  //Game
  game$: Observable<any>;
  gameid = '';

  userid = '';
  show = false;
  isinlist= true;

  isLoading = true;

  constructor(private route: ActivatedRoute, public util: UtilService, public authService: AuthService, public db: AngularFirestore,
    public gameCollectionService: GameCollectionService, public userCollectionService: UserCollectionService, public angularStorage: AngularFireStorage) {
    //Lettura id del gioco
    const routeParams = this.route.snapshot.paramMap;
    this.gameid = String(routeParams.get('id'));

    //Lettura dati gioco
    this.game$ = gameCollectionService.getGame(this.gameid).valueChanges();

    //lettura id utente
    this.userid = authService.currentUserId;

  }

  async ngOnInit() {
   this.isinlist= !(await this.userCollectionService.CheckUniqueList(this.gameid, this.userid))
   this.isLoading= false;
  }
  completed(event: boolean){
      this.isinlist= event;
  }
}
