import { Component, OnInit } from '@angular/core';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';
import { AuthService } from 'src/app/services/auth.service';
import { UserLoggedService } from 'src/app/services/user-logged.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-settings-tab',
  templateUrl: './settings-tab.component.html',
  styleUrls: ['./settings-tab.component.css']
})
export class SettingsTabComponent implements OnInit {

  //Data
  genreList = genreList;
  platformList = platformList;

  dataForm: FormGroup;

  //Selezione dei dati
  genres: boolean[] = [];
  platforms: boolean[] = [];

  modifyPlatform = false;
  modifyGenre = false

  userImg?: File;
  userImgUrl?: string;

  canLoad: boolean = false;
  userImageState: boolean = false; //True se l'immagine è caricata sul cloud

  constructor(public authService: AuthService, public userLoggedService: UserLoggedService, public fb: FormBuilder,
    private util: UtilService, private snackBar: MatSnackBar) {

    this.dataForm = fb.group({
      bio: [''],
      nicknameps: [''],
      nicknamexb: [''],
      nicknament: [''],
      nicknamest: ['']
    });
  }

  async ngOnInit() {
    this.userLoggedService.getUserDoc().ref.get().then(data => {
      this.dataForm.controls['bio'].setValue(data.get("bio"));
      this.dataForm.controls['nicknameps'].setValue(data.get("nicknameps"));
      this.dataForm.controls['nicknamexb'].setValue(data.get("nicknamexb"));
      this.dataForm.controls['nicknament'].setValue(data.get("nicknament"));
      this.dataForm.controls['nicknamest'].setValue(data.get("nicknamest"));

      this.initList(data.get("platform"), this.platformList, this.platforms);
      this.initList(data.get("genre"), this.genreList, this.genres);

      //Carico l'immagine solo se esiste
      this.util.getUserImageUrl(data.id).then(url => { this.userImgUrl = url; this.userImageState = (url != undefined) });
    })
  }

  updateData(colDB: string, list: string[], selected: boolean[]) {
    let dataSelected: string[] = [];

    for (let i = 0; i < list.length; i++)
      if (selected[i])
        dataSelected.push(list[i]);

    this.userLoggedService.updateUser({ [colDB]: dataSelected }).then(e => {
      if (colDB === "genre")
        this.modifyGenre = false;
      if (colDB === "platform")
        this.modifyPlatform = false;
    })

  }

  onSubmit() {
    let data = new Map<String, any>([]);

    if (this.dataForm.get("bio")?.value)
      data.set("bio", this.dataForm.get("bio")?.value);

    if (this.dataForm.get("nicknameps")?.value)
      data.set("nicknameps", this.dataForm.get("nicknameps")?.value);
    if (this.dataForm.get("nicknamexb")?.value)
      data.set("nicknamexb", this.dataForm.get("nicknamexb")?.value);
    if (this.dataForm.get("nicknament")?.value)
      data.set("nicknament", this.dataForm.get("nicknament")?.value);
    if (this.dataForm.get("nicknamest")?.value)
      data.set("nicknamest", this.dataForm.get("nicknamest")?.value);

    this.userLoggedService.updateUser(Object.fromEntries(data))
      .then(r => this.snackBar.open(r ? "Dati modificati correttamente!" :
        "Impossibile modificare dati", 'Ok', { duration: 2000 }));
  }

  async initList(listaDB: string[], list: string[], selected: boolean[]) {
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
    this.authService.resetPassword(this.authService.currentEmail)
      .then(e => this.snackBar.open(!e ? "Email di reset inviata!" : "Impossibile inviare email di reset!", 'Ok', { duration: 2000 }));
  }

  chooseImage() {
    document.querySelector('input')?.click()
  }

  loadUserImage(event: any) {
    this.userImg = <File>event.target.files[0];

    //Carico l'immagine in modo da poterla mostrare
    var reader = new FileReader();
    reader.readAsDataURL(this.userImg)
    reader.onload = () => { this.userImgUrl = reader.result as string; this.canLoad = true; }
  }

  cancelUserImage() {
    this.userImg = undefined;
    this.userImgUrl = undefined;

    this.canLoad = !this.canLoad;
  }

  confirmUserImage() {
    if (this.canLoad)
      if (this.userImg)
        this.userLoggedService.uploadUserImg(this.userImg).then(f => {
          this.canLoad = !f;
          this.snackBar.open(f ? "Immagine caricata correttamente!" :
            "Impossibile caricare immagine!", 'Ok', { duration: 2000 });
        });
      else
        this.userLoggedService.cancelUserImg().then(f => {
          this.canLoad = !f;
          this.snackBar.open(f ? "Immagine cancellata correttamente!" :
            "Impossibile cancellare immagine!", 'Ok', { duration: 2000 });
        });
  }
}