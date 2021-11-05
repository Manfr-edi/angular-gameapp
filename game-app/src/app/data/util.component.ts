import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-util',
  templateUrl: './util.component.html',
  styleUrls: ['./util.component.css']
})
export class UtilComponent implements OnInit {

  constructor() { }

  capitalize( str : string )
  {
	  var cap = "";
	  var splitted = str.split(" "); 
	  for (let s of splitted) {
		  cap += s.substring(0,1).toUpperCase() + s.substring(1) + " ";
	  }
	  return cap;
  }
  
  ngOnInit(): void {
  }

}
