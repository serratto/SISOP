import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams,
  ModalController
} from 'ionic-angular';
import { SISOPGlobals } from "../../shared/shared";
import { InstrumentoDetailLeituraLeituraPage } from "../pages";

@IonicPage()
@Component({
  selector: 'page-instrumento-detail-leitura-campanha',
  templateUrl: 'instrumento-detail-leitura-campanha.html',
})
export class InstrumentoDetailLeituraCampanhaPage {
  _globals: SISOPGlobals;
  instrumento: any;
  uhe: any;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController) {
    this._globals = new SISOPGlobals();
    this._globals.getCurrentUHE().then((uhe) => this.uhe = uhe);

    
    this.instrumento = this.navParams.data.instrumento;
  }

  ionViewDidLoad() {

  }
  novaLeitura() {
    var parms = {
      instrumento: this.instrumento,
      uhe: this.uhe
    };
    let modal = this.modalCtrl.create(InstrumentoDetailLeituraLeituraPage, parms);
    modal.present();
  }
}
