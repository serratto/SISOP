import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams,
  ViewController, LoadingController,
  AlertController, ModalController
} from 'ionic-angular';
import { StorageManager, SISOPGlobals } from "../../shared/shared";
import { InstrumentoDetailLeituraErroPage } from "../../pages/pages";
import _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-instrumento-detail-leitura-leitura',
  templateUrl: 'instrumento-detail-leitura-leitura.html'
})

export class InstrumentoDetailLeituraLeituraPage {
  _globals: SISOPGlobals;
  instrumento: any;
  uhe: any;

  todasSituacoesLeitura: Array<any> = []; /* SEM FILTRO */
  situacoesLeitura: Array<any> = []; /* FILTRADAS PARA TELA ver restringeSituacoesPossiveis */
  templatesLeitura: Array<any> = [];
  modeloInstrumentoTemplateLeitura: Array<any> = [];
  ultimasLeituras: Array<any> = [];
  variaveisLeituraSituacao: Array<any> = [];

  multiponto: boolean = false;
  temLeitura: boolean = false;

  /* Grid de leitura */
  /* Model */
  compare = { dataLeitura: '', columns: [], situacao: 0, nivelDagua: '' };
  model = { dataLeitura: '', columns: [], situacao: 0, nivelDagua: '' };
  columns = [];
  rows = [];
  labelsLeitura = [];
  rowId: number = 0;
  valorMultipontoCorrente: any;
  valoresMultiponto = [];
  /* Variável para validação instantânea dos multipontos */
  consistencia: Array<any>;


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private alert: AlertController,
    private stMan: StorageManager) {
    this._globals = new SISOPGlobals();
    this.instrumento = this.navParams.data.instrumento;
    this.uhe = this.navParams.data.uhe;

    this.multiponto = this.instrumento.multiponto == 1;

    /* inicializa o comparer */
    var data = this._globals.currentDateDime()
    this.model.dataLeitura = data;
    this.compare.dataLeitura = data;

  }

  ionViewDidLoad() {
    let loader = this.loadingController.create({
      content: 'carregando a leitura...'
    });
    loader.present().then(() => {
      Promise.all(
        [this.getSituacaoLeitura(),
        this.getTemplateLeitura(),
        this.getModeloTemplateLeitura(),
        this.getVariaveisLeituraSituacao(),
        this.getUltimasLeituras()])
        .then(() => {
          this.restringeSituacoesPossiveis();
          if (this.multiponto) {
            this.prepareCurrentLeituraMultipoint();
          }
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

  changeSituacao() {
    this.setReadingVariables();
  }

  hasChanges(): boolean {
    return !(JSON.stringify(this.model) == JSON.stringify(this.compare));
  }

  mostraLeitura() {
    return this.temLeitura ? 'mostra' : 'naoMostra';
  }

  mostraSinglePoint() {
    return this.multiponto ? 'naoMostra' : 'mostra';
  }

  mostraMultiPoint() {
    return this.multiponto ? 'mostra' : 'naoMostra';
  }

  setReadingVariables() {
    var vars: Array<any> = [];
    var templs: Array<any> = [];
    let situacaoId = this.model.situacao;
    /* recupera variáveis de acordo com a situacao */
    vars = _.filter(this.variaveisLeituraSituacao,
      function (vls) { return vls.situacaoLeituraId == situacaoId });
    /* recupera templates de acordo com a situação */
    for (let idxVarLeit = 0; idxVarLeit < vars.length; idxVarLeit++) {
      const varLeit = vars[idxVarLeit];
      var findTempl = _.find(this.templatesLeitura,
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

  prepareCurrentLeituraMultipoint() {
    this.columns = [];
    this.rows = [];

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

    /* injeta linhas (multiponto) */
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

    console.log('valoresMultiponto', this.valoresMultiponto);
    console.log('ultimasLeituras', this.ultimasLeituras);

    console.log('cols', this.columns);
    console.log('rows', this.rows);
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

  compareToLimits(templateleituraId) {
    this.consistencia = [];
    var valor = this.valorMultipontoCorrente[templateleituraId];
    if (valor.length == 1 && valor == '-') return;
    valor = valor.replace(',', '.');
    if (isNaN(valor)) {
      valor = "0";
    };
    this.valorMultipontoCorrente[templateleituraId] = Number(valor);
    // rangeToCheck.push(Number(val.Valor.replace(',', '.')).toFixed(3));


    var tl = _.find(this.templatesLeitura, function (t) { return t.templateLeituraId == templateleituraId });
    var minmax = this.getMinMaxToCurrentPoint(templateleituraId)
    if (this.valorMultipontoCorrente[templateleituraId] < minmax.minimo ||
      this.valorMultipontoCorrente[templateleituraId] > minmax.maximo) {
      this.consistencia.push({
        coluna: tl.nome,
        mensagem: "Fora da faixa (min: "
          + minmax.minimo + " / max: " + minmax.maximo + ")", level: 'alert'
      });
    }


    console.log('valorMultipontoCorrente: ' + templateleituraId, this.valorMultipontoCorrente);
    console.log('templatesLeitura: ', this.templatesLeitura);
  }

  getMinMaxToCurrentPoint(templateleituraId) {
    /* Pega Min e Max para o templateleitura e rowId corrente */
    var min: number;
    var max: number;
    var currentId = this.rowId;
    var rangeToCheck = [];
    for (let idx12Ultimas = 0; idx12Ultimas < this.ultimasLeituras.length; idx12Ultimas++) {
      var leitura = this.ultimasLeituras[idx12Ultimas];
      for (let idxVals = 0; idxVals < leitura.Valores.length; idxVals++) {
        var val = leitura.Valores[idxVals];
        if (val.TemplateLeituraId == templateleituraId && val.Sequencial == currentId) {
          rangeToCheck.push(Number(val.Valor.replace(',', '.')).toFixed(3));
        }
      }
    }
    min = _.min(rangeToCheck);
    max = _.max(rangeToCheck);
    return { minimo: min, maximo: max };
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
    // this.valorMultipontoCorrenteChecked = checked;
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

  prevEnabled(): boolean {
    return this.rowId > 0;
  }

  nextEnabled(): boolean {
    return this.rowId < this.rows.length - 1;
  }

  /* efetua a restrição das situações de leitura, 
     de acordo com as configurações de Variáveis de leitura por situação
     onde estão todas as configurações possíveis (inclusive aquelas que 
    não le nenhuma variável, como p.ex. NÃO LIDO / SECO / SEM PRESSÃO)
   */
  restringeSituacoesPossiveis() {
    this.situacoesLeitura = [];
    for (let index = 0; index < this.todasSituacoesLeitura.length; index++) {
      const situacao = this.todasSituacoesLeitura[index];
      /* procura nas Variáveis de Leitura por Situações */
      var find = _.find(this.variaveisLeituraSituacao,
        function (vls) { return vls.situacaoLeituraId == situacao.id });
      /* Se encontrou, faz o push */
      if (find) {
        this.situacoesLeitura.push(situacao);
      }
    }
  }

  /* Processos de Recuperação */
  getSituacaoLeitura(): Promise<any> {
    this.situacoesLeitura = [];
    return new Promise((resolve, reject) => {
      this.stMan.getSituacaoLeituraByTipoInstrumento(this.instrumento.tipoInstrumentoId)
        .then((sitLeit) => {
          for (var slCount = 0; slCount < sitLeit.res.rows.length; slCount++) {
            var sli = sitLeit.res.rows[slCount];
            this.todasSituacoesLeitura.push(sli);
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

  getUltimasLeituras(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.stMan.getUltimasLeituras(this.uhe, this.instrumento.id)
        .then((data) => {
          this.ultimasLeituras = data.UltimasLeituras;
          this.labelsLeitura = data.LabelLeitura;
          resolve(data);
        })
        .catch((err) => reject(err))
    });
  }

  getVariaveisLeituraSituacao(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.stMan.getVariaveisLeituraSituacao(this.instrumento.tipoInstrumentoId,
        this.instrumento.modeloid)
        .then((data) => {
          for (var slCount = 0; slCount < data.res.rows.length; slCount++) {
            var tl = data.res.rows[slCount];
            this.variaveisLeituraSituacao.push(tl);
          }
          resolve(data);
        })
        .catch((err) => reject(err))
    });
  }

  /* Processos de validação, fechamento da janela e salvamento */
  dismiss() {
    if (this.hasChanges()) {
      let alert = this.alert.create({
        title: 'Atenção',
        cssClass: 'alert-danger',
        message: 'Existem dados que não foram gravados, deseja sair sem salvar?',
        buttons: [{
          text: 'Salvar',
          handler: () => {
            this.save();
          }
        }, {
          text: 'Descartar',
          handler: () => {
            this.viewCtrl.dismiss();
          }
        }, {
          text: 'Continuar leitura',
          handler: () => { }
        }]
      });
      alert.present();
    } else {
      this.viewCtrl.dismiss();
    }
  }

  save() {
    var err = [];
    /* Validações */
    /* -->> Situação */
    if (!this.model.situacao || this.model.situacao == 0) {
      err.push({ coluna: "Situação", mensagem: "Não fornecido", level: 'danger' });
    }
    /* -->> Nivel dágua */
    if ((this.instrumento.niveldagua != 0) &&
      (!this.model.nivelDagua || parseFloat(this.model.nivelDagua) == 0)) {
      err.push({ coluna: "Nível D´água", mensagem: "Não fornecido", level: 'danger' });
    }

    /* Validações para NAO-MULTIPONTO */
    if (!this.multiponto) {
      /* --> Valores */
      var valores12 = [];
      for (let lei12idx = 0; lei12idx < this.ultimasLeituras.length; lei12idx++) {
        var leitura = this.ultimasLeituras[lei12idx];
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
        max = parseFloat(maxItem.Valor.replace(',', '.'));
        min = parseFloat(minItem.Valor.replace(',', '.'));

        if (!valCol.valor) {
          err.push({ coluna: valCol.label, mensagem: "Não fornecido", level: 'danger' });
        }
        else {
          if (valCol.valor < min || valCol.valor > max) {
            err.push({
              coluna: valCol.label,
              mensagem: "Fora da faixa (min: "
                + min + " / max: " + max + ")", level: 'alert'
            });
          }
        }
      }
    }



    /* se tiver erro, mostra modal */
    if (err.length > 0) {
      let parm = { instrumento: this.instrumento, erros: err };
      let errModal = this.modalController.create(InstrumentoDetailLeituraErroPage, parm);
      errModal.onDidDismiss(data => this.modalErrorClose(data));
      errModal.present();
    }
    else {
      this.sendToDataBase();
    }
  }

  modalErrorClose(data) {
    console.log('InstrumentoDetailLeituraLeituraPage', data);
    if (data.option == "save") {
      this.sendToDataBase();
    }
  }

  sendToDataBase() {
    console.log('VAMOS SALVAR');
  }

}