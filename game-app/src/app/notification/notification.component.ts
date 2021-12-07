import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserLoggedService } from '../services/user-logged.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  countNotification = 0;
  countUnseenNotification = 0;
  notifications$: Observable<any>;

  constructor(public authService: AuthService, public userLoggedService: UserLoggedService) { 
    this.notifications$= userLoggedService.getNotification().snapshotChanges();
  }

  ngOnInit(): void {
    this.userLoggedService.getNotification().valueChanges().subscribe(p => this.countNotification = p.length);
    this.userLoggedService.getUnseenNotification().valueChanges().subscribe(p => this.countUnseenNotification = p.length);
  }

}
