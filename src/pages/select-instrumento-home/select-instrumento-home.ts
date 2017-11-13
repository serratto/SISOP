import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SelectInstrumentoBarCodePage, SelectInstrumentoTypingPage } from "../pages";

import { GlobalVariables, UHEFile } from "../../shared/shared";

@IonicPage()
@Component({
  selector: 'page-select-instrumento-home',
  templateUrl: 'select-instrumento-home.html',
})

export class SelectInstrumentoHomePage {
  selectedUhe: any;

  barcodeTab = SelectInstrumentoBarCodePage;
  typingTab = SelectInstrumentoTypingPage;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private globalVar: GlobalVariables) {
    this.selectedUhe = new UHEFile();
  }

  ionViewDidLoad() {
    this.globalVar.getCurrentUHE()
      .then(uhe => { 
        this.selectedUhe = uhe; });
  }

}