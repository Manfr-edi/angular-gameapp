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


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignUpComponent implements OnInit {
  isUnique = false;
  isNewUser = true;
  userfound = '';
  username = '';
  email = '';
  password = '';
  errorMessage = '';
  error: { name: string, message: string } = { name: '', message: '' };

  resetPassword = false;

  registerForm: FormGroup;

  constructor(public authService: AuthService, public fdb: AngularFirestore,
    private router: Router, public util: UtilService, fb: FormBuilder, public snackBar: MatSnackBar) {
    this.registerForm = fb.group({
      username: ['', [/*Validators.required, Validators.minLength(6)*/], existingUsernameValidator(fdb)],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() { }

  checkUserInfo() {
    if (this.authService.isUserEmailLoggedIn) {
      this.router.navigate(['/user'])
    }
  }

  checkRequired(field: string, name: string) {
    if (this.registerForm.get(field)?.hasError('required'))
      this.snackBar.open(name + " è obbligatorio!", 'Ok', { duration: 2000 });
  }

  checkEmail() {
    if (this.registerForm.get("email")?.hasError('email'))
      this.snackBar.open("Fornisci un'email corretta", 'Ok', { duration: 2000 });
  }

  checkUsername() {
    if (this.registerForm.get("username")?.hasError('usernameExists'))
      this.snackBar.open("Username già in uso", 'Ok', { duration: 2000 });
  }

  onRegister() {
    this.authService.signUpWithEmail(this.registerForm.controls['username'].value,
      this.registerForm.controls['email'].value, this.registerForm.controls['password'].value).then(
        r =>  this.snackBar.open("Email di verifica inviata", 'OK', {duration: 4000})
      )
      .catch(_error => {
        this.snackBar.open(_error, "OK", { duration: 2000 });
      }).finally(() => this.router.navigate(['/']))
  }
}

export function existingUsernameValidator(fdb: AngularFirestore): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    return from(fdb.collection('Users').ref.where("username", "==", control.value).get()).pipe(
      debounceTime(500), map(
        res => {
          return (res && !res.empty) ? { 'usernameExists': true } : null;
        }
      )
    );
  };
}