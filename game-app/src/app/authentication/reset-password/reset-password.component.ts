import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {

  email: FormControl;

  constructor(private authService: AuthService, private util: UtilService, private snackBar: MatSnackBar) {
    this.email = new FormControl("", [Validators.required, Validators.email]);
  }

  sendPasswordResetRequest() {
    this.authService.resetPassword(this.email.value).then(() =>
      this.snackBar.open("Email di reset inviata", 'Ok', { duration: 2000 }));
  }

  checkEmail()
  {
    let msg = this.util.getFieldMsgError(this.email,"Email");
    if( msg )
      this.snackBar.open(msg, 'Ok', {duration: 2000});
  }

}
