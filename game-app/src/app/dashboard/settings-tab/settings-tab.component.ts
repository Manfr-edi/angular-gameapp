import { Component, OnInit } from '@angular/core';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { UserLoggedService } from 'src/app/services/user-logged.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../custom-validators';

@Component({
  selector: 'app-settings-tab',
  templateUrl: './settings-tab.component.html',
  styleUrls: ['./settings-tab.component.css']
})
export class SettingsTabComponent implements OnInit {

  //Data
  genreList = genreList;
  platformList = platformList;
  bio= "";
  nicknameps = "";
  nicknamexb = "";
  nicknament = "";
  nicknamest = "";
  showmodifyDesc = false;

  dataForm: FormGroup;

  //Filtri
  selectedGenre = "";
  selectedPlatform = "";

  //Selezione dei dati
  genres: boolean[] = [];
  platforms: boolean[] = [];

  modifyPlatform = false;
  modifyGenre = false

  constructor(public authService: AuthService, public userLoggedService: UserLoggedService, public fb: FormBuilder) {
    this.dataForm = fb.group({
      bio:[''],
      nicknameps:[''],
      nicknamexb:[''],
      nicknament:[''],
      nicknamest:['']
    });
  }

  async ngOnInit() {
    this.bio = await this.userLoggedService.getUserDataParam("bio");
    this.nicknameps = await this.userLoggedService.getUserDataParam("nicknameps");
    this.nicknamexb = await this.userLoggedService.getUserDataParam("nicknamexb");
    this.nicknament = await this.userLoggedService.getUserDataParam("nicknament");
    this.nicknamest = await this.userLoggedService.getUserDataParam("nicknamest");
    this.initList("platform", this.platformList, this.platforms);
    this.initList("genre", this.genreList, this.genres);
  }

  updateData(colDB: string, list: string[], selected: boolean[]) {
    let dataSelected: string[] = [];

    for (let i = 0; i < list.length; i++)
      if (selected[i])
        dataSelected.push(list[i]);

    this.userLoggedService.updateUser({ [colDB]: dataSelected });
    if(colDB==="genre"){
      this.modifyGenre=false;
    }
    if(colDB==="platform"){
      this.modifyPlatform=false;
    }
  }

  updateModifyData(colDB: string, list: string) {
    let dataSelected: string[] = [];

    

    this.userLoggedService.updateUser({ [colDB]: list });
    this.showmodifyDesc=false;
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