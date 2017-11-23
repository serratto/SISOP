import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { InstrumentoDetailHomePage } from "../../pages";

@IonicPage()
@Component({
  selector: 'page-select-instrumento-bar-code',
  templateUrl: 'select-instrumento-bar-code.html',
})
export class SelectInstrumentoBarCodePage {

  readCode: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private barcode: BarcodeScanner,
    public app: App) {
  }

  ionViewDidLoad() {
  }

  readBarcode() {
    this.barcode.scan()
      .then((bcData) => {
        console.log(bcData);
        this.readCode = bcData.text;
      })
      .catch((err) => { console.log(err); });
  }

  goToDetail() {
    this.app.getRootNav().push(InstrumentoDetailHomePage);
  }
}
