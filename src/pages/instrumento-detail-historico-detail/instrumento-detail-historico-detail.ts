import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams, ViewController,
  LoadingController, AlertController
} from 'ionic-angular';
import { SISOPGlobals, StorageManager } from '../../shared/shared'
import _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-instrumento-detail-historico-detail',
  templateUrl: 'instrumento-detail-historico-detail.html',
})
export class InstrumentoDetailHistoricoDetailPage {
  _globals: SISOPGlobals;
  instrumento: any;
  leitura: any;
  todasLeituras: Array<any> = [];
  currentUHE: any;
  isDataAvailable: boolean = false;
  sitLeitura: any;
  templatesLeitura: Array<any> = [];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public loadingController: LoadingController,
    public alert: AlertController,
    public stMan: StorageManager) {

    this._globals = new SISOPGlobals();
    this.instrumento = this.navParams.data.instrumento;
    this.leitura = this.navParams.data.leituraCorrente;
    this.todasLeituras = this.navParams.data.todasLeituras;
  }

  ionViewDidLoad() {

    let loader = this.loadingController.create({
      content: 'carregando a leitura...'
    });
    loader.present().then(() => {
      this._globals.getCurrentUHE()
        .then((uhe) => {
          this.currentUHE = uhe;

          console.log('instrumento', this.instrumento);
          console.log('leitura', this.leitura);
          console.log('todasLeituras', this.todasLeituras);

          this.stMan.getSituacaoLeitura(this.leitura.SituacaoLeituraId)
            .then((sitLeit) => {
              this.sitLeitura = sitLeit.res.rows[0];

              console.log('sitLeitura', this.sitLeitura);

              this.stMan.getTemplateLeituraByTipoInstrumento(this.instrumento.tipoInstrumentoId,
                this.leitura.SituacaoLeituraId, this.instrumento.modeloid)
                .then((templLeit) => {
                  this.templatesLeitura = templLeit.res.rows;
                  this.isDataAvailable = true;
                  loader.dismiss();
                  console.log('templatesLeitura', this.templatesLeitura);

                })

            })
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

  prevDisable() {
    var currentIdx = parseInt(this.leitura.Idx);
    if (currentIdx == 1) { return true; }
    return false;
  }

  
  previous() {
    var currentIdx = parseInt(this.leitura.Idx);
    currentIdx = currentIdx - 1;
    var findLeitura = currentIdx.toString();
    if (currentIdx < 10) {
      findLeitura = '0' + currentIdx.toString();
    }
    this.leitura = _.find(this.todasLeituras, function (l) { return l.Idx == findLeitura});
  }
  
  nextDisable() {
    var currentIdx = parseInt(this.leitura.Idx);
    if (currentIdx == 12) { return true; }
    return false;
  }

  next() {
    var currentIdx = parseInt(this.leitura.Idx);
    currentIdx = currentIdx + 1;
    var findLeitura = currentIdx.toString();
    if (currentIdx < 10) {
      findLeitura = '0' + currentIdx.toString();
    }
    this.leitura = _.find(this.todasLeituras, function (l) { return l.Idx == findLeitura});
  }


  dismiss() {
    this.viewCtrl.dismiss();
  }
}
