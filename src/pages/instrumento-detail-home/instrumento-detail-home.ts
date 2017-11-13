import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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

  leituraTab = InstrumentoDetailLeituraPage;
  detalheTab = InstrumentoDetailDetailPage;
  historicoTab = InstrumentoDetailHistoricoPage;

  instrumentoParm: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.instrumentoParm = this.navParams.data;
    console.log('InstrumentoDetailHomePage PARMS:', this.navParams.data);
  }

  ionViewDidLoad() {
  }

}
