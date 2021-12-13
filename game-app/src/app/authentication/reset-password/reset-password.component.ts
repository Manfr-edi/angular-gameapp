import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {

  email: FormControl;

  constructor(public authService: AuthService, public util: UtilService, public snackBar: MatSnackBar) {
    this.email = new FormControl("", [Validators.required, Validators.email]);
  }

  sendPasswordResetRequest() {
    this.authService.ResetPassword(this.email.value).then(() =>
      this.snackBar.open("Email di reset inviata", 'Ok', { duration: 2000 }));
  }

  checkEmail()
  {
    let msg = this.util.getFieldMsgError(this.email,"Email");
    if( msg )
      this.snackBar.open(msg, 'Ok', {duration: 2000});
  }

}
