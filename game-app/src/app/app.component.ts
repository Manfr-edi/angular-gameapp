import { Component, ViewChild } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild("menuTrigger") trigger!: MatMenuTrigger;

  menuOpened: boolean = false;
  constructor(public authService: AuthService, private dateAdapter: DateAdapter<Date>, public router: Router) {
    this.dateAdapter.setLocale('en-GB'); //dd-MM-YYYY
  }

  onNotificationMenuChanges(opened: boolean) {
    if (opened)
      this.trigger?.closeMenu();
  }

  logout() {
    this.authService.signOut();
    //Il reload è utile ad invalidare la vecchia sessione
    this.router.navigateByUrl("/").then(() => window.location.reload())
  }
}
