import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomValidators } from '../custom-validators';
import { genreList } from '../data/genre/genre';
import { platformList } from '../data/platform/platform';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';
import { GameCollectionService } from '../services/game-collection.service';
import { UtilService } from '../services/util.service';

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

  constructor(private authService: AuthService, private adminService: AdminService, public util: UtilService,
    private gameCollectionService: GameCollectionService, private route: ActivatedRoute, private router: Router,
    private fb: FormBuilder, private dialog: MatDialog, private snackBar: MatSnackBar) {

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
      platform: ['', CustomValidators.selectionListRequired()],
      genre: ['', CustomValidators.selectionListRequired()]
    });

    this.bioForm = fb.group({
      bio: ['', [Validators.required, Validators.maxLength(10000)]]
    })


    //SE STO MODIFICANDO IL GIOCO DEVO PRECARICARE LE FORM
    if (this.gameid) {
      gameCollectionService.getGame(this.gameid).ref.get().then(game => {
        this.mainDataForm.get('title')?.addAsyncValidators(CustomValidators.existingTitleGameValidator(gameCollectionService,
          game.get("title")));

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
    else //Se sto aggiungendo un gioco 
      this.mainDataForm.get('title')?.addAsyncValidators(CustomValidators.existingTitleGameValidator(gameCollectionService));
  }

  loadImage(event: any) {
    this.img = <File>event.target.files[0];

    //Carico l'immagine in modo da poterla mostrare
    var reader = new FileReader();
    reader.readAsDataURL(this.img)
    reader.onload = () => { this.imgUrl = reader.result as string; this.dirtyImg = true; this.imgSetted = true }
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

  checkField(form: FormGroup, field: string, name: string, map?: Map<string, string>) {
    let msg = this.util.getFieldMsgError(form.get(field) as FormControl, name, map);

    if (msg)
      this.snackBar.open(msg, 'Ok', { duration: 2000 });
  }

  checkTitle() {
    this.checkField(this.mainDataForm, 'title', 'Titolo');

    let msg = this.util.getFieldMsgError(this.mainDataForm.get('title') as FormControl, "Titolo");

    if (!msg)
      if (this.mainDataForm.get('title')?.hasError("titleGameExists"))
        msg = "Titolo già presente nel catalogo!";

    if (msg)
      this.snackBar.open(msg, 'Ok', { duration: 2000 });

  }
}
