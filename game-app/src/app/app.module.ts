import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GameCatalogueComponent } from './game-catalogue/game-catalogue.component';
import { GameDetailsComponent } from './game-details/game-details.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule } from '@angular/fire/firestore';



import { environment } from '../environments/environment';

// Moduli per l'autenticazione
import { DashboardComponent } from './authentication/dashboard/dashboard.component';
import { SignInComponent } from './authentication/sign-in/signin.component';
import { SignUpComponent } from './authentication/sign-up/signup.component'
import { CheckUserVerifiedComponent } from './authentication/check-user-verified/check-user-verified.component';

// Auth service
import { AuthService } from "./shared/services/auth.service";


const routes: Routes = [
  { path: '', component: GameCatalogueComponent },
  { path: 'games/:id', component: GameDetailsComponent },
  { path: 'login', component: SignInComponent },
  { path: 'register-user', component: SignUpComponent },
  { path: 'user', component: DashboardComponent }
];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule.enablePersistence()

  ],
  exports: [RouterModule],

  declarations: [
    AppComponent,
    GameCatalogueComponent,
    GameDetailsComponent,
    DashboardComponent,
    SignInComponent,
    SignUpComponent,
    CheckUserVerifiedComponent
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
