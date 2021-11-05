import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-check-user-verified',
  templateUrl: './check-user-verified.component.html',
  styleUrls: ['./check-user-verified.component.css']
})
export class CheckUserVerifiedComponent implements OnInit {

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
  }

  resendVerificationEmail()
  {
    this.authService.sendEmailVerification();
    window.alert("Email di verifica inviata!");
  }

}
