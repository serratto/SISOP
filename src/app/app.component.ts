import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Events } from 'ionic-angular';

import { HomePage, InstalacaoSelectPage, SelectInstrumentoHomePage } from '../pages/pages';

import { GlobalVariables, StorageManager, Constants } from '../shared/shared';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  consts: Constants;
  showInstrumento: boolean = false;
  rootPage: any = HomePage;

  pages: Array<{ title: string, message: string, component: any }>;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private globalVars: GlobalVariables,
    private storageManager: StorageManager,
    private events: Events) {
    this.initializeApp();
    this.consts = new Constants();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();

      this.storageManager.initializeKV()
        .then(ok => {
          this.refreshMenu();
          this.events.subscribe('uheselected:changed', () => this.refreshMenu());
        })
        .catch(err => console.log(err));

      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  refreshMenu() {
    /**/
    this.pages = [];
    this.globalVars.getCurrentUHE().then(data => {
      this.showInstrumento = false;
      /* Se tiver uma UHE Selecionada */
      if (data) {
        this.pages.push({ title: data.name, message: 'clique aqui para mudar', component: InstalacaoSelectPage });
        this.showInstrumento = true;
        /* Se já tiver uma uhe selecionada, define root como a pagina de instrumentos */
        this.rootPage = SelectInstrumentoHomePage;
      }
      else {
        this.pages.push({ title: 'Selecione uma instalação', message: '', component: InstalacaoSelectPage });
        this.showInstrumento = false;
      }

      if (this.showInstrumento) {
        this.pages.push({ title: 'Instrumentos', message: '', component: SelectInstrumentoHomePage });
      }
    });
  }

  closeFilesToSISOP() {
    this.storageManager.clearMobileData();
  }
}
