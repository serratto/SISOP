import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams,
  LoadingController, AlertController,
  ModalController
} from 'ionic-angular';
import { SISOPGlobals, StorageManager } from "../../shared/shared";
import { InstrumentoDetailHistoricoDetailPage } from "../pages";

@IonicPage()
@Component({
  selector: 'page-instrumento-detail-historico',
  templateUrl: 'instrumento-detail-historico.html',
})
export class InstrumentoDetailHistoricoPage {
  _globals: SISOPGlobals;
  instrumento: any;
  currentUHE: any;
  leituras: Array<any> = [];
  labelsLeitura: Array<any> = [];
  showLeitura: boolean = true;
  isDataAvailable: boolean = false;


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingController: LoadingController,
    public stMan: StorageManager,
    private alert: AlertController,
    private modalCtrl: ModalController) {

    this._globals = new SISOPGlobals();
    this.instrumento = this.navParams.data;
  }

  ionViewDidLoad() {
    let loader = this.loadingController.create({
      content: 'carregando o instrumento...'
    });
    loader.present().then(() => {
      this._globals.getCurrentUHE()
        .then((uhe) => {
          this.currentUHE = uhe;
          this.stMan.getUltimasLeituras(uhe, this.instrumento.id)
            .then((leit) => {
              for (var index = 0; index < leit.UltimasLeituras.length; index++) {
                let leitura = leit.UltimasLeituras[index];

                this.showLeitura = (leitura.Valores.length == 1 && this.showLeitura);

                /* formata os valores da lista de valores para apresentação */
                for (var idx2 = 0; idx2 < leitura.Valores.length; idx2++) {
                  var val = leitura.Valores[idx2];
                  if (val.Valor) {
                    leitura.Valores[idx2].Valor = parseFloat(val.Valor.replace(',', '.'));
                  }
                  else {
                    leitura.Valores[idx2].Valor = 0.00;
                  }
                }
                /* zero a esquerda */
                if (index + 1 < 10) {
                  var count = index + 1;
                  leitura.Idx = '0' + count;
                } else {
                  leitura.Idx = index + 1;
                }
                this.leituras.push(leitura);
              }
              this.labelsLeitura = leit.LabelLeitura;
              this.isDataAvailable = true;
              loader.dismiss();
            })
            .catch(() => { loader.dismiss(); })
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

  selectLeitura(leitura) {
    var parms = {
      instrumento: this.instrumento,
      leituraCorrente: leitura,
      todasLeituras: this.leituras,
      labelsLeitura: this.labelsLeitura,
      currentUHE: this.currentUHE
    };
    let modal = this.modalCtrl.create(InstrumentoDetailHistoricoDetailPage, parms);
    modal.present();
  }
}
