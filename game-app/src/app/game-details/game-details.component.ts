import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { GameCollectionService } from '../services/game-collection.service';
import { UtilService } from '../services/util.service';


@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.css']
})

export class GameDetailsComponent {

  //Game
  gameid = '';
  game$: Observable<any>;
  imgUrl: string = "";

  show: boolean = true;

  constructor(private route: ActivatedRoute, public util: UtilService, public authService: AuthService,
    private gameCollectionService: GameCollectionService) {
    //Lettura id del gioco
    const routeParams = this.route.snapshot.paramMap;
    this.gameid = String(routeParams.get('id'));

    //Lettura dati gioco
    var game = gameCollectionService.getGameWithImageUrl(this.gameid);

    this.game$ = game.game.valueChanges();
    game.url.then(url => this.imgUrl = url);
  }

  onShowInsertFormChanged(show: boolean) {
    this.show = !show;
  }

}
