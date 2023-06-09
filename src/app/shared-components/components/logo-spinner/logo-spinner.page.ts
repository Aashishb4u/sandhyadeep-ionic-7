import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {SharedService} from "../../../shared-services/shared.service";

@Component({
  selector: 'app-logo-spinner',
  templateUrl: './logo-spinner.page.html',
  styleUrls: ['./logo-spinner.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LogoSpinnerPage implements OnInit {

  constructor(public sharedService: SharedService) { }

  ngOnInit() {
  }

}
