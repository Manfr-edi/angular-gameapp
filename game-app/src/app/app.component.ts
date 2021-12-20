import { Component, ViewChild } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{

  @ViewChild("menuTrigger") trigger!: MatMenuTrigger;

  menuOpened: boolean = false;
  constructor(public authService: AuthService, private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('en-GB'); //dd-MM-YYYY
  }

  onNotificationMenuChanges(opened: boolean) {
    if (opened)
      this.trigger?.closeMenu();
  }
}
