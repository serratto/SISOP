import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams,
  LoadingController, AlertController
} from 'ionic-angular';
import { GlobalVariables, StorageManager } from "../../shared/shared";

@IonicPage()
@Component({
  selector: 'page-instrumento-detail-detail',
  templateUrl: 'instrumento-detail-detail.html',
})
export class InstrumentoDetailDetailPage {

  parmInstrumento: any; //{id: 00, modelo: "", numero: "", estado: ""}
  instrumento: any;
  ativo: boolean;
  ativoOriginal: boolean;
  estado: string = '';

  mustsave: boolean = false;

  isDataAvailable: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingController: LoadingController,
    public stMan: StorageManager,
    private alert: AlertController,
    public globalVars: GlobalVariables) {
    this.parmInstrumento = this.navParams.data;
  }

  ionViewDidLoad() {
    let loader = this.loadingController.create({
      content: 'carregando o instrumento...'
    });
    loader.present().then(() => {
      this.stMan.getInstrumento(this.parmInstrumento.id)
        .then((ret) => {
          this.instrumento = ret.res.rows[0];
          this.ativoOriginal = (this.instrumento.estado == "Normal" ? true : false);
          this.ativo = (this.instrumento.estado == "Normal" ? true : false);
          this.estado = (this.ativo ? 'Normal' : 'Danificado');

          this.stMan.getStateChangedInstrumento(this.instrumento.id)
            .then((resState) => {
              /* se houve mudança de estado  */
              if (resState.res.rows.length > 0) {
                var stateSaved = resState.res.rows[0];
                this.instrumento.estado = (stateSaved.estadoId == 1 ? 'Normal' : 'Danificado');
                this.estado = (stateSaved.estadoId == 1 ? 'Normal' : 'Danificado');
                this.ativoOriginal = (this.instrumento.estado == "Normal" ? true : false);
                this.ativo = (this.instrumento.estado == "Normal" ? true : false);
              }
              /* habilita a apresentação dos objetos*/
              this.isDataAvailable = true;
              loader.dismiss();
            })
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

  setStatus() {
    this.estado = (this.ativo ? 'Normal' : 'Danificado');
    this.mustsave = (this.ativo != this.ativoOriginal);
  }

  saveStateChange() {
    var instrumentoId = this.instrumento.id;
    var estadoId = (this.estado == 'Normal' ? 1 : 2); /* 1 - Normal / 2 - Danificado */
    let loader = this.loadingController.create({
      content: 'Salvando mudança de estado'
    });
    loader.present().then(() => {
      this.stMan.saveStateInstrumento(instrumentoId, estadoId)
        .then((ret) => {
          this.mustsave = false;
          this.ativoOriginal = this.ativo;
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

  ionViewWillUnload() {
    if (this.mustsave) {
      let alert = this.alert.create({
        title: 'Mudança de estado pendente.',
        cssClass: 'alert-danger',
        message: 'Deseja sair sem salvar?',
        buttons: [{
          text: 'Salvar',
          handler: () => {
            this.saveStateChange();
          }
        }, 'Descartar']
      });
      alert.present();
    }
  }
}
