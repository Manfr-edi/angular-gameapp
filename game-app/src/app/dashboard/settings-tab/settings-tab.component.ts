import { Component, OnInit } from '@angular/core';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { UserLoggedService } from 'src/app/services/user-logged.service';

@Component({
  selector: 'app-settings-tab',
  templateUrl: './settings-tab.component.html',
  styleUrls: ['./settings-tab.component.css']
})
export class SettingsTabComponent implements OnInit {

  //Data
  genreList = genreList;
  platformList = platformList;

  //Filtri
  selectedGenre = "";
  selectedPlatform = "";

  //Selezione dei dati
  genres: boolean[] = [];
  platforms: boolean[] = [];

  constructor(public authService: AuthService, public userLoggedService: UserLoggedService) {
  }

  async ngOnInit() {
    this.initList("Platforms", this.platformList, this.platforms);
    this.initList("Genres", this.genreList, this.genres);
  }

  updateData(colDB: string, list: string[], selected: boolean[]) {
    let dataSelected: string[] = [];

    for (let i = 0; i < list.length; i++)
      if (selected[i])
        dataSelected.push(list[i]);

    this.userLoggedService.updateUser({ [colDB]: dataSelected });
  }

  async initList(parDB: string, list: string[], selected: boolean[]) {

    let listaDB: string[] = await this.userLoggedService.getUserDataParam(parDB);

    let i = 0;
    let f;

    if (listaDB !== undefined)
      for (let l of list) {
        f = true;
        for (let l1 of listaDB)
          if (l == l1) {
            f = false;
            break;
          }
        selected[i++] = !f;
      }
  }

  resetPsw() {
    this.authService.ResetPassword(this.authService.currentEmail)
  }

}