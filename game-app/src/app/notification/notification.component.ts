import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserLoggedService } from '../services/user-logged.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnChanges {

  @Input() menuOpened?: boolean = false;
  @Output() notificationMenuOpened: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild("menuTrigger") trigger!: MatMenuTrigger;

  countNotification = 0;
  countUnseenNotification = 0;
  notifications$: Observable<any>;

  show: boolean = false;

  constructor(public authService: AuthService, public userLoggedService: UserLoggedService, public util: UtilService) {
    this.notifications$ = userLoggedService.getNotificationsOrdered().snapshotChanges();

    //Conteggio le notifiche
    this.userLoggedService.getNotifications().valueChanges().subscribe(p => this.countNotification = p.length);
    this.userLoggedService.getUnseenNotifications().valueChanges().subscribe(p => this.countUnseenNotification = p.length);
  }

  async ngOnChanges(changes: any) {

    if (this.menuOpened) //Se il menu è aperto
    {
      //chiudo il notification menu
      this.trigger?.closeMenu();
    }
  }

  menuToggle() {
    this.notificationMenuOpened.emit(this.trigger.menuOpen);
  }
}
