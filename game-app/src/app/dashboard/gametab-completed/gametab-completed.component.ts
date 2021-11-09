import {Component, OnInit} from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Observable,  } from 'rxjs';

import { AngularFirestore } from '@angular/fire/firestore';
import { userlist } from '../../data/userlist/userlist';



import { UtilService } from '../../shared/services/util.service';


@Component({
  selector: 'app-gametab-completed',
  templateUrl: './gametab-completed.component.html',
  styleUrls: ['./gametab-completed.component.css']
})
export class GametabCompletedComponent implements OnInit {

  userlists = userlist;

  selectedList: string;
  selectedPlatform: string;
  gametitle: string;
  time = 0;
  note: string;
  vote = 0;


  util: UtilService;
  games$: Observable<any[]>;

  updateForm = false;

  game$: Observable<any>;
  cgame$: Observable<any>;

  constructor(public authService: AuthService, public db: AngularFirestore) { 

      this.util = new UtilService();
      this.selectedList=this.userlists[0].code;
      this.selectedPlatform='';
      this.gametitle='';
      this.note=''
      this.games$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(userlist[0].code).snapshotChanges();
      this.game$ = new Observable;
      this.cgame$ = new Observable;
  }

  ngOnInit(): void {
  }

  RemoveGame(id: string){
    this.db.collection('Users').doc(this.authService.currentUserId).collection(userlist[0].code).doc(id).delete();
  }

  async UpdateForm(id: string){
    this.updateForm = !this.updateForm;
    if(this.updateForm){
      this.game$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(userlist[0].code).doc(id).valueChanges();
      this.cgame$ = this.db.collection('Games').doc(id).valueChanges();

      this.game$.subscribe(g=> this.gametitle=g.title);
      this.game$.subscribe(g=> this.selectedPlatform=g.platform);
      this.game$.subscribe(g=> this.note=g.Note);
      this.game$.subscribe(g=> this.time=g.CompleteTime);
      this.game$.subscribe(g=> this.vote=g.Vote);
    }
  }

  async  AddGame(id: string){


        //Riferimento al documento relativo all'utente loggato
    var ref = this.db.collection("Users").doc(this.authService.currentUserId);

    //Controlli per verificare che il gioco non sia presente già in una lista
    for (var i = 0; i < this.userlists.length; i++) {
      if (await ref.collection(this.userlists[i].code).ref.where("id", "==", id).get().then(
        game => !game.empty)) {
        window.alert("Gioco gia' inserito in lista " + this.userlists[i].name);
        return;
      }
    }

    //Genero il documento base per inserire un gioco in una lista
     let doc = new Map<String, any>([
        
        ["Note", this.note]
    ]);

    //Controlli per l'inserimento in lista completati
    if( this.selectedList === this.userlists[0].code)
    {
      if( this.time <= 0 || this.time > 9999 )
      {
        window.alert("Non hai inserito un tempo di completamento valido");
        return;
      }

      //Nel caso il tempo di completamento sia valido
      doc.set("CompleteTime", this.time);

      //Viene inserita la piattaforma
      doc.set("platform", this.selectedPlatform);

      //Nel caso sia stato inserito un voto valido, lo inserisco, altrimenti no essendo opzionale
      if( this.vote > 0){
        var y: number = +this.vote;
        doc.set("Vote", y);
      }
        
    }

    //Inserimento documento nel database
    //ref.collection(this.selectedList).doc(id).set(Object.fromEntries(doc));
    ref.collection(this.selectedList).doc(id).update(Object.fromEntries(doc));
    
    window.alert("e' stato aggiunto il gioco alla lista");
  }

}
