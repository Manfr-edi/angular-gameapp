import { Component, OnInit } from '@angular/core';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AngularFirestore, QuerySnapshot, DocumentData } from '@angular/fire/firestore';
import { userlist } from 'src/app/data/userlist/userlist';

@Component({
  selector: 'app-spese',
  templateUrl: './spese.component.html',
  styleUrls: ['./spese.component.css']
})
export class SpeseComponent implements OnInit {

   genreList = genreList;
  platformList = platformList;
  userlists = userlist;

  genreSelected = "";
  platformSelected = "";

  avgPrice = 0;
  sumPrice = 0;
  countBougthGame = 0;

  constructor(public authService: AuthService, public db: AngularFirestore) { }

  ngOnInit(): void {
    this.updateSpese();
  }

  async updateSpese() {
    let sum = 0;
    let count = 0;

    var query: Promise<QuerySnapshot<DocumentData>>;
    for (let i = 0; i < 2; i++) {
      if (this.genreSelected == "")
        if (this.platformSelected == "")
          query = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.userlists[i].code).ref.get();
        else
          query = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.userlists[i].code).ref.where("platform", "==", this.platformSelected).get();
      else
        if (this.platformSelected == "")
          query = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.userlists[i].code).ref.where("genre", "==", this.genreSelected).get();
        else
          query = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.userlists[i].code).ref.where("genre", "==", this.genreSelected).where("platform", "==", this.platformSelected).get();

      await query.then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          sum += doc.get("price");
          count++;
        })
      });

    }

    if( count > 0)
    {
      this.sumPrice = sum ;
      this.avgPrice = sum / count;
      this.countBougthGame = count;
    }
    else
      this.sumPrice = this.avgPrice = this.countBougthGame = 0;
    /*
   

    let dbb = this.db;
    //this.db.collection('Users').doc(this.authService.currentUserId).collection(this.userlists[0].code).get().forEach( )

    console.log("inizio");
    await this.db.collection('Users').doc(this.authService.currentUserId).collection(this.userlists[0].code).ref.get().then(async function (querySnapshot) {
      querySnapshot.forEach(async function (doc) {

        let p = await( (await dbb.doc("Games/" + doc.id).ref.get()).get("price"));
       // console.log(await( (await dbb.doc("Games/" + doc.id).ref.get()).get("price")));
        giochiAcquistati.push(p);
      })});
        //prendo il prezzo
     /*   dbb.collection("Games/" + doc.id).ref.get()
          .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
              let data = doc.data();
              console.log(doc.get("price"));
            })
          });
      })
    });

  for(let g of giochiAcquistati)
console.log(g);
    console.log("fatto");
    */
  }
  /*
var giochiCompletati = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.userlists[0].code).get();
if (this.genreSelected != "")
  if (this.platformSelected != "") {
    this.gamesBought$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.viewlist, ref =>
      ref.where('genre', '==', this.genreSelected).where('platform', '==', this.platformSelected)
    ).snapshotChanges();
  }
  else
    this.games$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.viewlist, ref =>
      ref.where('genre', '==', this.genreSelected)
    ).snapshotChanges();
else
  if (this.platformSelected == "")
    this.games$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.viewlist).snapshotChanges();
  else
    this.games$ = this.db.collection('Users').doc(this.authService.currentUserId).collection(this.viewlist, ref =>
      ref.where('platform', '==', this.platformSelected)
    ).snapshotChanges();
    */
}
