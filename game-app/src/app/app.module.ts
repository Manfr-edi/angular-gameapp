import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes,RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GameCatalogueComponent } from './game-catalogue/game-catalogue.component';
import { GameDetailsComponent } from './game-details/game-details.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule } from '@angular/fire/firestore';



import { environment } from '../environments/environment';
import { UtilComponent } from './util/util.component';


import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignInComponent } from './components/sign-in/signin.component';
import { SignUpComponent } from './components/sign-up/signup.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';

// Auth service
import { AuthService } from "./shared/services/auth.service";

const routes: Routes = [
	{ path: '', component: GameCatalogueComponent },
    { path: 'games/:id', component: GameDetailsComponent },
	{ path: 'login', component: SignInComponent },
	{ path: 'register-user', component: SignUpComponent },
	{ path: 'user', component: DashboardComponent },
	{ path: 'forgot-password', component: ForgotPasswordComponent },
	{ path: 'verify-email-address', component: VerifyEmailComponent }
];

@NgModule({
  imports:[ 
    BrowserModule, 
    FormsModule,
    RouterModule.forRoot(routes), 
    AngularFireModule.initializeApp(environment.firebase),
	AngularFireAuthModule,
    AngularFireDatabaseModule,
	AngularFirestoreModule.enablePersistence()

  ],
   exports: [RouterModule],
  
  declarations:[ 
    AppComponent, 
    GameCatalogueComponent,
    GameDetailsComponent,
    UtilComponent,
    DashboardComponent,
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent
  ],
  providers: [AuthService],
  bootstrap:[ AppComponent ]
})
export class AppModule { }
