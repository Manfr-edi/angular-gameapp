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

  prova1: boolean = true;
  genreList = genreList;
  platformList = platformList;

  genreSelected = "";
  platformSelected = "";

  genreNotPref: { name: string, code: string, isPref: boolean }[] = [];
  platformNotPoss: { name: string, code: string, isPoss: boolean }[] = [];

  constructor(public authService: AuthService, public db: AngularFirestore) {
    this.prova();
  }

  ngOnInit(): void {
  }

  addGenre() {
    let genres: string[] = [];
    for (let g of this.genreNotPref)
      if (g.isPref)
        genres.push(g.code);

    this.db.collection('Users').doc(this.authService.currentUserId).update({ Genres: genres });
  }

  addPlatform() {
    let platforms: string[] = [];
    for (let p of this.platformNotPoss)
      if (p.isPoss)
        platforms.push(p.code);

    this.db.collection('Users').doc(this.authService.currentUserId).update({ Platforms: platforms });
  }

  async prova() {

    let f = true;
    var platforms: string[] = (await this.db.collection('Users').doc(this.authService.currentUserId).ref.get()).get("Platforms");

    if (platforms !== undefined) {

      for (let p of platformList) {
        f = true;
        for (let p1 of platforms) {
          if (p.code == p1) {
            this.platformNotPoss.push({ name: p.name, code: p.code, isPoss: true });
            f = false;
            break;
          }
        }
        if (f)
          this.platformNotPoss.push({ name: p.name, code: p.code, isPoss: false });
      }
    }


    else
      for (let p of platformList)
        this.platformNotPoss.push({ name: p.name, code: p.code, isPoss: false });

    let genres: string[] = (await this.db.collection('Users').doc(this.authService.currentUserId).ref.get()).get("Genres");

    if (genres !== undefined) {

      f = true;
      for (let p of genreList) {
        f = true;
        for (let p1 of genres) {
          if (p.code == p1) {
            this.genreNotPref.push({ name: p.name, code: p.code, isPref: true });
            f = false;
            break;
          }
        }
        if (f) {
          this.genreNotPref.push({ name: p.name, code: p.code, isPref: false });
        }
      }
    }
    else
      for (let g of genreList)
        this.genreNotPref.push({ name: g.name, code: g.code, isPref: false });
  }
}