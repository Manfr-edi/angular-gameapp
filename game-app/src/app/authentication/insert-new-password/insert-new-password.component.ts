import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { AuthService } from 'src/app/services/auth.service';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/custom-validators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-insert-new-password',
  templateUrl: './insert-new-password.component.html',
  styleUrls: ['./insert-new-password.component.css']
})
export class InsertNewPasswordComponent {

  oobCode: string;
  newPswForm: FormGroup;

  constructor(public route: ActivatedRoute, public router: Router, public authService: AuthService,
    public util: UtilService, fb: FormBuilder, public snackBar: MatSnackBar) {

    this.oobCode = route.snapshot.queryParams['oobCode'];

    this.newPswForm = fb.group({
      password: ['', [Validators.required, util.getPasswordValidators()]],
      confirm_password: ['', Validators.required]
    },
      {
        validator: CustomValidators.matchValidator('password', 'confirm_password')
      } as AbstractControlOptions);
  }

  onChangePsw() {

    this.authService.changePassword(this.oobCode, this.newPswForm.controls['password'].value).then(
      (err) => {
        if (err != undefined)
          this.snackBar.open("Si è presentato un errore, prova a rifare la procedura", 'Ok', { duration: 2000 });
        else
          this.router.navigate(['/login']);
      }
    )


  }

  checkPasswordField() {
    let msg = this.util.getFieldMsgError(this.newPswForm.get("password")!,'Password', this.util.passwordFieldErrorParameters());
    if (msg)
      this.snackBar.open(msg, 'Ok', { duration: 2000 });
  }

  checkConfirmPasswordField() {
    let msg = this.util.getFieldMsgError(this.newPswForm.get("confirm_password")!, "Confirm Password");

    if (!msg) {
      if (this.newPswForm.hasError("match"))
        msg = "Confirm Password e Password devono corrispondere!";
    }

    if (msg)
      this.snackBar.open(msg, 'Ok', { duration: 2000 });
  }
}