import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SISOPGlobals, UHEFile } from "../../shared/shared";

import {
  InstrumentoDetailDetailPage,
  InstrumentoDetailHistoricoPage,
  InstrumentoDetailLeituraPage
} from "../pages";

@IonicPage()
@Component({
  selector: 'page-instrumento-detail-home',
  templateUrl: 'instrumento-detail-home.html',
})
export class InstrumentoDetailHomePage {
  _globals: SISOPGlobals;
  leituraTab = InstrumentoDetailLeituraPage;
  detalheTab = InstrumentoDetailDetailPage;
  historicoTab = InstrumentoDetailHistoricoPage;
  selectedUhe: any;
  instrumentoParm: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this._globals = new SISOPGlobals();
    this.selectedUhe = new UHEFile();
    this.instrumentoParm = this.navParams.data;
  }

  ionViewDidLoad() {
    this._globals.getCurrentUHE()
      .then(uhe => {
        this.selectedUhe = uhe;
      });
  }

}
