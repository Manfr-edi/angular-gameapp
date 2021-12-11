import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouteConfigLoadEnd, Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-insert-new-password',
  templateUrl: './insert-new-password.component.html',
  styleUrls: ['./insert-new-password.component.css']
})
export class InsertNewPasswordComponent implements OnInit {

  oobCode: string;
  password: string = '';
  confirm_password: string = '';

  constructor(public route: ActivatedRoute, public router: Router, public authService: AuthService, public util: UtilService) {
    this.oobCode = route.snapshot.queryParams['oobCode'];
   
  }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.oobCode = params['oobCode']
      });
  }

  setPassword() {
    if (this.util.isValidPswFormat(this.password)) {
      if (this.confirm_password === this.password) {
        console.log("sono OOBCODE" + this.oobCode)
        this.authService.changePassword(this.oobCode, this.password);
        window.alert("Password cambiata!");
        this.router.navigate(['/login']);
      }
      else
        window.alert("Le password devono corrispondere!");

    }
    else
      window.alert("Inserisci una password valida!");
  }

}
