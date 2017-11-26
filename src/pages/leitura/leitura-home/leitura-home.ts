import { Component } from '@angular/core';
import { Events } from 'ionic-angular';
import {
  IonicPage, NavController, NavParams,
  LoadingController, AlertController
} from 'ionic-angular';
import { StorageManager, SISOPGlobals, UHEFile } from "../../../shared/shared";

import {
  LeituraLeituraPage, LeituraCampanhaPage,
  LeituraUltimas12Page, LeituraInstrumentoPage, LeituraLeituraMultipontoPage
} from "../../pages";

@IonicPage()
@Component({
  selector: 'page-leitura-home',
  templateUrl: 'leitura-home.html',
})
export class LeituraHomePage {
  _globals: SISOPGlobals;

  /* tabs */
  leituraTab = LeituraLeituraPage;
  leituraMultiPontoTab = LeituraLeituraMultipontoPage;
  campanhaTab = LeituraCampanhaPage;
  ultimas12Tab = LeituraUltimas12Page;
  instrumentoTab = LeituraInstrumentoPage;

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

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private loadingController: LoadingController,
    private alert: AlertController,
    private stMan: StorageManager,
    private events: Events) {

    this._globals = new SISOPGlobals();

    this.parms = {};
    this.parms.instrumento = this.navParams.data;
    this.parms.uhe = new UHEFile();
    this.parms.ultimasLeituras = [];
    this.parms.labelsLeitura = [];
    this.parms.situacoesLeitura = [];
    this.parms.templatesLeitura = [];
    this.parms.modeloInstrumentoTemplateLeitura = [];
    this.parms.variaveisLeituraSituacao = [];
    this.parms.barcode = 0;
  }

  ionViewDidLoad() {
    let loader = this.loadingController.create({
      content: 'carregando a leitura...'
    });
    loader.present().then(() => {
      this._globals.getCurrentUHE()
        .then(uhe => {
          this.parms.uhe = uhe;
          Promise.all(
            [this.getSituacaoLeitura(),
            this.getTemplateLeitura(),
            this.getModeloTemplateLeitura(),
            this.getVariaveisLeituraSituacao(),
            this.getUltimasLeituras()])
            .then(() => {
              this.events.publish('finishedloading:leitura');
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
    })
  }

  multipoint(): boolean {
    return (this.parms.instrumento.multiponto == 1);
  }

  nmultipoint(): boolean {
    return (this.parms.instrumento.multiponto == 0);
  }

  /* Processo de recuperação */
  getSituacaoLeitura(): Promise<any> {
    this.parms.situacoesLeitura = [];
    return new Promise((resolve, reject) => {
      this.stMan.getSituacaoLeituraByTipoInstrumento(this.parms.instrumento.tipoInstrumentoId)
        .then((sitLeit) => {
          for (var slCount = 0; slCount < sitLeit.res.rows.length; slCount++) {
            var sli = sitLeit.res.rows[slCount];
            this.parms.situacoesLeitura.push(sli);
          }
          resolve();
        })
        .catch((err) => reject(err));
    });
  }
  getTemplateLeitura(): Promise<any> {
    this.parms.templatesLeitura = [];
    return new Promise((resolve, reject) => {
      this.stMan.getTemplateLeituraByTipoInstrumento(this.parms.instrumento.tipoInstrumentoId)
        .then((templLeit) => {
          for (var slCount = 0; slCount < templLeit.res.rows.length; slCount++) {
            var tl = templLeit.res.rows[slCount];
            this.parms.templatesLeitura.push(tl);
          }
          resolve();
        })
        .catch((err) => reject(err));
    });
  }
  getModeloTemplateLeitura(): Promise<any> {
    this.parms.modeloInstrumentoTemplateLeitura = [];
    return new Promise((resolve, reject) => {
      this.stMan.getModeloTemplateLeituraByModelo(this.parms.instrumento.modeloid)
        .then((modTempl) => {
          for (var slCount = 0; slCount < modTempl.res.rows.length; slCount++) {
            var tl = modTempl.res.rows[slCount];
            this.parms.modeloInstrumentoTemplateLeitura.push(tl);
          }
          resolve();
        })
        .catch((err) => reject(err));
    });
  }
  getVariaveisLeituraSituacao(): Promise<any> {
    this.parms.variaveisLeituraSituacao = [];
    return new Promise((resolve, reject) => {
      this.stMan.getVariaveisLeituraSituacao(this.parms.instrumento.tipoInstrumentoId,
        this.parms.instrumento.modeloid)
        .then((data) => {
          for (var slCount = 0; slCount < data.res.rows.length; slCount++) {
            var tl = data.res.rows[slCount];
            this.parms.variaveisLeituraSituacao.push(tl);
          }
          resolve(data);
        })
        .catch((err) => reject(err))
    });
  }
  getUltimasLeituras(): Promise<any> {
    this.parms.ultimasLeituras = [];
    this.parms.labelsLeitura = [];
    return new Promise((resolve, reject) => {
      this.stMan.getUltimasLeituras(this.parms.uhe, this.parms.instrumento.id)
        .then((data) => {
          this.parms.ultimasLeituras = data.UltimasLeituras;
          this.parms.labelsLeitura = data.LabelLeitura;

          this.trataUltimasLeituras();

          resolve(data);
        })
        .catch((err) => reject(err))
    });
  }

  trataUltimasLeituras() {
    for (var index = 0; index < this.parms.ultimasLeituras.length; index++) {
      let leitura = this.parms.ultimasLeituras[index];

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
    }
  }
}