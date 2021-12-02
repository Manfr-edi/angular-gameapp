import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { UtilService } from 'src/app/services/util.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { userlist } from 'src/app/data/userlist/userlist';
import { UserCollectionService, Spese } from '../services/user-collection.service';
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

  username = '';
  userid: string;

  isCommonGames = false;

  //Dati visualizzati
  userInfo$: Observable<any>;
  gameList$: Observable<any[]> = new Observable;
  myGameList$: Observable<any[]> = new Observable;
  common$: any[] = [];
  userSpese: Spese = {} as Spese;
  mySpese: Spese = {} as Spese;

  constructor(private route: ActivatedRoute, public db: AngularFirestore, public authService: AuthService,
    public userCollectionService: UserCollectionService, public userLoggedService: UserLoggedService, public util: UtilService) {

    const routeParams = this.route.snapshot.paramMap;
    this.userid = String(routeParams.get('userid'));
    this.userInfo$ = this.userLoggedService.getUserDoc(this.userid).valueChanges();

    this.UpdateList(this.userlists[0].code);
  }

  async ngOnInit() {
    this.userSpese = await this.userCollectionService.getSpese("", "", this.userid);
    this.mySpese = await this.userCollectionService.getSpese("", "");

    this.isFriend = await this.userLoggedService.checkIsFriend(this.userid);
  }

  UpdateList(actualList: string): void {
    this.viewlist = actualList;
    this.gameList$ = this.userCollectionService.getList(this.viewlist, this.userid).snapshotChanges();
    this.myGameList$ = this.userCollectionService.getList(this.viewlist).snapshotChanges();
  }


  async CommonGames() {

    this.common$ = [];
    for (let u of userlist) {
      this.userCollectionService.getList(u.code).get().forEach(games =>
        games.forEach(async game => {
          for (let u1 of userlist) {
            let g = await (this.userCollectionService.getGameFromList(game.id, u1.code,this.userid).ref.get());
            if (g.exists) {
              this.common$.push({
                title: g.get("title"), mytime: game.get("completetime"),
                usertime: g.get("completetime"), myprice: game.get("price"), userprice: g.get("price")
              });
              break;
            }
          }
        }))
    }
  }
}

