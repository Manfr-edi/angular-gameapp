import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { UtilService } from 'src/app/shared/services/util.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SignInComponent implements OnInit {

  isNewUser = true;
  email = '';
  password = '';
  errorMessage = '';
  error: { name: string, message: string } = { name: '', message: '' };

  resetPassword = false;

  constructor(public authService: AuthService, private router: Router, public util: UtilService) { }

  ngOnInit() { }

  checkUserInfo() {
    if (this.authService.isUserEmailLoggedIn) {
      this.router.navigate(['/user/'+this.authService.currentUserId])
    }
  }

  clearErrorMessage() {
    this.errorMessage = '';
    this.error = { name: '', message: '' };
  }

  changeForm() {
    this.isNewUser = !this.isNewUser
  }

  onLoginEmail(): void {
    this.clearErrorMessage()

    if (this.validateForm(this.email, this.password)) {
      this.authService.loginWithEmail(this.email, this.password)
        .then(() => this.router.navigate(['/gametab']))
        .catch(_error => {
          this.error = _error
          window.alert(this.error.message)
          //this.router.navigate(['/'])
        })
    }
  }

  validateForm(email: string, password: string): boolean {
    if (email.length === 0) {
      this.errorMessage = 'Please enter Email!'
      return false
    }

    if (password.length === 0) {
      this.errorMessage = 'Please enter Password!'
      return false;
    }

    if (!this.util.isValidMailFormat(this.email)) {
      this.errorMessage = 'Please enter valid Mail format!'
      return false
    }

    this.errorMessage = ''
    return true;
  }

  sendResetEmail() {
    this.clearErrorMessage()

    this.authService.ResetPassword(this.email)
      .then(() => this.resetPassword = true)
      .catch(_error => {
        this.error = _error
      })
  }
}