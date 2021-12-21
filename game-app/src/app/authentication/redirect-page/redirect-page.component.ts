import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-redirect-page',
  templateUrl: './redirect-page.component.html',
  styleUrls: ['./redirect-page.component.css']
})
export class RedirectPageComponent {

  constructor(private route: ActivatedRoute, private router: Router,
    private authService: AuthService, private snackBar: MatSnackBar) {

    this.route.queryParams
      .subscribe(params => {
        let mode = params['mode'];
        let oobCode = params['oobCode'];

        if (oobCode !== null) {
          if (mode === 'resetPassword')
            router.navigateByUrl('newpassword?oobCode=' + oobCode);
          else {
            if (mode === 'verifyEmail') {
              authService.verifyEmail(oobCode).then(r =>
                snackBar.open("Email Verificata", 'OK', { duration: 2000 })
              )
            }
            else {
              router.navigateByUrl("/");
            }
          }
        }
        else {
          router.navigateByUrl("/");
        }
      });
  }
}
