import { Component, OnInit } from '@angular/core';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { UserLoggedService } from 'src/app/services/user-logged.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../custom-validators';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(public authService: AuthService, public userLoggedService: UserLoggedService, public fb: FormBuilder, private _snackBar: MatSnackBar) {
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
    this.dataForm.controls['bio'].setValue(this.bio);
    this.dataForm.controls['nicknameps'].setValue(this.nicknameps);    
    this.dataForm.controls['nicknamexb'].setValue(this.nicknamexb);
    this.dataForm.controls['nicknament'].setValue(this.nicknament);
    this.dataForm.controls['nicknamest'].setValue(this.nicknamest);
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

  onSubmit() {
      this.userLoggedService.updateUser({
      ["bio"]: this.dataForm.get("bio")?.value,
      ["nicknameps"]: this.dataForm.get("nicknameps")?.value,
      ["nicknamexb"]: this.dataForm.get("nicknamexb")?.value,
      ["nicknament"]: this.dataForm.get("nicknament")?.value,
      ["nicknamest"]: this.dataForm.get("nicknamest")?.value
    });
    this._snackBar.open("Dati modificati", 'Ok', { duration: 2000 });
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
    this.authService.ResetPassword(this.authService.currentEmail);
    this._snackBar.open("Email di reset inviata", 'Ok', { duration: 2000 });
    
  }

}