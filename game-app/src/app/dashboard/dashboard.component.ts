import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  module = 'games'
  //Toggle per mostrare/nascondere il componente VisualizzaSpese
  visualizzaSpese = false;

  constructor(public authService: AuthService) {
  }

  ngOnInit() {
  }

  logout() {
    this.authService.signOut();
  }

}
