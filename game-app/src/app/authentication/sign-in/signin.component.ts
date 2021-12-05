import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UtilService } from 'src/app/services/util.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SignInComponent implements OnInit {
  loginForm: FormGroup;

  constructor(public authService: AuthService, private router: Router, public util: UtilService,
    public _snackBar: MatSnackBar, fb: FormBuilder) {
    this.loginForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() { }

  checkLoggedIn() {
    if (this.authService.isUserEmailLoggedIn) {
      this.router.navigate(['/user/' + this.authService.currentUserId])
    }
  }

  onLoginEmail(): void {
    this.authService.loginWithEmail(this.loginForm.controls['email']?.value, this.loginForm.controls['password']?.value)
      .then(() => this.router.navigate(['/gametab']))
      .catch(_error => {
      
        //window.alert(this.error.message)
        this._snackBar.open(_error.message);
        //this.router.navigate(['/'])
      })
  }

  checkRequired(field: string, name: string) {
    if (this.loginForm.get(field)?.hasError('required'))
      this._snackBar.open(name + " è obbligatorio!", 'Ok', { duration: 2000 });
  }

  checkEmail() {
    if (this.loginForm.get("email")?.hasError('email'))
      this._snackBar.open("Fornisci un'email corretta", 'Ok', { duration: 2000 });
  }
}