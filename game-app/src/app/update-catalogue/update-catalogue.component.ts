import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';
import { GameCollectionService } from '../services/game-collection.service';
import { UtilService } from '../services/util.service';
import { MatDialog } from '@angular/material/dialog';
import { SelectOptionsComponent } from './select-options/select-options.component';
import { platformList } from '../data/platform/platform';
import { genreList } from '../data/genre/genre';
import { HttpClient } from '@angular/common/http';
import { AngularFireStorage } from '@angular/fire/storage';

import * as firebase from 'firebase'
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-update-catalogue',
  templateUrl: './update-catalogue.component.html',
  styleUrls: ['./update-catalogue.component.css']
})
export class UpdateCatalogueComponent {

  allPlatforms = platformList;
  allGenre = genreList;
  //Dati
  gameid?: string;

  //Forms
  mainDataForm: FormGroup;
  platGenForm: FormGroup;
  bioForm: FormGroup;

  imgUrl: string = "";
  uploadStateProgress: number = 0;
  img?: File;
  imgSetted: boolean = false;
  imgUploading: boolean = false;
  dirtyImg: boolean = false;

  constructor(public authService: AuthService, public adminService: AdminService, public util: UtilService,
    public gameCollectionService: GameCollectionService, private route: ActivatedRoute, private router: Router,
    private fb: FormBuilder, public dialog: MatDialog, private snackBar: MatSnackBar) {

    if (!authService.isAdmin)
      router.navigateByUrl("/");

    //Lettura id del gioco
    const routeParams = this.route.snapshot.paramMap;
    if (routeParams.get('gameid'))
      this.gameid = String(routeParams.get('gameid'));

    this.mainDataForm = fb.group({
      title: ['', Validators.required],
      developer: ['', Validators.required],
      price: [0, [Validators.required, util.getPriceValidators()]],
      release: [new Date(), Validators.required],
      publisher: ['', Validators.required]
    });

    this.platGenForm = fb.group({
      platform: [[''], Validators.required],
      genre: ['', Validators.required]
    });

    this.bioForm = fb.group({
      bio: ['', [Validators.required, Validators.maxLength(10000)]]
    })

    //SE STO MODIFICANDO IL GIOCO DEVO PRECARICARE LE FORM
    if (this.gameid)
      gameCollectionService.getGame(this.gameid).ref.get().then(game => {
        //MAIN DATA
        this.mainDataForm.controls["title"].setValue(game.get("title"));
        this.mainDataForm.controls["developer"].setValue(game.get("developer"));
        this.mainDataForm.controls["price"].setValue(game.get("price"));
        this.mainDataForm.controls["release"].setValue(game.get("release").toDate());
        this.mainDataForm.controls["publisher"].setValue(game.get("publisher"));
        //PLAT GEN
        this.platGenForm.controls["platform"].setValue(game.get("platform"));
        this.platGenForm.controls["genre"].setValue(game.get("genre"));
        //BIO
        this.bioForm.controls['bio'].setValue(game.get('bio'));
        //IMAGE
        util.getGameImageUrl(this.gameid!).then(url => { this.imgUrl = url; this.imgSetted = true; });
      });
  }

  loadImage(event: any) {
    this.img = <File>event.target.files[0];

    //Carico l'immagine in modo da poterla mostrare
    var reader = new FileReader();
    reader.readAsDataURL(this.img)
    reader.onload = () => { this.imgUrl = reader.result as string; this.imgSetted = true }
  }

  cancelImage() {
    this.img = undefined;
    this.imgUrl = "";
    this.imgSetted = false;
    this.dirtyImg = true;
  }

  progressUploadImg(perc: number) {
   this.uploadStateProgress = perc;
  }

  updateGame() {
    this.imgUploading = true;
    //PER ORA CONSIDERO DI AVERE IL GAMEID
    this.adminService.updateGame(this.mainDataForm.controls["title"].value,
      this.mainDataForm.controls["developer"].value,
      this.mainDataForm.controls["price"].value,
      this.mainDataForm.controls["release"].value,
      this.mainDataForm.controls["publisher"].value,
      this.platGenForm.controls["platform"].value,
      this.platGenForm.controls["genre"].value,
      this.bioForm.controls['bio'].value, this.dirtyImg ? this.img! : undefined, this.progressUploadImg.bind(this), this.gameid)
      .then(r => {
        this.snackBar.open(r ? "Videogioco " + (this.gameid ? "modificato" : "aggiunto") + " con successo!" :
          "Non è stato possibile caricare l'immagine di copertina, riprova!", 'Ok', { duration: 2000 });
        this.router.navigateByUrl("/");
      })
      .catch(err => this.snackBar.open("Errore imprevisto"))
      .finally(() => this.imgUploading = false)
  }


}
