import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UserCollectionService } from 'src/app/services/user-collection.service';

@Component({
  selector: 'app-add-to-list',
  templateUrl: './add-to-list.component.html',
  styleUrls: ['./add-to-list.component.css']
})
export class AddToListComponent implements OnChanges {

  @Input() gameID: string = "";

  isInList: boolean = false;
  isLoading: boolean = true;
  showInsertForm: boolean = false;

  @Output() showInsertFormChanged: EventEmitter<boolean> = new EventEmitter();

  constructor(public userCollectionService: UserCollectionService) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.userCollectionService.checkUniqueList(this.gameID).then((res) => {
      this.isInList = !res;
      this.isLoading = false;
    });
  }

  completed(event: boolean) {
    this.isInList = event;
    this.toggleInsertForm();
  }

  toggleInsertForm() {
    this.showInsertForm = !this.showInsertForm;
    this.showInsertFormChanged.emit(this.showInsertForm);
  }
}
