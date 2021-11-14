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

  //Data
  genreList = genreList;
  platformList = platformList;
  userlists = userlist;

  //Filtri
  genreSelected = "";
  platformSelected = "";

  //Dati spese
  avgPrice = 0;
  sumPrice = 0;
  countBougthGame = 0;

  //Documento usente
  userDoc: any;

  constructor(public authService: AuthService, public db: AngularFirestore) {
    this.userDoc = this.db.collection('Users').doc(this.authService.currentUserId);
  }

  ngOnInit(): void {
    this.updateSpese();
  }

  async updateSpese() {
    let sum = 0;
    let count = 0;

    

    var query: Promise<QuerySnapshot<DocumentData>>;
    for (let i = 0; i < 2; i++) {
      let userListRef = this.userDoc.collection(this.userlists[i].code).ref;

      if (this.genreSelected == "")
        if (this.platformSelected == "")
          query = userListRef.get();
        else
          query = userListRef.where("platform", "==", this.platformSelected).get();
      else
        if (this.platformSelected == "")
          query = userListRef.where("genre", "==", this.genreSelected).get();
        else
          query = userListRef.where("genre", "==", this.genreSelected).where("platform", "==", this.platformSelected).get();

      //Calcolo la spesa totale e il numedo di giochi
      await query.then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          sum += doc.get("price");
          count++;
        })
      });

    }

    //Calcolo la media e aggiorno i dati
    if (count > 0) {
      this.sumPrice = sum;
      this.avgPrice = sum / count;
      this.countBougthGame = count;
    }
    else
      this.sumPrice = this.avgPrice = this.countBougthGame = 0;
  }

}
