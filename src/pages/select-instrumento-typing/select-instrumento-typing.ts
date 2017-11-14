import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams, App,
  LoadingController, AlertController
} from 'ionic-angular';
import { GlobalVariables, StorageManager } from "../../shared/shared";
import { SelectInstrumentoSearchPage, InstrumentoDetailHomePage } from "../pages";
import _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-select-instrumento-typing',
  templateUrl: 'select-instrumento-typing.html'
})
export class SelectInstrumentoTypingPage {

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private loadingController: LoadingController,
    public stMan: StorageManager,
    private alert: AlertController,
    public app: App,
    public globalVars: GlobalVariables) {
  }

  tiposPorUHE: Array<any>;
  public tipoSelected = undefined;
  private usinaId;

  ionViewDidLoad() {
    let loader = this.loadingController.create({
      content: 'carregando os tipos de instrumento...'
    });
    this.tiposPorUHE = [];
    this.globalVars.getCurrentUHE()
      .then((uhe) => {
        this.usinaId = uhe.usinaId;
        this.stMan.getTiposByUHE(uhe.usinaId)
          .then((tipos) => {
            this.tiposPorUHE = tipos.res.rows;
          })
          .catch(() => { })
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

  ionViewWillEnter() {
    /* verifica se o instrumento selecionado está preenchido (está voltando da seleção) */
    if (this.globalVars.instrumentoSelecionado) {
      /* limpa a seleção */
      var parmInstrumento = this.globalVars.instrumentoSelecionado;
      this.globalVars.instrumentoSelecionado = null;

      /* Chama a tela de detalhes do instrumento */
      this.app.getRootNav().push(InstrumentoDetailHomePage, parmInstrumento);
    }
  }

  selectInstrumento() {
    var tipo = _.find(this.tiposPorUHE, { 'id': this.tipoSelected });
    var parms = { tipoSelected: tipo, usina: this.usinaId };
    this.navCtrl.push(SelectInstrumentoSearchPage, parms);
  }

  onChange(){
    var tipo = _.find(this.tiposPorUHE, { 'id': this.tipoSelected });
    var parms = { tipoSelected: tipo, usina: this.usinaId };
    this.navCtrl.push(SelectInstrumentoSearchPage, parms);
  }
}
