import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CustomValidators } from 'src/app/custom-validators';
import { UtilService } from 'src/app/services/util.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignUpComponent {
  registerForm: FormGroup;

  constructor(private authService: AuthService, private router: Router, public util: UtilService, 
    private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.registerForm = fb.group({
      username: ['', [Validators.required, util.getUsernameValidators()], CustomValidators.existingUsernameValidator(util)],
      email: ['', [Validators.required, Validators.email], CustomValidators.existingEmailValidator(util)],
      password: ['', [Validators.required, util.getPasswordValidators()]]
    });

  }

  checkUserInfo() {
    if (this.authService.isUserEmailLoggedIn)
      this.router.navigate(['/user'])
  }

  checkField(field: string, name: string, map?: Map<string,string>) {
    let msg = this.util.getFieldMsgError(this.registerForm.get(field)!, name, map);
    if (msg)
      this.snackBar.open(msg, 'Ok', { duration: 2000 });
  }
  
  checkUsernameField() {
    if (this.registerForm.get("username")?.hasError('usernameExists'))
      this.snackBar.open("Username già in uso", 'Ok', { duration: 2000 });
  }

  checkEmailField() {
    if (this.registerForm.get("email")?.hasError('emailExists'))
      this.snackBar.open("Email già in uso", 'Ok', { duration: 2000 });
  }
  
  onRegister() {
    this.authService.signUpWithEmail(this.registerForm.controls['username'].value,
      this.registerForm.controls['email'].value, this.registerForm.controls['password'].value).then(
        err => {
          if (!err)
            this.snackBar.open("La registrazione è completa, ti è stata inviata un'email di verifica", 'OK', { duration: 4000 })
          else
            this.snackBar.open("Impossibile completare la registrazione", "OK", { duration: 2000 });
        }
      )
      .finally(() => this.router.navigate(['/']))
  }
}
