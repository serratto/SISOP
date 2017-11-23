import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';

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

  parms: any;
  // {instrumento / uhe / ultimasLeituras / labelsLeitura / situacoesLeitura / templatesLeitura
  //   modeloInstrumentoTemplateLeitura / variaveisLeituraSituacao

  /* Model */

  compare = { dataLeitura: '', columns: [], situacao: 0, nivelDagua: '' };
  model = { dataLeitura: '', columns: [], situacao: 0, nivelDagua: '' };
  situacoesLeitura = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private events: Events) {
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

  /* efetua a restrição das situações de leitura, 
  de acordo com as configurações de Variáveis de leitura por situação
  onde estão todas as configurações possíveis (inclusive aquelas que 
    não le nenhuma variável, como p.ex. NÃO LIDO / SECO / SEM PRESSÃO)
    */
  restringeSituacoesPossiveis() {
    console.log('this.parms', this.parms);
    console.log('this.parms.situacoesLeitura', this.parms.situacoesLeitura);

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
    return !(JSON.stringify(this.model) == JSON.stringify(this.compare));
  }

}
