import { Component, ViewChild } from '@angular/core';
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
  constructor(public authService: AuthService) {
   
  }

  onNotificationMenuChanges(opened: boolean) {
    if (opened)
      this.trigger?.closeMenu();
  }
}
