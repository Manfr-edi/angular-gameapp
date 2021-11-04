import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Games,games} from '../games';
import { Observable } from 'rxjs';
import { FirebaseApp } from '@angular/fire';
import { AngularFirestore, AngularFirestoreDocument, DocumentChangeAction } from '@angular/fire/firestore';
import { UtilComponent } from '../util/util.component';

import { AuthService } from '../shared/services/auth.service';
import { TypeofExpr } from '@angular/compiler';

import { platform } from '../util/platform/platform';
import { userlist } from '../util/userlist/userlist';
import { not } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.css']
})


export class GameDetailsComponent implements OnInit {

  game$: Observable<any>;
  util   : UtilComponent;
  gameid = '';
  selectedOption: string;
  selectedPlatform: string;
  platforms = platform;
  userlists = userlist;
  time = 0;
  note: string;
  vote = 0;

  

  
  
  constructor(private route: ActivatedRoute, public authService: AuthService, public fdb : AngularFirestore) {
	  this.util = new UtilComponent();

	  const routeParams = this.route.snapshot.paramMap;
    const gameID = String(routeParams.get('id'));
    this.gameid = gameID;
    this.selectedOption = this.userlists[0].code;//this.options[0].value;
    this.selectedPlatform = '';
    this.note = '';

	  //fdb.collection('Games').doc(gameID).valueChanges().subscribe(val => console.log(val));
    this.game$ = fdb.collection('Games').doc(gameID).valueChanges();
    this.game$.subscribe(game => this.selectedPlatform=game.platform[0]);
   

   }

  ngOnInit() {
  }

   AddGame(){
    
    var ref = this.fdb.collection("Users").doc(this.authService.currentUserId);
    ref.collection(this.userlists[0].code).ref.where("id","==", this.gameid).get().then(game =>
       {if(game.empty){
          ref.collection(this.userlists[1].code).ref.where("id","==", this.gameid).get().then(game1 => {
            if(game1.empty){
              ref.collection(this.userlists[2].code).ref.where("id","==", this.gameid).get().then(game2 => {
                if(game2.empty){
                  if(this.selectedOption===this.userlists[0].code){
                      console.log(this.time);
                  }
                  if(this.selectedOption===this.userlists[0].code){
                    if(this.time <= 0 || this.time > 9999){
                      window.alert("Non hai inserito un tempo di completamento valido");
                      return;
                    }
                    this.fdb.collection("Users").doc(this.authService.currentUserId).collection(this.selectedOption).doc(this.gameid).set({id : this.gameid, platform : this.selectedPlatform, CompleteTime: this.time, Note: this.note});
                    if(this.vote > 0 && this.vote <= 10){this.fdb.collection("Users").doc(this.authService.currentUserId).collection(this.selectedOption).doc(this.gameid).update({Vote: this.vote})}
                    window.alert("e' stato aggiunto il gioco alla lista");
                    return;
                  }
                  this.fdb.collection("Users").doc(this.authService.currentUserId).collection(this.selectedOption).doc(this.gameid).set({id : this.gameid, Note: this.note});
                  window.alert("e' stato aggiunto il gioco alla lista");
                }
                else{
                window.alert("gioco gia' inserito in lista Desired");
                }
              })
            }
            else{
                window.alert("gioco gia' inserito in lista Playing");
                }
          })
       }
        else{
          window.alert("gioco gia' inserito in lista Completed");
        }});
    
  }

}