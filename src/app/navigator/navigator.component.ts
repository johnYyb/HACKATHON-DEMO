import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss']
})
export class NavigatorComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
