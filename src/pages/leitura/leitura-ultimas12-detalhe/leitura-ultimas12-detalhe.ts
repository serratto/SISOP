import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-leitura-ultimas12-detalhe',
  templateUrl: 'leitura-ultimas12-detalhe.html',
})
export class LeituraUltimas12DetalhePage {
  /* suporte para apresentação */
  isDataAvailable: boolean = false;

  multiponto: boolean = false;
  columns: Array<any> = [];
  rows: Array<any> = [];

  situacaoLeitura: any;

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
    private viewCtrl: ViewController) {
    this.parms = this.navParams.data;
    this.multiponto = this.parms.instrumento.multiponto == 1;
  }

  ionViewDidLoad() {
    this.prepareCurrentLeitura();
  }

  prepareCurrentLeitura() {
    this.columns = [];
    this.rows = [];
    for (var index = 0; index < this.parms.situacoesLeitura.length; index++) {
      var sl = this.parms.situacoesLeitura[index];
      if (sl.id == this.parms.leituraCorrente.SituacaoLeituraId) {
        this.situacaoLeitura = sl;
      }
    }

    if (this.parms.labelsLeitura.length > 0) {
      this.columns.push({
        label: "",
        templateleituraid: 0,
        seq: 0
      });
    }
    /* Cria os headers */
    for (var idx2 = 0; idx2 < this.parms.templatesLeitura.length; idx2++) {
      var element = this.parms.templatesLeitura[idx2];
      if (this.multiponto) {
        /* Verifica se esse label pertence à este modelo, se sim, carrega */
        var findTemp = _.find(this.parms.modeloInstrumentoTemplateLeitura,
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
    if (this.multiponto) {
      /* verifica se existe mais de 1 label para a mesma sequencia, 
      se sim, ignora o label com valor vazio (que é só a sequencia) */
      var qtLabels = _.filter(this.parms.labelsLeitura, function (ll) { return ll.Seq == 0 });
      for (var idx3 = 0; idx3 < this.parms.labelsLeitura.length; idx3++) {
        var label = this.parms.labelsLeitura[idx3];
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
        var val = _.find(this.parms.leituraCorrente.Valores,
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
  }

  prevDisable() {
    var currentIdx = parseInt(this.parms.leituraCorrente.Idx);
    if (currentIdx == 1) { return true; }
    return false;
  }

  previous() {
    this.isDataAvailable = false;
    var currentIdx = parseInt(this.parms.leituraCorrente.Idx);
    currentIdx = currentIdx - 1;
    var findLeitura = currentIdx.toString();
    if (currentIdx < 10) {
      findLeitura = '0' + currentIdx.toString();
    }
    this.parms.leituraCorrente = _.find(this.parms.ultimasLeituras, function (l) { return l.Idx == findLeitura });
    this.prepareCurrentLeitura();
  }

  nextDisable() {
    var currentIdx = parseInt(this.parms.leituraCorrente.Idx);
    if (currentIdx == 12) { return true; }
    return false;
  }

  next() {
    this.isDataAvailable = false;
    var currentIdx = parseInt(this.parms.leituraCorrente.Idx);
    currentIdx = currentIdx + 1;
    var findLeitura = currentIdx.toString();
    if (currentIdx < 10) {
      findLeitura = '0' + currentIdx.toString();
    }
    this.parms.leituraCorrente = _.find(this.parms.ultimasLeituras, function (l) { return l.Idx == findLeitura });
    this.prepareCurrentLeitura();
  }

  getClass(col) {
    if (col.seq == 0) {
      return 'lblNmbr';
    }
    return 'dataNmbr';
  }

  getVal(row, col): string {
    if (this.multiponto) {
      if (col.seq == 0) {
        if (row.Label) {
          return row.Valor;
        }
        else {
          return '(' + row.seq + ') ' + Number(row.Valor.replace(",", ".")).toFixed(2).toString();
        }
      }

      var v = _.find(this.parms.leituraCorrente.Valores, function (val) {
        return val.TemplateLeituraId == col.templateleituraid && val.Sequencial == row.seq;
      });
      return v.Valor.toFixed(2).toString();
    }

    return '0';
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
