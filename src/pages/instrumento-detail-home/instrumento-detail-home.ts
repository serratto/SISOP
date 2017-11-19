import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SISOPGlobals, UHEFile } from "../../shared/shared";

import {
  InstrumentoDetailDetailPage,
  InstrumentoDetailHistoricoPage,
  InstrumentoDetailLeituraCampanhaPage
} from "../pages";

@IonicPage()
@Component({
  selector: 'page-instrumento-detail-home',
  templateUrl: 'instrumento-detail-home.html',
})
export class InstrumentoDetailHomePage {
  _globals: SISOPGlobals;
  leituraTab = InstrumentoDetailLeituraCampanhaPage;
  detalheTab = InstrumentoDetailDetailPage;
  historicoTab = InstrumentoDetailHistoricoPage;
  selectedUhe: any = { sigla: "" };
  bubbleParms: any;
  instrumento: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this._globals = new SISOPGlobals();
    this.selectedUhe = new UHEFile();
    this.instrumento = this.navParams.data;
    this.bubbleParms = { instrumento: this.instrumento, uhe: this.selectedUhe };
  }

  ionViewDidLoad() {
    this._globals.getCurrentUHE()
      .then(uhe => {
        this.selectedUhe = uhe;
        this.bubbleParms.uhe = uhe;
      });
  }
}
