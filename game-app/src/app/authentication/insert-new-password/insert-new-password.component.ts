import { Component } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomValidators } from 'src/app/custom-validators';
import { AuthService } from 'src/app/services/auth.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-insert-new-password',
  templateUrl: './insert-new-password.component.html',
  styleUrls: ['./insert-new-password.component.css']
})
export class InsertNewPasswordComponent {

  oobCode: string;
  newPswForm: FormGroup;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService,
    private util: UtilService, private fb: FormBuilder, private snackBar: MatSnackBar) {

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
    let msg = this.util.getFieldMsgError(this.newPswForm.get("password")!, 'Password', this.util.passwordFieldErrorParameters());
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