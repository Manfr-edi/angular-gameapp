import { Component, OnInit } from '@angular/core';
import { genreList } from 'src/app/data/genre/genre';
import { platformList } from 'src/app/data/platform/platform';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-preferiti',
  templateUrl: './preferiti.component.html',
  styleUrls: ['./preferiti.component.css']
})
export class PreferitiComponent implements OnInit {

  //Data
  genreList = genreList;
  platformList = platformList;

  //Filtri
  selectedGenre = "";
  selectedPlatform = "";

  //Selezione dei dati
  genres: boolean[] = [];
  platforms: boolean[] = [];

  constructor(public authService: AuthService, public db: AngularFirestore) {
  }

  async ngOnInit() {
    //Documento relativo all'utente corrente
    let userDoc = (await this.db.doc('Users/'+this.authService.currentUserId).ref.get());

    this.initList(userDoc.get("Platforms"), this.platformList, this.platforms);
    this.initList(userDoc.get("Genres"), this.genreList, this.genres);
  }

  updateData(colDB: string, list: string[], selected: boolean[]) {
    let dataSelected: string[] = [];
    for (let i = 0; i < list.length; i++)
      if (selected[i])
        dataSelected.push(list[i]);
    this.db.collection('Users').doc(this.authService.currentUserId).update({ [colDB]: dataSelected });
  }

  initList(listaDB: string[], list: string[], selected: boolean[]) {
    let i = 0;
    let f;

    if (listaDB !== undefined) {
      for (let l of list) {
        f = true;
        for (let l1 of listaDB) {
          if (l == l1) {
            f = false;
            break;
          }
        }
        selected[i++] = !f;
      }
    }

  }

  logout(){
    this.authService.signOut();
  }


}