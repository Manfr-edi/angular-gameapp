import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GameCatalogueComponent } from './game-catalogue/game-catalogue.component';
import { GameDetailsComponent } from './game-details/game-details.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { environment } from '../environments/environment';

// Moduli per l'autenticazione
import { SignInComponent } from './authentication/sign-in/signin.component';
import { SignUpComponent } from './authentication/sign-up/signup.component'
import { CheckUserVerifiedComponent } from './authentication/check-user-verified/check-user-verified.component';

// Auth service
import { AuthService } from "./services/auth.service";
// UserCollection servicen
import { UserCollectionService } from "./services/user-collection.service";
// GameCollection service
import { GameCollectionService } from "./services/game-collection.service";
// UserLogged service
import { UserLoggedService } from "./services/user-logged.service";
// Util service
import { UtilService } from "./services/util.service";

//Componenti Utente
import { GameTabComponent } from './dashboard/game-tab/game-tab.component';
import { ShoppingReportComponent } from './dashboard/shopping-report/shopping-report.component';
import { SettingsTabComponent } from './dashboard/settings-tab/settings-tab.component';
import { InsertgamelistComponent } from './insertgamelist/insertgamelist.component';
import { UserComponent } from './user/user.component';
import { FriendTabComponent } from './dashboard/friend-tab/friend-tab.component';
import { ChatComponent } from './dashboard/chat/chat.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { InsertNewPasswordComponent } from './authentication/insert-new-password/insert-new-password.component';

//Import di Material design
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { NotificationComponent } from './notification/notification.component';
import { ShowChatsComponent } from './dashboard/show-chats/show-chats.component';
import { AddToListComponent } from './game-details/add-to-list/add-to-list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DeleteDialogComponent } from './game-catalogue/admin-control/delete-dialog/delete-dialog.component';
import { UpdateCatalogueComponent } from './update-catalogue/update-catalogue.component';
import { AdminControlComponent } from './game-catalogue/admin-control/admin-control.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { ShowStarVoteComponent } from './show-star-vote/show-star-vote.component';
import { AdminService } from './services/admin.service';
import { RedirectPageComponent } from './authentication/redirect-page/redirect-page.component';


const routes: Routes = [
  { path: '', component: GameCatalogueComponent },
  { path: 'games/:id', component: GameDetailsComponent },
  { path: 'login', component: SignInComponent },
  { path: 'register-user', component: SignUpComponent },
  { path: 'user/:userid', component: UserComponent },
  { path: 'gametab', component: GameTabComponent },
  { path: 'friendtab', component: FriendTabComponent },
  { path: 'chats', component: ShowChatsComponent },
  { path: 'chats/:id', component: ShowChatsComponent },
  { path: 'settings', component: SettingsTabComponent },
  { path: 'resetpassword', component: ResetPasswordComponent },
  { path: 'newpassword', component: InsertNewPasswordComponent },
  { path: 'redirect', component: RedirectPageComponent },
  { path: 'modify/:gameid', component: UpdateCatalogueComponent },
  { path: 'add', component: UpdateCatalogueComponent }
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
    AngularFireStorageModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    MatButtonToggleModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatGridListModule,
    MatBadgeModule,
    MatListModule,
    MatDialogModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatTabsModule,
    MatAutocompleteModule
  ],
  exports: [RouterModule, FormsModule,
    ReactiveFormsModule],

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
    InsertNewPasswordComponent,
    NotificationComponent,
    ShowChatsComponent,
    AddToListComponent,
    DeleteDialogComponent,
    UpdateCatalogueComponent,
    AdminControlComponent,
    ShowStarVoteComponent,
    RedirectPageComponent
  ],
  providers: [AuthService, UserCollectionService, GameCollectionService, UserLoggedService, UtilService, AdminService],
  bootstrap: [AppComponent]
})
export class AppModule { }
