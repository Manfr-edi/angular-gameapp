import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { userlist } from 'src/app/data/userlist/userlist';
import { UserCollectionService } from 'src/app/services/user-collection.service';

@Component({
  selector: 'app-shopping-report',
  templateUrl: './shopping-report.component.html',
  styleUrls: ['./shopping-report.component.css']
})
export class ShoppingReportComponent implements OnChanges {

  //Filtri
  @Input() genreSelected: string = "";
  @Input() platformSelected: string = "";
  
  //Data
  genreList = genreList;
  platformList = platformList;
  userlists = userlist;

  //Dati spese
  avgPrice = 0;
  sumPrice = 0;
  countBougthGame = 0;

 
  constructor(public authService: AuthService, public userCollectionService: UserCollectionService) {
   }

  ngOnChanges(changes: any){
    this.updateSpese();
  }

  async updateSpese() {
    let sum = 0;
    let count = 0;

    let filter = [{ par: "platform", val: this.platformSelected }, { par: "genre", val: this.genreSelected }];
    for (let i=0; i<2; i++) {

      await this.userCollectionService.getGamesWithEqualFilterNotEmpty(userlist[i].code, filter)
        .get().forEach(docs => docs.forEach(doc => {
          sum += doc.get("price");
          count++;
        }));
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
