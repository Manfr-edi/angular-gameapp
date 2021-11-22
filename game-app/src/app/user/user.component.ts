import { Component, OnInit } from '@angular/core';
import { FriendListService } from 'src/app/shared/services/friend-list.service'; 
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UtilService } from 'src/app/shared/services/util.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
//import { map } from 'rxjs/operators';
import { userlist } from 'src/app/data/userlist/userlist';

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
  userDoc: any;

  //Dati visualizzati
  userInfo$: Observable<any>;
  list$: Observable<any[]>;

  constructor(private route: ActivatedRoute ,public db: AngularFirestore, public friendListService: FriendListService, public authService: AuthService) {
    
    const routeParams = this.route.snapshot.paramMap;
    this.userid = String(routeParams.get('userid'));
    this.util = new UtilService();
    this.userDoc = this.db.doc("Users/"+ this.userid);
    this.userInfo$ = this.userDoc.valueChanges();


    this.list$ =  this.userDoc.collection(this.viewlist).snapshotChanges();
  }


  //c'è un piccolo errore nel caricamento. può essere risolto mettendo ngOnInit ad async :-)
  ngOnInit(): void {
       this.checkFriend();
   }

  UpdateList(actualList: string): void {
    this.viewlist = actualList;
    this.list$ = this.userDoc.collection(this.viewlist).snapshotChanges();
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
}
