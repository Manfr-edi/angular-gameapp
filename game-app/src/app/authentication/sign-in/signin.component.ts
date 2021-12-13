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
export class SignInComponent {
  loginForm: FormGroup;

  constructor(public authService: AuthService, private router: Router, public util: UtilService,
    public snackBar: MatSnackBar, fb: FormBuilder) {
    this.loginForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  checkLoggedIn() {
    if (this.authService.isUserEmailLoggedIn) {
      this.router.navigate(['/gametab'])
    }
  }

  onLoginEmail(): void {
    this.authService.loginWithEmail(this.loginForm.controls['email']?.value, this.loginForm.controls['password']?.value)
      .then((err) => {
        if (err)
          this.snackBar.open("Impossibile effettuare il login!", 'Ok', { duration: 2000 });
        else
          this.router.navigate(['/gametab']);
      });
  }

  checkField(field: string, name: string) {
    let msg = this.util.getFieldMsgError(this.loginForm.get(field)!, name);
    if (msg)
      this.snackBar.open(msg, 'Ok', { duration: 2000 });
  }
}