import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-accept-request-dialog',
  templateUrl: './accept-request-dialog.component.html',
  styleUrls: ['./accept-request-dialog.component.css']
})
export class AcceptRequestDialogComponent implements OnInit {

  constructor( public dialogRef: MatDialogRef<AcceptRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {username: string}) { }

  ngOnInit(): void {
  }

}
