import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-remove-friend-dialog',
  templateUrl: './remove-friend-dialog.component.html',
  styleUrls: ['./remove-friend-dialog.component.css']
})
export class RemoveFriendDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RemoveFriendDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {username: string}) { }

  ngOnInit(): void {
  }

}
