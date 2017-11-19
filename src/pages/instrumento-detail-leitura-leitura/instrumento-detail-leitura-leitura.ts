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
  templateUrl: 'instrumento-detail-leitura-leitura.html',
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

  consistencia = [];

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

          // console.log('instrumento', this.instrumento);
          // console.log('uhe', this.uhe);
          // console.log('todasSituacoesLeitura', this.todasSituacoesLeitura);
          // console.log('situacoesLeitura', this.situacoesLeitura);
          // console.log('templatesLeitura', this.templatesLeitura);
          // console.log('modeloInstrumentoTemplateLeitura', this.modeloInstrumentoTemplateLeitura);
          console.log('ultimasLeituras', this.ultimasLeituras);
          // console.log('variaveisLeituraSituacao', this.variaveisLeituraSituacao);

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
            mensagem: "fora da faixa (min: "
              + min + " / max: " + max + ")", level: 'alert'
          });
        }
      }
    }
    /* se tiver erro, mostra modal */
    if (err.length > 0) {
      let parm={instrumento:this.instrumento,erros: err};
      let errModal = this.modalController.create(InstrumentoDetailLeituraErroPage,parm);
      errModal.onDidDismiss(data=>this.modalErrorClose(data));
      errModal.present();
    }
    this.consistencia = err;
  }

  modalErrorClose(data){
    console.log('InstrumentoDetailLeituraLeituraPage',data);
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

    // console.log('multiponto', this.multiponto);
    // console.log('temLeitura', this.temLeitura);

    // console.log('tipoInstrumentoId', this.instrumento.tipoInstrumentoId);
    // console.log('variaveisLeituraSituacao', this.variaveisLeituraSituacao);
    // console.log('templatesLeitura', this.templatesLeitura);
    // console.log('situacaoId', situacaoId);
    // console.log('variaveisLeitura', vars);
    // console.log('templatesLeitura', templs);
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

  /* fecha a janela corrente */
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
        }]
      });
      alert.present();
    }
  }
}
