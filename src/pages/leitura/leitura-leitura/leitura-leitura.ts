import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { LeituraLeituraErroPage } from "../../pages";
import { SISOPGlobals } from "../../../shared/shared";

import _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-leitura-leitura',
  templateUrl: 'leitura-leitura.html',
})
export class LeituraLeituraPage {
  _globals: SISOPGlobals;

  novaOuEdicao = "Nova Leitura";
  mustsave: boolean = true;
  temLeitura: boolean = false;
  consistencia = [];

  parms: any;
  // {instrumento / uhe / ultimasLeituras / labelsLeitura / situacoesLeitura / templatesLeitura
  //   modeloInstrumentoTemplateLeitura / variaveisLeituraSituacao

  /* Model */

  compare = { dataLeitura: '', columns: [], situacao: 0, nivelDagua: '' };
  model = { dataLeitura: '', columns: [], situacao: 0, nivelDagua: '' };
  situacoesLeitura = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private events: Events, private modalController: ModalController) {
    this._globals = new SISOPGlobals();
    this.parms = this.navParams.data;
    /* inicializa o comparer */
    var data = this._globals.currentDateDime()
    this.model.dataLeitura = data;
    this.compare.dataLeitura = data;

    this.events.subscribe('finishedloading:leitura', () => {
      this.restringeSituacoesPossiveis();
    });
  }

  ionViewDidEnter() {
  }

  sanitizaNro(origem, value) {
    if (value.length == 1 && value == '-') return;
    value = value.replace(',', '.');
    if (isNaN(value)) {
      value = "0";
    };

    /* Se for NA, atualiza direto  */
    if (origem == 'na') {
      this.model.nivelDagua = value;
    }
    /* se não for NA procura em columns para atualizar */
    else {
      var toUpdate = _.find(this.model.columns, function (c) { return c.templateLeituraId == origem; })
      toUpdate.valor = value;
    }
  }
  /* efetua a restrição das situações de leitura, 
  de acordo com as configurações de Variáveis de leitura por situação
  onde estão todas as configurações possíveis (inclusive aquelas que 
    não le nenhuma variável, como p.ex. NÃO LIDO / SECO / SEM PRESSÃO)
    */
  restringeSituacoesPossiveis() {
    this.situacoesLeitura = [];
    for (let index = 0; index < this.parms.situacoesLeitura.length; index++) {
      const situacao = this.parms.situacoesLeitura[index];
      /* procura nas Variáveis de Leitura por Situações */
      var find = _.find(this.parms.variaveisLeituraSituacao,
        function (vls) { return vls.situacaoLeituraId == situacao.id });
      /* Se encontrou, faz o push */
      if (find) {
        this.situacoesLeitura.push(situacao);
      }
    }
  }

  changeSituacao() {
    this.setReadingVariables();
    this.prepareRanges();
  }

  setReadingVariables() {
    var vars: Array<any> = [];
    var templs: Array<any> = [];
    let situacaoId = this.model.situacao;
    /* recupera variáveis de acordo com a situacao */
    vars = _.filter(this.parms.variaveisLeituraSituacao,
      function (vls) { return vls.situacaoLeituraId == situacaoId });
    /* recupera templates de acordo com a situação */
    for (let idxVarLeit = 0; idxVarLeit < vars.length; idxVarLeit++) {
      const varLeit = vars[idxVarLeit];
      var findTempl = _.find(this.parms.templatesLeitura,
        function (tpl) { return varLeit.templateLeituraId == tpl.templateLeituraId })
      if (findTempl) { templs.push(findTempl); }
    }

    this.model.columns = [];
    this.temLeitura = false;

    if (templs.length > 0) {
      /* para cada template de leitura */
      for (let index = 0; index < templs.length; index++) {
        const theTempl = templs[index];
        /* recupera a unidade de medida na variável de leitura */
        var vl = _.find(vars, function (vli) { return vli.templateLeituraId == theTempl.templateLeituraId });
        this.model.columns.push({
          label: theTempl.nome, umed: vl.unidadeMedida,
          templateLeituraId: vl.templateLeituraId
        });
      }

      this.temLeitura = true;
    }
  }

  prepareRanges() {
    /* --> Valores */
    var valores12 = [];
    var max: number;
    var min: number;
    var ultimaLeitura: any;
    this.consistencia = [];

    for (let lei12idx = 0; lei12idx < this.parms.ultimasLeituras.length; lei12idx++) {
      var leitura = this.parms.ultimasLeituras[lei12idx];
      /* Pega última leitura */
      if (lei12idx == 0) {
        ultimaLeitura = leitura;
      }
      /* transfere o valor para array, para min/max */
      for (let valLeit = 0; valLeit < leitura.Valores.length; valLeit++) {
        const vals = leitura.Valores[valLeit];
        valores12.push(vals);
      }
    }
    for (let idxCols = 0; idxCols < this.model.columns.length; idxCols++) {
      var valCol = this.model.columns[idxCols];
      var maxItem = _.maxBy(valores12, function (val12) {
        if (val12.TemplateLeituraId == valCol.templateLeituraId) {
          return val12.Valor;
        }
      });
      var minItem = _.minBy(valores12, function (val12) {
        if (val12.TemplateLeituraId == valCol.templateLeituraId) {
          return val12.Valor;
        }
      });
      max = maxItem.Valor;
      min = minItem.Valor;

      var ultimoValor = 0;
      /* recupera valor da última leitura */
      if (ultimaLeitura) {
        var col = _.find(ultimaLeitura.Valores, function (vl) {
          return vl.TemplateLeituraId == valCol.templateLeituraId;
        })
        ultimoValor = col.Valor;
      }

      this.consistencia.push({
        coluna: valCol.label,
        mensagem: "Última: " + ultimoValor.toFixed(3).toString() + " (min: "
          + min.toFixed(3).toString() + " / max: " + max.toFixed(3).toString() + ")", level: 'alert'
      });
    }
  }

  hasChanges(): boolean {
    return !(JSON.stringify(this.model) == JSON.stringify(this.compare));
  }

  mostraLeitura() {
    return this.temLeitura ? 'mostra' : 'naoMostra';
  }

  save() {
    var err = [];
    /* Validações */
    /* -->> Situação */
    if (!this.model.situacao || this.model.situacao == 0) {
      err.push({ coluna: "Situação", mensagem: "Não fornecido", level: 'danger' });
    }
    /* -->> Nivel dágua */
    if ((this.parms.instrumento.niveldagua != 0) &&
      (!this.model.nivelDagua || parseFloat(this.model.nivelDagua) == 0)) {
      err.push({ coluna: "Nível D´água", mensagem: "Não fornecido", level: 'danger' });
    }

    /* --> Valores */
    var valores12 = [];
    for (let lei12idx = 0; lei12idx < this.parms.ultimasLeituras.length; lei12idx++) {
      var leitura = this.parms.ultimasLeituras[lei12idx];
      for (let valLeit = 0; valLeit < leitura.Valores.length; valLeit++) {
        const vals = leitura.Valores[valLeit];
        valores12.push(vals);
      }
    }
    var max: number;
    var min: number;
    for (let idxCols = 0; idxCols < this.model.columns.length; idxCols++) {
      var valCol = this.model.columns[idxCols];
      var maxItem = _.maxBy(valores12, function (val12) {
        if (val12.TemplateLeituraId == valCol.templateLeituraId) {
          return val12.Valor;
        }
      });
      var minItem = _.minBy(valores12, function (val12) {
        if (val12.TemplateLeituraId == valCol.templateLeituraId) {
          return val12.Valor;
        }
      });
      max = maxItem.Valor;
      min = minItem.Valor;

      if (!valCol.valor) {
        err.push({ coluna: valCol.label, mensagem: "Não fornecido", level: 'danger' });
      }
      else {
        if (valCol.valor < min || valCol.valor > max) {
          err.push({
            coluna: valCol.label,
            mensagem: "Fora da faixa (min: "
              + min.toFixed(3).toString() + " / max: " + max.toFixed(3).toString() + ")", level: 'alert'
          });
        }
      }
    }

    /* se tiver erro, mostra modal */
    if (err.length > 0) {
      let parm = { instrumento: this.parms.instrumento, erros: err };
      let errModal = this.modalController.create(LeituraLeituraErroPage, parm);
      errModal.onDidDismiss(data => this.modalErrorClose(data));
      errModal.present();
    }
    else {
      this.sendToDataBase();
    }
  }

  modalErrorClose(data) {
    if (data.option == "save") {
      this.sendToDataBase();
    }
  }

  sendToDataBase() {
    console.log('VAMOS SALVAR');
    console.log(this.model);
  }
}
