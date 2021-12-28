import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { userlist } from 'src/app/data/userlist/userlist';
import { AuthService } from 'src/app/services/auth.service';
import { UtilService } from 'src/app/services/util.service';
import { Spese, UserCollectionService } from '../services/user-collection.service';
import { UserLoggedService } from '../services/user-logged.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  userlists = userlist;
  viewlist = this.userlists[0].code;
  isFriend?: boolean = undefined;
  hasRequest?: boolean = undefined;

  username = '';
  userid: string;

  //Dati visualizzati
  userInfo$: Observable<any>;
  gameList$: Observable<any[]> = new Observable;
  myGameList$: Observable<any[]> = new Observable;
  common$: any[] = [];
  userSpese: Spese = {} as Spese;
  mySpese: Spese = {} as Spese;

  userImgUrl?: string;
  imgUrlGameList: Map<string, string> = new Map;

  requestReceived = true;
  constructor(private route: ActivatedRoute, public authService: AuthService, private userCollectionService: UserCollectionService,
    public userLoggedService: UserLoggedService, public util: UtilService, private router: Router) {

    const routeParams = this.route.snapshot.paramMap;
    this.userid = String(routeParams.get('userid'));

    //Non permette all'utente di andare sulla propria pagina
    if (this.userid === authService.currentUserId)
      router.navigateByUrl("/");

    this.userInfo$ = this.userLoggedService.getUserDoc(this.userid).valueChanges();

    this.UpdateList(this.userlists[0].code);

    //Carico immagine profilo
    util.getUserImageUrl(this.userid).then(url => { if (url) this.imgUrlGameList.set(this.userid, url) });
  }

  async ngOnInit() {
    this.util.getUserImageUrl(this.userid).then(url => this.userImgUrl = url);

    this.userSpese = await this.userCollectionService.getShoppingReport(undefined, this.userid);
    this.mySpese = await this.userCollectionService.getShoppingReport();
    this.isFriend = await this.userLoggedService.checkIsFriend(this.userid);
    this.hasRequest = await this.userLoggedService.checkRequest(this.authService.currentUserId, this.userid);
    this.requestReceived = await this.userLoggedService.checkRequest(this.userid);
    
    if (this.isFriend)
      await this.CommonGames();
  }

  UpdateList(actualList: string): void {
    this.viewlist = actualList;

    let gameList = this.userCollectionService.getList(this.viewlist, this.userid);
    this.gameList$ = gameList.snapshotChanges();
    this.util.loadGameListImgUrls(gameList).then(urls => this.imgUrlGameList = urls);

    this.myGameList$ = this.userCollectionService.getList(this.viewlist).snapshotChanges();
  }

  async CommonGames() {

    this.common$ = [];
    for (let u of userlist) {
      this.userCollectionService.getList(u.code).get().forEach(games =>
        games.forEach(async game => {
          for (let u1 of userlist) {
            let g = await (this.userCollectionService.getGameFromList(game.id, u1.code, this.userid).ref.get());
            if (g.exists) {
              this.common$.push({
                title: g.get("title"), mytime: game.get("completetime"),
                usertime: g.get("completetime"), myprice: game.get("price"), userprice: g.get("price"),
                mylist: u.name,
                friendlist: u1.name
              });
              break;
            }
          }
        }))
    }
  }
}

