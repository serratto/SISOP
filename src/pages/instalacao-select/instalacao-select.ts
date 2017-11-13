import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  ToastController,
  LoadingController,
  AlertController
} from 'ionic-angular';
import { File } from '@ionic-native/file'
import _ from 'lodash';

import { GlobalVariables, UHEFile } from '../../shared/shared';

@IonicPage()
@Component({
  selector: 'page-instalacao-select',
  templateUrl: 'instalacao-select.html',
})

export class InstalacaoSelectPage {
  uhesDisponiveis: Array<{ seq: string, name: string, fileName: string, message: string }>;
  results: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private file: File,
    private toast: ToastController,
    private loadingController: LoadingController,
    private alert: AlertController,
    private globalVar: GlobalVariables) {
  }

  ionViewDidLoad() {
    this.refreshUHEList();
  }

  refreshUHEList() {
    this.uhesDisponiveis = [];

    this.file.listDir(this.file.externalApplicationStorageDirectory, 'files')
      .then(fileList => {
        if (fileList.length == 0) {
          let t = this.toast.create({
            message: 'Não existem arquivos de Usinas para processamento, favor verificar.',
            position: 'bottom',
            showCloseButton: true
          });
          t.present();
        }
        else {
          this.globalVar.getCurrentUHE()
            .then(uhe => {
              this.fillUhesDisponiveis(fileList, uhe);
            })
            .catch(() => this.fillUhesDisponiveis(fileList, null));
        }
      })
      .catch(exp => {
        if (exp == "cordova_not_available") {
          this.globalVar.getCurrentUHE()
            .then(uhe => {
              var fileList: Array<{ name: string }>;
              fileList = [];
              fileList.push({ name: '01_UHE Jurumirim.json' });
              fileList.push({ name: '02_UHE Chavantes.json' });
              fileList.push({ name: '03_UHE Salto Grande.json' });
              fileList.push({ name: '07_UHE Taquarucu.json' });
              this.fillUhesDisponiveis(fileList, uhe);
            });
        } else {
          console.log('Erro ao validar arquivos', JSON.stringify(exp));
        }
      });
  }

  fillUhesDisponiveis(fileList: Array<any>, uhe: any) {
    var order = _.sortBy(fileList, [function (o) { return o.name; }]);
    _.chain(order)
      .map(o => {
        var uheName = o.name.substring(3, o.name.indexOf('.'));
        var uheSeq = o.name.substring(0, 2);
        var msg = '';
        if (uhe && uhe.seq == uheSeq) { msg = '*** Selecionada ***'; }
        this.uhesDisponiveis.push({ seq: uheSeq, name: uheName, fileName: o.name, message: msg })
        return;
      }).value();
  }

  uheSelected(event, uhe) {
    /* Apresenta loader para processar o JSON */
    let loader = this.loadingController.create({
      content: 'Processando dados da UHE...'
      //spinner: 'dots'
    });

    var newUhe = new UHEFile();
    newUhe.seq = uhe.seq;
    newUhe.name = uhe.name;
    newUhe.fileName = uhe.fileName;

    loader.present().then(() => {
      this.globalVar.setCurrentUHE(newUhe)
        .then(() => {
          let t = this.toast.create({
            message: uhe.name + ' Selecionada',
            duration: 2000,
            position: 'bottom'
          });
          t.present();

          this.refreshUHEList();
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
}
