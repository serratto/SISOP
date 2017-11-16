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
  isDataAvailable: boolean = false;
  currentUHE: any;

  instrumento: any;

  leitura: any;
  todasLeituras: Array<any> = [];

  situacaoLeitura: any;
  situacoesLeitura: Array<any> = [];

  templatesLeitura: Array<any> = [];

  labelsLeitura: Array<any> = [];

  modeloInstrumentoTemplateLeitura: Array<any> = [];
  /* suporte para apresentação */
  multiponto: boolean = false;
  columns: Array<any> = [];
  rows: Array<any> = [];

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
    this.labelsLeitura = this.navParams.data.labelsLeitura;
    this.currentUHE = this.navParams.data.currentUHE;
    this.multiponto = this.instrumento.multiponto == 1;
  }

  ionViewDidLoad() {
    let loader = this.loadingController.create({
      content: 'carregando a leitura...'
    });
    loader.present().then(() => {
      Promise.all(
        [this.getSituacaoLeitura(),
        this.getTemplateLeitura(),
        this.getModeloTemplateLeitura()])
        .then(() => {
          this.prepareCurrentLeitura();
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

  getVal(row, col): number {
    if (this.instrumento.multiponto) {
      if (col.seq == 0) {
        if (row.Label) {
          return row.Valor;
        }
        else {
          return parseFloat(row.Valor.toString().replace(",", "."));
        }
      }

      var v = _.find(this.leitura.Valores, function (val) {
        return val.TemplateLeituraId == col.templateleituraid && val.Sequencial == row.seq;
      });

      return v.Valor;
      // return parseFloat(v.Valor.replace(",", "."));
    }

    return 0;
  }

  getClass(col) {
    if (col.seq == 0) {
      return 'gridTitle';
    }
    return 'gridData';
  }

  prepareCurrentLeitura() {
    this.columns = [];
    this.rows = [];
    for (var index = 0; index < this.situacoesLeitura.length; index++) {
      var sl = this.situacoesLeitura[index];
      if (sl.id == this.leitura.SituacaoLeituraId) {
        this.situacaoLeitura = sl;
      }
    }

    if (this.labelsLeitura.length > 0) {
      this.columns.push({
        label: "",
        templateleituraid: 0,
        seq: 0
      });
    }
    /* Cria os headers */
    for (var idx2 = 0; idx2 < this.templatesLeitura.length; idx2++) {
      var element = this.templatesLeitura[idx2];
      if (this.instrumento.multiponto) {
        /* Verifica se esse label pertence à este modelo, se sim, carrega */
        var findTemp = _.find(this.modeloInstrumentoTemplateLeitura,
          function (mitl) { return mitl.templateLeituraId == element.templateLeituraId });
        if (findTemp) {

          this.columns.push({
            label: element.sigla,
            templateleituraid: element.templateLeituraId,
            seq: element.sequencia
          });
        }
      }
      else {
        this.columns.push({
          label: element.nome,
          templateleituraid: element.templateLeituraId,
          seq: 0
        });
      }
    }

    /* injeta linhas (multiponto) */
    if (this.instrumento.multiponto) {
      /* verifica se existe mais de 1 label para a mesma sequencia, 
      se sim, ignora o label com valor vazio (que é só a sequencia) */
      var qtLabels = _.filter(this.labelsLeitura, function (ll) { return ll.Seq == 0 });
      
      for (var idx3 = 0; idx3 < this.labelsLeitura.length; idx3++) {
        var label = this.labelsLeitura[idx3];
        if (label.Valor.length == 0) {
          if (qtLabels.length == 1) {
            this.rows.push({ seq: label.Seq, Valor: parseInt(label.Seq) + 1, Label: true });
          }
        }
        else {
          this.rows.push({ seq: label.Seq, Valor: label.Valor, Label: false });
        }
      }
    }
    else {
      var cols = [];
      for (let idx4 = 0; idx4 < this.columns.length; idx4++) {
        const element = this.columns[idx4];
        var val = _.find(this.leitura.Valores,
          function (v) { return v.TemplateLeituraId == element.templateleituraid });
        if (val) {
          cols.push({
            label: element.label,
            templateleituraid: element.templateLeituraId,
            seq: element.seq,
            valor: val.Valor
          });
        }
      }
      this.columns = cols;
    }


    this.isDataAvailable = true;
    // console.log('UHE', this.currentUHE);
    // console.log('instrumento', this.instrumento);
    // console.log('leitura', this.leitura);
    // console.log('todasLeituras', this.todasLeituras);
    // console.log('situacaoLeitura', this.situacaoLeitura);
    // console.log('situacoesLeitura', this.situacoesLeitura);
    // console.log('templatesLeitura', this.templatesLeitura);
    // console.log('labelsLeitura', this.labelsLeitura);
    // console.log('modeloInstrumentoTemplateLeitura', this.modeloInstrumentoTemplateLeitura);
    // console.log('rows', this.rows);
    // console.log('columns', this.columns);
  }

  prevDisable() {
    var currentIdx = parseInt(this.leitura.Idx);
    if (currentIdx == 1) { return true; }
    return false;
  }

  previous() {
    this.isDataAvailable = false;
    var currentIdx = parseInt(this.leitura.Idx);
    currentIdx = currentIdx - 1;
    var findLeitura = currentIdx.toString();
    if (currentIdx < 10) {
      findLeitura = '0' + currentIdx.toString();
    }
    this.leitura = _.find(this.todasLeituras, function (l) { return l.Idx == findLeitura });
    this.prepareCurrentLeitura();
  }

  nextDisable() {
    var currentIdx = parseInt(this.leitura.Idx);
    if (currentIdx == 12) { return true; }
    return false;
  }

  next() {
    this.isDataAvailable = false;
    var currentIdx = parseInt(this.leitura.Idx);
    currentIdx = currentIdx + 1;
    var findLeitura = currentIdx.toString();
    if (currentIdx < 10) {
      findLeitura = '0' + currentIdx.toString();
    }
    this.leitura = _.find(this.todasLeituras, function (l) { return l.Idx == findLeitura });
    this.prepareCurrentLeitura();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  /* Processos de Recuperação */
  getSituacaoLeitura(): Promise<any> {
    this.situacoesLeitura = [];
    return new Promise((resolve, reject) => {
      this.stMan.getSituacaoLeituraByTipoInstrumento(this.instrumento.tipoInstrumentoId)
        .then((sitLeit) => {
          for (var slCount = 0; slCount < sitLeit.res.rows.length; slCount++) {
            var sli = sitLeit.res.rows[slCount];
            this.situacoesLeitura.push(sli);
          }
          resolve();
        })
        .catch((err) => reject(err));
    });
  }

  getTemplateLeitura(): Promise<any> {
    this.templatesLeitura = [];
    return new Promise((resolve, reject) => {
      this.stMan.getTemplateLeituraByTipoInstrumento(this.instrumento.tipoInstrumentoId)
        .then((templLeit) => {
          for (var slCount = 0; slCount < templLeit.res.rows.length; slCount++) {
            var tl = templLeit.res.rows[slCount];
            this.templatesLeitura.push(tl);
          }
          resolve();
        })
        .catch((err) => reject(err));
    });
  }

  getModeloTemplateLeitura(): Promise<any> {
    this.modeloInstrumentoTemplateLeitura = [];
    return new Promise((resolve, reject) => {
      this.stMan.getModeloTemplateLeituraByModelo(this.instrumento.modeloid)
        .then((modTempl) => {
          for (var slCount = 0; slCount < modTempl.res.rows.length; slCount++) {
            var tl = modTempl.res.rows[slCount];
            this.modeloInstrumentoTemplateLeitura.push(tl);
          }
          resolve();
        })
        .catch((err) => reject(err));
    });
  }
}