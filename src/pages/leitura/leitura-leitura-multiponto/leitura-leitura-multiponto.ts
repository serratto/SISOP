import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-leitura-leitura-multiponto',
  templateUrl: 'leitura-leitura-multiponto.html',
})
export class LeituraLeituraMultipontoPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LeituraLeituraMultipontoPage');
  }

}
