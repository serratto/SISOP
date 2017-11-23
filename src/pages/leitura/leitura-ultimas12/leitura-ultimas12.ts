import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams,
  ModalController
} from 'ionic-angular';
import { LeituraUltimas12DetalhePage } from "../../pages";


@IonicPage()
@Component({
  selector: 'page-leitura-ultimas12',
  templateUrl: 'leitura-ultimas12.html',
})
export class LeituraUltimas12Page {
  showLeitura: boolean = true;
  isDataAvailable: boolean = false;
  parms: any;
  // {
  //   instrumento: any,
  //   uhe: UHEFile,
  //   ultimasLeituras: any,
  //   labelsLeitura: any,
  //   situacoesLeitura: any,
  //   templatesLeitura: any,
  //   modeloInstrumentoTemplateLeitura: any,
  //   variaveisLeituraSituacao: any
  // };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private modalCtrl: ModalController) {

    this.parms = navParams.data;
  }

  ionViewDidLoad() {

    /* Valida se mostra a leitura na tela inicial ou não */
    if (this.parms.ultimasLeituras.length > 0) {
      if (this.parms.ultimasLeituras[0].Valores.length > 0) {
        this.showLeitura = (this.parms.ultimasLeituras[0].Valores.length == 1);
      }
    }
    this.isDataAvailable = true;
  }

  selectLeitura(leitura) {
    var parms = this.parms;
    parms.leituraCorrente = leitura;
    let modal = this.modalCtrl.create(LeituraUltimas12DetalhePage, parms);
    modal.present();
  }
}
