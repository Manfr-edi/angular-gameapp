//Core
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//Firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
//Base
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
//Servizi
import { AuthService } from "./services/auth.service";
import { AdminService } from './services/admin.service';
import { GameCollectionService } from "./services/game-collection.service";
import { UserCollectionService } from "./services/user-collection.service";
import { UserLoggedService } from "./services/user-logged.service";
import { UtilService } from "./services/util.service";
//Componenti Autenticazione
import { SignInComponent } from './authentication/sign-in/signin.component';
import { SignUpComponent } from './authentication/sign-up/signup.component';
import { CheckUserVerifiedComponent } from './authentication/check-user-verified/check-user-verified.component';
import { InsertNewPasswordComponent } from './authentication/insert-new-password/insert-new-password.component';
import { RedirectPageComponent } from './authentication/redirect-page/redirect-page.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
//Componenti Dashboard utente
import { ChatComponent } from './dashboard/chat/chat.component';
import { FriendTabComponent } from './dashboard/friend-tab/friend-tab.component';
import { RemoveFriendDialogComponent } from './dashboard/friend-tab/remove-friend-dialog/remove-friend-dialog.component';
import { GameTabComponent } from './dashboard/game-tab/game-tab.component';
import { SettingsTabComponent } from './dashboard/settings-tab/settings-tab.component';
import { ShoppingReportComponent } from './dashboard/shopping-report/shopping-report.component';
import { ShowChatsComponent } from './dashboard/show-chats/show-chats.component';
//Componenti Catalogo
import { GameCatalogueComponent } from './game-catalogue/game-catalogue.component';
import { GameDetailsComponent } from './game-details/game-details.component';
import { AddToListComponent } from './game-details/add-to-list/add-to-list.component';

import { ShowStarVoteComponent } from './game-catalogue/show-star-vote/show-star-vote.component';
//Componenti Utente
import { UserComponent } from './user/user.component';
import { InsertgamelistComponent } from './insertgamelist/insertgamelist.component';
//Componenti funzionali
import { NotificationComponent } from './notification/notification.component';
//Componenti Admin
import { AdminControlComponent } from './game-catalogue/admin-control/admin-control.component';
import { UpdateCatalogueComponent } from './update-catalogue/update-catalogue.component';
import { DeleteDialogComponent } from './game-catalogue/admin-control/delete-dialog/delete-dialog.component';
//Angular Material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';

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
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot(routes),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireStorageModule,
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
    RedirectPageComponent,
    RemoveFriendDialogComponent
  ],
  providers: [AuthService, UserCollectionService, GameCollectionService, UserLoggedService, UtilService, AdminService],
  bootstrap: [AppComponent]
})
export class AppModule { }
