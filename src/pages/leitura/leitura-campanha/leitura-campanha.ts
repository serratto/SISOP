import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams,
  LoadingController, AlertController
} from 'ionic-angular';
import { StorageManager, SISOPGlobals } from "../../../shared/shared";

@IonicPage()
@Component({
  selector: 'page-leitura-campanha',
  templateUrl: 'leitura-campanha.html',
})
export class LeituraCampanhaPage {
  _globals: SISOPGlobals;

  parms: any;
  leiturasCampanha = [];
  leiturasValor = [];
  // {instrumento / uhe / ultimasLeituras / labelsLeitura / situacoesLeitura / templatesLeitura
  //   modeloInstrumentoTemplateLeitura / variaveisLeituraSituacao

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingController: LoadingController, private alert: AlertController,
    private stMan: StorageManager) {
    this._globals = new SISOPGlobals();

    this.parms = this.navParams.data;
  }

  ionViewWillEnter() {
    let loader = this.loadingController.create({
      content: 'carregando a leitura...'
    });
    loader.present().then(() => {
      Promise.all(
        [this.getLeiturasCampanha(),
        this.getLeituraValoresCampanha()])
        .then(() => {
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

  getLeiturasCampanha(): Promise<any> {
    this.leiturasCampanha = [];
    return new Promise((resolve, reject) => {
      this.stMan.getLeiturasCampanha(this.parms.instrumento.id)
        .then((data) => {
          for (var slCount = 0; slCount < data.res.rows.length; slCount++) {
            var tl = data.res.rows[slCount];
            this.leiturasCampanha.push(tl);
          }
          resolve();
        })
        .catch((err) => reject(err))
    });
  }

  getLeituraValoresCampanha(): Promise<any> {
    this.leiturasValor = [];
    return new Promise((resolve, reject) => {
      this.stMan.getLeituraValoresCampanha(this.parms.instrumento.id)
        .then((data) => {
          for (var slCount = 0; slCount < data.res.rows.length; slCount++) {
            var tl = data.res.rows[slCount];
            this.leiturasValor.push(tl);
          }
          resolve();
        })
        .catch((err) => reject(err))
    });
  }

  selectLeitura(evt, selected) {
    var valores = [];

    var leitura = selected;

    for (let index = 0; index < this.leiturasValor.length; index++) {
      var lv = this.leiturasValor[index];
      if (lv.DataLeitura == leitura.DataLeitura) {
        valores.push(lv);
      }
    }

    SISOPGlobals.leituraSelecionada = { leitura: selected, valores: valores };
    if (this.parms.instrumento.multiponto == 0) {
      this.navCtrl.parent.select(0);
    }
    else {
      this.navCtrl.parent.select(1);
    }
  }
}