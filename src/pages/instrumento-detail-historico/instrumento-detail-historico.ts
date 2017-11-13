import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-instrumento-detail-historico',
  templateUrl: 'instrumento-detail-historico.html',
})
export class InstrumentoDetailHistoricoPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    console.log('InstrumentoDetailHistoricoPage PARMS:', this.navParams.data);
  }

  ionViewDidLoad() {
  }

}
