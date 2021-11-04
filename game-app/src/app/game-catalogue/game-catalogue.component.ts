import { Component, OnInit } from '@angular/core';
import { FirebaseApp } from '@angular/fire';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { UtilComponent } from '../util/util.component'

@Component({
  selector: 'app-game-catalogue',
  templateUrl: './game-catalogue.component.html',
  styleUrls: ['./game-catalogue.component.css']
})


export class GameCatalogueComponent implements OnInit {
	
  games$ : Observable<DocumentChangeAction<any>[]>;
  coll : AngularFirestoreCollection<any>;
  title$ : BehaviorSubject<any>;
  util   : UtilComponent;
 
  
  constructor(public fdb: AngularFirestore) {
	  
	this.util = new UtilComponent();  
  this.title$ = new BehaviorSubject(null);
	this.coll= this.fdb.collection('Games');
	
	//DATO STAMPATO
	this.coll.valueChanges().subscribe(val => console.log(val));
	
    this.games$ = this.title$.pipe(
      switchMap(title => 
        this.fdb.collection('Games').snapshotChanges()
      )
    );
	
  }
  
  onKey(event : any) {
	  this.title$.next(event.target.value.toLowerCase());
  }
  
  ngOnInit() {
  }

}