import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { UtilService } from 'src/app/services/util.service';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { from, Observable, timer } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators'
import { AngularFireStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomValidators } from 'src/app/custom-validators';
import { UserCollectionService } from 'src/app/services/user-collection.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignUpComponent {
  registerForm: FormGroup;

  constructor(public authService: AuthService, private router: Router, public util: UtilService, 
    fb: FormBuilder, public snackBar: MatSnackBar) {
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
