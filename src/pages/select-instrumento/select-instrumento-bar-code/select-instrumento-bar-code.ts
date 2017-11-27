import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { LeituraHomePage } from "../../pages";
import { StorageManager } from "../../../shared/shared";

@IonicPage()
@Component({
  selector: 'page-select-instrumento-bar-code',
  templateUrl: 'select-instrumento-bar-code.html',
})
export class SelectInstrumentoBarCodePage {

  readCode: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private alert: AlertController,
    private barcode: BarcodeScanner,
    private stMan: StorageManager,
    public app: App) {
  }

  ionViewDidLoad() {
  }

  readBarcode() {
    this.barcode.scan()
      .then((bcData) => {
        this.readCode = bcData.text;
        this.goToDetail();
      })
      .catch((err) => {
        if (err == "cordova_not_available") {
          this.readCode = 'teste';
          this.goToDetail();
        }
      });
  }

  goToDetail() {
    this.stMan.getInstrumentosByBarCode(this.readCode)
      .then((data) => {
        var recFound = data.res.rows.length;
        if (recFound > 1) {
          let alert = this.alert.create({
            title: 'Erro',
            cssClass: 'alert-danger',
            message: 'Mais de um instrumento encontrado para o mesmo código de barras',
            buttons: ['Ok']
          });
          alert.present();
        } else if (recFound == 0) {
          let alert = this.alert.create({
            title: 'Erro',
            cssClass: 'alert-danger',
            message: 'Nenhum instrumento encontrado para o código de barras',
            buttons: ['Ok']
          });
          alert.present();
        }
        else {
          this.readCode = "";
          var parmInstrumento = data.res.rows[0];
          this.app.getRootNav().push(LeituraHomePage, parmInstrumento);
        }
      })
      .catch((err) => { })


  }
}
