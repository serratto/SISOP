import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams,
  LoadingController, AlertController
} from 'ionic-angular';
import { GlobalVariables, StorageManager } from "../../shared/shared";
import _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-instrumento-detail-detail',
  templateUrl: 'instrumento-detail-detail.html',
})
export class InstrumentoDetailDetailPage {

  parmInstrumento: any; //{id: 00, modelo: "", numero: "", estado: ""}
  currentInstrumento: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingController: LoadingController,
    public stMan: StorageManager,
    private alert: AlertController,
    public globalVars: GlobalVariables) {
    this.parmInstrumento = this.navParams.data;
  }

  ionViewDidLoad() {
    let loader = this.loadingController.create({
      content: 'carregando o instrumento...'
    });
    loader.present().then(() => {
      this.stMan.getInstrumento(this.parmInstrumento.id)
        .then((instrumento) => {
          this.currentInstrumento = instrumento.res.rows[0];
          loader.dismiss();
        })
        .catch((err) => {
          let alert = this.alert.create({
            title: 'Erro',
            cssClass: 'alert-danger',
            message: err,
            buttons: ['Ok']
          });
          alert.present();
          loader.dismiss();
        });
    });
  }
}
