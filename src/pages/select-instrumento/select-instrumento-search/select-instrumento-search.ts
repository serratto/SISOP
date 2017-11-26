import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams,
  LoadingController, AlertController
} from 'ionic-angular';
import { SISOPGlobals, StorageManager } from "../../../shared/shared";
import _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-select-instrumento-search',
  templateUrl: 'select-instrumento-search.html',
})
export class SelectInstrumentoSearchPage {
  tipoSelected: any;
  usinaId: any;
  instrumentos: Array<any>;
  instrFilter = [];
  queryText: string = '';

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private loadingController: LoadingController,
    public _globals: SISOPGlobals,
    public stMan: StorageManager,
    private alert: AlertController, ) {

    this.tipoSelected = this.navParams.data.tipoSelected;
    this.usinaId = this.navParams.data.usina;
  }

  ionViewDidLoad() {
    let loader = this.loadingController.create({
      content: 'carregando os instrumento...'
    });
    this.instrumentos = [];
    this.instrFilter = [];
    this.stMan.getInstrumentosByTipoUHE(this.tipoSelected.id, this.usinaId)
      .then((tipos) => {
        this.instrumentos = tipos.res.rows;
        this.instrFilter = tipos.res.rows;
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
  }

  atualizaInstrumentos(ev: any) {
    let theFilter = ev.target.value;

    let instrumentoFiltrado = [];

    if (theFilter && theFilter.trim() != '') {
      instrumentoFiltrado = _.filter(this.instrumentos,
        function (instr) {
          return instr.numero.indexOf(theFilter) > -1;
        });
    }
    else {
      instrumentoFiltrado = this.instrumentos;
    }
    this.instrFilter = instrumentoFiltrado;
  }

  selectInstrumento(evt, selected) {
    this._globals.instrumentoSelecionado = selected;
    this.navCtrl.pop();
  }

  closeThis() {
    this.navCtrl.pop()
  }
}
