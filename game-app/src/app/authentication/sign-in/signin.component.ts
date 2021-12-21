import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SignInComponent {
  loginForm: FormGroup;

  constructor(private authService: AuthService, private router: Router, private util: UtilService,
    private snackBar: MatSnackBar, private fb: FormBuilder) {
    this.loginForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  checkLoggedIn() {
    if (this.authService.isUserEmailLoggedIn)
      this.router.navigate(['/gametab'])
    else
      if (this.authService.isAdmin)
        this.router.navigate(["/"]);
  }

  onLoginEmail(): void {
    this.authService.loginWithEmail(this.loginForm.controls['email']?.value, this.loginForm.controls['password']?.value)
      .then((err) => {
        if (err)
          this.snackBar.open("Impossibile effettuare il login!", 'Ok', { duration: 2000 });
        else
          if (!this.authService.isadmin)
            this.router.navigate(['/gametab']);
          else
            this.router.navigate(["/"])
      });
  }

  checkField(field: string, name: string) {
    let msg = this.util.getFieldMsgError(this.loginForm.get(field)!, name);
    if (msg)
      this.snackBar.open(msg, 'Ok', { duration: 2000 });
  }
}