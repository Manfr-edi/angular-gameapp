import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

 @Input() 
  module = 'games'

  constructor(public authService: AuthService) {

  }

  ngOnInit() {
  }

  logout() {
    this.authService.signOut();
  }

}
