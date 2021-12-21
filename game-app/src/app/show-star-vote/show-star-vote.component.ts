import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-show-star-vote',
  templateUrl: './show-star-vote.component.html',
  styleUrls: ['./show-star-vote.component.css']
})
export class ShowStarVoteComponent implements OnChanges {

  @Input() value?: number;
  @Input() count?: number;

  wholeStar: number = 0;
  halfStar: boolean = false;
  emptyStar: number = 0;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.value && this.value > 0 && this.count && this.count > 0) {
      this.wholeStar = Math.floor(this.value);
      this.halfStar = (this.value - this.wholeStar >= 0.5) //Prendo la parte frazionaria
      this.emptyStar = 5 - this.wholeStar - (this.halfStar ? 1 : 0);
    }
  }
}
