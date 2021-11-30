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
import { SignInComponent } from './authentication/sign-in/signin.component';
import { SignUpComponent } from './authentication/sign-up/signup.component'
import { CheckUserVerifiedComponent } from './authentication/check-user-verified/check-user-verified.component';

// Auth service
import { AuthService } from "./shared/services/auth.service";
// GameList service
import { GameListService } from "./shared/services/game-list.service";

//Componenti Utente
import { GameTabComponent } from './dashboard/game-tab/game-tab.component';
import { ShoppingReportComponent } from './dashboard/shopping-report/shopping-report.component';
import { SettingsTabComponent } from './dashboard/settings-tab/settings-tab.component';
import { InsertgamelistComponent } from './insertgamelist/insertgamelist.component';
import { UserComponent } from './user/user.component';
import { FriendTabComponent } from './dashboard/friend-tab/friend-tab.component';
import { ChatComponent } from './dashboard/chat/chat.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


//Import di Material design
import {MatButtonModule} from '@angular/material/button'; 
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { InsertNewPasswordComponent } from './authentication/insert-new-password/insert-new-password.component';



const routes: Routes = [
  { path: '', component: GameCatalogueComponent },
  { path: 'games/:id', component: GameDetailsComponent },
  { path: 'login', component: SignInComponent },
  { path: 'register-user', component: SignUpComponent },
  { path: 'user/:userid', component: UserComponent},
  { path: 'gametab', component: GameTabComponent},
  { path: 'friendtab', component: FriendTabComponent},
  { path: 'chat', component: ChatComponent},
  { path: 'settings', component: SettingsTabComponent},
  { path: 'resetpassword', component: ResetPasswordComponent},
  { path: 'newpassword', component: InsertNewPasswordComponent}
];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule.enablePersistence(),
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule

  ],
  exports: [RouterModule],

  declarations: [
    AppComponent,
    GameCatalogueComponent,
    GameDetailsComponent,
    SignInComponent,
    SignUpComponent,
    CheckUserVerifiedComponent,
    GameTabComponent,
    ShoppingReportComponent,
    SettingsTabComponent,
    InsertgamelistComponent,
    UserComponent,
    FriendTabComponent,
    ChatComponent,
    ResetPasswordComponent,
    InsertNewPasswordComponent
  ],
  providers: [AuthService, GameListService],
  bootstrap: [AppComponent]
})
export class AppModule { }
