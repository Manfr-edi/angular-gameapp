import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-check-user-verified',
  templateUrl: './check-user-verified.component.html',
  styleUrls: ['./check-user-verified.component.css']
})
export class CheckUserVerifiedComponent {

  constructor(public authService: AuthService, public snackBar: MatSnackBar) { }

  resendVerificationEmail()
  {
    this.authService.sendEmailVerification();
    this.snackBar.open("Email di verifica inviata!", 'Ok', {duration: 2000});
  }

}
