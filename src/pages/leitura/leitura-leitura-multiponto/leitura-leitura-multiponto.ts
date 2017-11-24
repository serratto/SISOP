import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { LeituraLeituraErroPage } from "../../pages";
import { SISOPGlobals } from "../../../shared/shared";

import _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-leitura-leitura-multiponto',
  templateUrl: 'leitura-leitura-multiponto.html',
})
export class LeituraLeituraMultipontoPage {
  _globals: SISOPGlobals;
  novaOuEdicao = "Nova Leitura";
  mustsave: boolean = true;
  temLeitura: boolean = false;

  parms: any;
  // {instrumento / uhe / ultimasLeituras / labelsLeitura / situacoesLeitura / templatesLeitura
  //   modeloInstrumentoTemplateLeitura / variaveisLeituraSituacao

  /* Model */
  compare = { dataLeitura: '', columns: [], situacao: 0, nivelDagua: '' };
  model = { dataLeitura: '', columns: [], situacao: 0, nivelDagua: '' };
  valuesChanged: boolean = false;
  columns = [];
  rows = [];
  rowId: number = 0;
  valorMultipontoCorrente: any;
  valoresMultiponto = [];
  situacoesLeitura = [];
  consistencia = [];

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
      this.prepareCurrentLeituraMultipoint();
    });
  }

  ionViewDidLoad() {
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
      // var toUpdate = _.find(this.model.columns, function (c) { return c.templateLeituraId == origem; })
      // toUpdate.valor = value;
      this.valorMultipontoCorrente[origem] = value;
    }

    this.valuesChanged = true;
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

  prepareCurrentLeituraMultipoint() {
    this.columns = [];
    this.rows = [];

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

    /* injeta linhas (multiponto) */
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

    for (let idxColunaCriaValor = 0; idxColunaCriaValor < this.columns.length; idxColunaCriaValor++) {
      const theColumn = this.columns[idxColunaCriaValor];
      /* para as linhas, pega a sequencia */
      for (let idxRowCriaValor = 0; idxRowCriaValor < this.rows.length; idxRowCriaValor++) {
        const theRow = this.rows[idxRowCriaValor];
        if (theColumn.templateleituraid != 0) {
          this.valoresMultiponto.push({
            seq: theRow.seq,
            templateleituraid: theColumn.templateleituraid,
            valor: undefined
            // ,
            // checked: false
          });
        }
      }
    }
    this.setCurrentAccordingToIdx();
  }

  setCurrentAccordingToIdx() {
    var arr = [];
    var idx = this.rowId;
    var theVals = _.filter(this.valoresMultiponto, function (vmp) { return vmp.seq == idx });
    // var checked = true;
    for (let index = 0; index < theVals.length; index++) {
      const theVal = theVals[index];
      arr[0] = idx;
      arr[theVal.templateleituraid] = theVal.valor;
      // checked = checked && theVal.checked;
    }
    this.valorMultipontoCorrente = arr;
    this.prepareRanges();
  }

  prepareRanges() {
    /* --> Valores */
    var ultimaLeitura: any;
    this.consistencia = [];

    for (let lei12idx = 0; lei12idx < this.parms.ultimasLeituras.length; lei12idx++) {
      var leitura = this.parms.ultimasLeituras[lei12idx];
      /* Pega última leitura */
      if (lei12idx == 0) {
        ultimaLeitura = leitura;
        break;
      }
    }

    /* Para cada template leitura recupera o Min Max e Ultima Leitura */
    for (let idxTmpl = 0; idxTmpl < this.parms.templatesLeitura.length; idxTmpl++) {
      var tmplLeit = this.parms.templatesLeitura[idxTmpl];
      var currentrowId = this.rowId;
      var ultima = _.find(ultimaLeitura.Valores, function (ul) {
        return (ul.TemplateLeituraId == tmplLeit.templateLeituraId && ul.Sequencial == currentrowId);
      });
      if (!ultima) continue;
      var minmax = this.getMinMaxToCurrentPoint(tmplLeit.templateLeituraId);
      this.consistencia.push({
        coluna: tmplLeit.nome,
        mensagem: "Última: " + ultima.Valor.toFixed(2).toString() +
          " (min: " + minmax.minimo.toFixed(2) +
          " / max: " + minmax.maximo.toFixed(2) + ")", level: 'alert'
      });
    }
  }

  getMinMaxToCurrentPoint(templateleituraId) {
    /* Pega Min e Max para o templateleitura e rowId corrente */
    var min: number;
    var max: number;
    var currentId = this.rowId;
    var rangeToCheck = new Array<number>();

    for (let idx12Ultimas = 0; idx12Ultimas < this.parms.ultimasLeituras.length; idx12Ultimas++) {
      var leitura = this.parms.ultimasLeituras[idx12Ultimas];
      for (let idxVals = 0; idxVals < leitura.Valores.length; idxVals++) {
        var val = leitura.Valores[idxVals];
        if (val.TemplateLeituraId == templateleituraId && val.Sequencial == currentId) {
          rangeToCheck.push(parseFloat(val.Valor));
        }
      }
    }
    min = _.min(rangeToCheck);
    max = _.max(rangeToCheck);
    return { minimo: min, maximo: max };
  }

  updateArrayAccordingToCurrent() {
    var idx = this.rowId;
    var theVals = _.filter(this.valoresMultiponto, function (vmp) { return vmp.seq == idx });
    for (let index = 0; index < theVals.length; index++) {
      const theVal = theVals[index];
      theVal.valor = this.valorMultipontoCorrente[theVal.templateleituraid];
      // theVal.checked = this.valorMultipontoCorrenteChecked;
    }
  }

  changeSituacao() {
    this.setReadingVariables();
    // this.prepareRanges();
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

  hasChanges(): boolean {
    return !(JSON.stringify(this.model) == JSON.stringify(this.compare)) || this.valuesChanged;
  }

  mostraLeitura() {
    return this.temLeitura ? 'mostra' : 'naoMostra';
  }

  prev() {
    this.updateArrayAccordingToCurrent();
    this.rowId = this.rowId - 1;
    this.setCurrentAccordingToIdx();
  }

  next() {
    this.updateArrayAccordingToCurrent();
    this.rowId = this.rowId + 1;
    this.setCurrentAccordingToIdx();
  }

  showLabel(col, row): boolean {
    return (col.seq == 0);
  }

  getLabel(row) {
    var rowLabel = _.find(this.rows, function (r) { return r.seq == row });
    var seq = parseInt(rowLabel.seq) + 1;
    var label = (rowLabel.Label ? "" : "(" + seq + ")") + " ";
    return label + rowLabel.Valor.toString();
  }

  prevEnabled(): boolean {
    return this.rowId > 0;
  }

  nextEnabled(): boolean {
    return this.rowId < this.rows.length - 1;
  }

  save() {
    this.updateArrayAccordingToCurrent();

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
    /* varre as linhas e todas variáveis de leitura para testar preenchimento e min/max */
    for (let idxRow = 0; idxRow < this.rows.length; idxRow++) {
      var row = this.rows[idxRow];
      /* pega os valores */
      var vals = _.filter(this.valoresMultiponto, function (vmp) { return vmp.seq == row.seq; });
      /* para cada valor, recupera o label e valida */
      for (let idxVal = 0; idxVal < vals.length; idxVal++) {
        var val = vals[idxVal];
        /* recupera o label */
        var templ = _.find(this.parms.templatesLeitura, function (tl) {
          return val.templateleituraid == tl.templateLeituraId;
        });

        /* recupera min max */
        /* guarda idx corrente */
        var currentRowId = this.rowId;

        /* seta o rowid para o min/max */
        this.rowId = row.seq;
        var minmax = this.getMinMaxToCurrentPoint(val.templateleituraid);

        var seqtoShow = parseInt(row.seq) + 1
        if (!val.valor || val.lenght == 0) {
          err.push({
            coluna: templ.nome + " - ponto (" + seqtoShow + ") " + row.Valor,
            mensagem: "Não fornecido ",
            level: 'danger'
          });
        } else {
          if (val.valor < minmax.minimo || val.valor > minmax.maximo) {
            err.push({
              coluna: templ.nome + " - ponto (" + seqtoShow + ") " + row.Valor,
              mensagem: "Fora da faixa  - (valor:" + val.valor + ") " +
                " (min: " + minmax.minimo.toFixed(2).toString() +
                " / max: " + minmax.maximo.toFixed(2).toString() + ")", level: 'alert'
            });
          }
        }
        /* retorna idx corrente */
        this.rowId = currentRowId;
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
