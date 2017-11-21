import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams,
  ViewController
} from 'ionic-angular';
import _ from "lodash";

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
  }

  hasOnlyAlert(): boolean {
    var danger = _.find(this.erros, function (err) { return err.level == 'danger' });
    if (danger) {
      return false;
    }
    return true;
  }

  save() {
    this.viewCtrl.dismiss({ option: 'save' });
  }
  cancel() {
    this.viewCtrl.dismiss({ option: 'cancel' });
  }
}
