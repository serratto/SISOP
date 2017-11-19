import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams,
  ViewController
} from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-instrumento-detail-leitura-erro',
  templateUrl: 'instrumento-detail-leitura-erro.html',
})
export class InstrumentoDetailLeituraErroPage {

  instrumento: any;
  erros: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController) {
    this.instrumento = this.navParams.data.instrumento;
    this.erros = this.navParams.data.erros;
  }

  ionViewDidLoad() {
    console.log(this.erros);
  }

  save() {
    this.viewCtrl.dismiss({ option: 'save' });
  }
  cancel() {
    this.viewCtrl.dismiss({ option: 'cancel' });
  }

  private dismiss() {
  }
}
