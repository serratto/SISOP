import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SISOPGlobals } from "../../shared/shared";

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})

export class HomePage {

  consts: SISOPGlobals;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.consts = new SISOPGlobals();
  }

  ionViewDidLoad() {

  }
}
