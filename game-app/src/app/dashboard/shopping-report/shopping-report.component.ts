import { Component, Input, OnChanges } from '@angular/core';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';
import { userlist } from 'src/app/data/userlist/userlist';
import { AuthService } from 'src/app/services/auth.service';
import { Spese, UserCollectionService } from 'src/app/services/user-collection.service';

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

  spesa: Spese = {} as Spese;

  constructor(private authService: AuthService, private userCollectionService: UserCollectionService) {
  }

  ngOnChanges(changes: any) {
    this.userCollectionService.GetSpese(this.platformSelected, this.genreSelected).then( spesa => this.spesa = spesa)
  }
}
