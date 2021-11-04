import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { AngularFireDatabase, AngularFireAction, AngularFireObject,AngularFireList  } from '@angular/fire/database';
import { switchMap } from 'rxjs/operators';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';


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

  constructor(public authService: AuthService, public db: AngularFireDatabase, public fdb: AngularFirestore, private router: Router) {
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

    if (await this.validateForm(this.username,this.email, this.password)) {
      this.authService.signUpWithEmail(this.username, this.email, this.password)
        .then(() => {			 
			
          this.router.navigate(['/'])
        }).catch(_error => {
          this.error = _error
          this.router.navigate(['/'])
        })
		
		
		
		
    }
  }

  createUser(username: string, email: string){
      const currentuserId = this.authService.currentUserId;
      console.log("l'id è " + this.authService.currentUserId);
			this.fdb.collection("Users").doc("currentuserId").set({ 
                                  username: this.username,
																  email: this.email });

  }


   async validateForm(username: string,email: string, password: string): Promise<boolean> {
    if (username.length === 0) {
      this.errorMessage = 'Please enter Username!'
      return false
    }
	if (username.length < 6) {
      this.errorMessage = 'Username should be at least 6 characters!'
      return false
    }
	if(!(await this.isUniqueUsername(username)))
	{
	  this.errorMessage = 'This Username already exists!'
      return false
	}
    if (email.length === 0) {
      this.errorMessage = 'Please enter Email!'
      return false
    }

    if (password.length === 0) {
      this.errorMessage = 'Please enter Password!'
      return false
    }

    if (password.length < 6) {
      this.errorMessage = 'Password should be at least 6 characters!'
      return false
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
	var data = await this.fdb.collection('Users').ref.where("username","==", username).get();
	return data.empty;
  }
}