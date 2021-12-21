import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-select-options',
  templateUrl: './select-options.component.html',
  styleUrls: ['./select-options.component.css']
})
export class SelectOptionsComponent {

   constructor(@Inject(MAT_DIALOG_DATA) public data: {allOptions: string[], selectedOptions: string[]}) {
   }

}
