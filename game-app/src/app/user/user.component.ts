import { Component, OnInit } from '@angular/core';
import { FriendListService } from 'src/app/shared/services/friend-list.service'; 
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UtilService } from 'src/app/shared/services/util.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { userlist } from 'src/app/data/userlist/userlist';
import { GameListService } from '../shared/services/game-list.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  userlists= userlist;
  viewlist=this.userlists[0].code;
  isfriend=false;

  //Utilities
  util: UtilService;

  username='';
  userid: string;
  userDoc: AngularFirestoreDocument;
  myDoc: AngularFirestoreDocument;

  //Dati visualizzati
  userInfo$: Observable<any>;
  list$: Observable<any[]>;
  mylist$: Observable<any[]>;
  common$: any[] = [];
  spese ={sum: 0,avg: 0,count:0};
  spese_amico ={sum: 0,avg: 0,count:0};

  constructor(private route: ActivatedRoute ,public db: AngularFirestore, public friendListService: FriendListService, public authService: AuthService, public gameListService: GameListService) {
    
    const routeParams = this.route.snapshot.paramMap;
    this.userid = String(routeParams.get('userid'));
    this.util = new UtilService();
    this.userDoc = this.db.doc("Users/"+ this.userid);
    this.myDoc = this.db.doc("Users/" + authService.currentUserId);
    this.userInfo$ = this.userDoc.valueChanges();


    this.list$ =  this.userDoc.collection(this.viewlist).snapshotChanges();
    this.mylist$ = this.myDoc.collection(this.viewlist).snapshotChanges();
  }


  //c'è un piccolo errore nel caricamento. può essere risolto mettendo ngOnInit ad async :-)
  ngOnInit(): void {
       this.checkFriend();

       this.gameListService.updateSpese("","").then(s => {
        this.spese.avg = s.avgprice
        this.spese.count= s.countBoughtGame
        this.spese.sum= s.sumprice});

        this.gameListService.updateSpese("","", this.userid).then(s => {
        this.spese_amico.avg = s.avgprice
        this.spese_amico.count= s.countBoughtGame
        this.spese_amico.sum= s.sumprice});
   }

  UpdateList(actualList: string): void {
    this.viewlist = actualList;
    this.list$ = this.userDoc.collection(this.viewlist).snapshotChanges();
    this.mylist$ = this.myDoc.collection(this.viewlist).snapshotChanges();
  }

  async checkFriend(): Promise<void> {
      (await this.isFriend().then(result => this.isfriend = result))
   }

  async isFriend(): Promise<boolean>{
    if( await this.db.doc("Users/"+ this.authService.currentUserId).collection("Friends").doc(this.userid).ref
        .get().then(friend => friend.exists))
        {return true}
    
    return false;
  }


  async CommonGames(): Promise<void> {
    for (let i = 0; i < 2; i++)
      this.userDoc.collection(userlist[i].code).get().forEach(async games => games.forEach(async game => {

        for (let j = 0; j < 2; j++) {
          let d = (await this.myDoc.collection(userlist[j].code).doc(game.id).ref.get());
          if (d.exists) {
            this.common$.push({title: d.get("title"),mytime: d.get("completetime"), usertime: game.get("completetime"), myprice: d.get("price"), userprice: game.get("price")});
            console.log("Trovato il gioco "+game.get("completetime"))
            break;
          }
        }

      }));
  }
}

