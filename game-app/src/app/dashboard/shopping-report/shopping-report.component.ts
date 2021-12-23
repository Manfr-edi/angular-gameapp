import { Component, EventEmitter, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Spese, UserCollectionService } from 'src/app/services/user-collection.service';

@Component({
  selector: 'app-shopping-report',
  templateUrl: './shopping-report.component.html',
  styleUrls: ['./shopping-report.component.css']
})
export class ShoppingReportComponent implements OnInit, OnChanges {

  @Input() updateReport?: EventEmitter<{ platform?: string, genre?: string }>;
  spesa: Spese = {} as Spese;

  constructor(private authService: AuthService, private userCollectionService: UserCollectionService) {
  }

  ngOnInit(): void {
    this.userCollectionService.GetSpese().then(s => this.spesa = s);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.updateReport?.observers.length == 0) //Mi iscrivo una sola volta
      this.updateReport?.subscribe(filters => this.userCollectionService.GetSpese(filters).then(s => this.spesa = s));
  }
}

