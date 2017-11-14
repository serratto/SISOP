import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams,
  LoadingController, AlertController
} from 'ionic-angular';
import { GlobalVariables, StorageManager } from "../../shared/shared";

@IonicPage()
@Component({
  selector: 'page-instrumento-detail-historico',
  templateUrl: 'instrumento-detail-historico.html',
})
export class InstrumentoDetailHistoricoPage {

  instrumento: any;
  leituras: Array<any> = [];

  isDataAvailable: boolean = false;


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingController: LoadingController,
    public stMan: StorageManager,
    private alert: AlertController,
    public globalVars: GlobalVariables) {
    this.instrumento = this.navParams.data;
  }

  ionViewDidLoad() {
    let loader = this.loadingController.create({
      content: 'carregando o instrumento...'
    });
    loader.present().then(() => {
      this.globalVars.getCurrentUHE()
        .then((uhe) => {
          this.stMan.getUltimasLeituras(uhe, this.instrumento.id)
            .then((leit) => {
              // this.leituras = leit.UltimasLeituras;
              this.leituras.push(leit.UltimasLeituras);
              this.isDataAvailable = true;
              console.log(this.leituras);
            })
            .catch(() => { })
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
