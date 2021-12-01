import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { AngularFirestore  } from '@angular/fire/firestore';
import { UtilService } from 'src/app/services/util.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignUpComponent implements OnInit {
  itemRef: AngularFireObject<any>;
  isUnique = false;
  isNewUser = true;
  userfound = '';
  username = '';
  email = '';
  password = '';
  errorMessage = '';
  error: { name: string, message: string } = { name: '', message: '' };

  resetPassword = false;

  constructor(public authService: AuthService, public db: AngularFireDatabase, public fdb: AngularFirestore, private router: Router,
    public util: UtilService) {
    this.itemRef = this.itemRef = db.object('/Users');
  }

  ngOnInit() { }

  checkUserInfo() {
    if (this.authService.isUserEmailLoggedIn) {
      this.router.navigate(['/user'])
    }
  }

  clearErrorMessage() {
    this.errorMessage = '';
    this.error = { name: '', message: '' };
  }

  changeForm() {
    this.isNewUser = !this.isNewUser
  }

  async onSignUp(): Promise<void> {
    this.clearErrorMessage()

    if (await this.validateForm(this.username, this.email, this.password)) {
      this.authService.signUpWithEmail(this.username, this.email, this.password)
      .catch(_error => {
          this.error = _error
        }).finally(() => this.router.navigate(['/']))
    }
  }

  async validateForm(username: string, email: string, password: string): Promise<boolean> {
    if (username.length === 0) {
      this.errorMessage = 'Inserisci Username!'
      return false
    }

    if (username.length < 6) {
      this.errorMessage = "L'Username deve essere lungo almeno 6 caratteri!";
      return false
    }

    if (!(await this.isUniqueUsername(username))) {
      this.errorMessage = "Username già esistente!";
      return false
    }

    if (email.length === 0) {
      this.errorMessage = "Inserisci l'email!"
      return false
    }

   
    if( !this.util.isValidPswFormat(password) )
    {
      this.errorMessage = "Inserisci una password valida";
      return false;
    }

    this.errorMessage = ''
    return true
  }

  isValidMailFormat(email: string) {
    const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

    if ((email.length === 0) && (!EMAIL_REGEXP.test(email))) {
      return false;
    }

    return true;
  }

  async isUniqueUsername(username: string): Promise<boolean> {
    return (await this.fdb.collection('Users').ref.where("username", "==", username).get()).empty;
   }
}