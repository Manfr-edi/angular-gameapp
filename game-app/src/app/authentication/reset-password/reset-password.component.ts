import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  email: string = '';
  psw: string = '';
  confirm_psq: string = '';

  constructor(public authService: AuthService, public util: UtilService) { }

  ngOnInit(): void {
  }

  sendPasswordResetRequest() {
    if (this.email === '')
      window.alert("Inserisci l'email");
    else
      if (!this.util.isValidMailFormat(this.email))
        window.alert("Inerisci un'email con un formato valido");
      else {
        this.authService.ResetPassword(this.email).then(() =>
          window.alert("Email di reset inviata"));
      }
  }
}
