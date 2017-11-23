import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SelectInstrumentoBarCodePage, SelectInstrumentoTypingPage } from "../../pages";

import { SISOPGlobals, UHEFile } from "../../../shared/shared";

@IonicPage()
@Component({
  selector: 'page-select-instrumento-home',
  templateUrl: 'select-instrumento-home.html',
})

export class SelectInstrumentoHomePage {
  _globals: SISOPGlobals;
  selectedUhe: any;

  barcodeTab = SelectInstrumentoBarCodePage;
  typingTab = SelectInstrumentoTypingPage;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this._globals = new SISOPGlobals();
    this.selectedUhe = new UHEFile();
  }

  ionViewDidLoad() {
    this._globals.getCurrentUHE()
      .then(uhe => {
        this.selectedUhe = uhe;
      });
  }

}