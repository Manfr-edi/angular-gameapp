import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UserLoggedService } from './services/user-logged.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {



  constructor(public authService: AuthService) {

  }
  

}
