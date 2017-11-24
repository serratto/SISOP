import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { File } from '@ionic-native/file'
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Device } from '@ionic-native/device';

/* Módulo de máscara */
import { CurrencyMaskModule } from "ng2-currency-mask";

/* Páginas -- Home */
import { HomePage, InstalacaoSelectPage } from '../pages/pages';

/* Páginas -- Select Instrumento */
import {
  SelectInstrumentoHomePage, SelectInstrumentoBarCodePage,
  SelectInstrumentoTypingPage, SelectInstrumentoSearchPage
} from '../pages/pages';

/* Páginas -- Leitura */
import {
  LeituraHomePage, LeituraLeituraPage, LeituraLeituraMultipontoPage,
  LeituraCampanhaPage, LeituraUltimas12Page, LeituraUltimas12DetalhePage,
  LeituraInstrumentoPage, LeituraLeituraErroPage
} from '../pages/pages';
/* transition */
import {
  InstrumentoDetailHomePage, InstrumentoDetailDetailPage,
  InstrumentoDetailHistoricoPage,
  InstrumentoDetailHistoricoDetailPage,
  InstrumentoDetailLeituraLeituraPage,
  InstrumentoDetailLeituraErroPage,
  InstrumentoDetailLeituraCampanhaPage
} from '../pages/pages';

/* Global Vars module */
import { SISOPGlobals, SISOPEnvironment } from '../shared/shared';
/* Storage manager and modules */
import { StorageManager, StorageSql, StorageWeb } from '../shared/shared';

@NgModule({
  declarations: [
    MyApp,
    /* Páginas -- Home */
    HomePage,
    InstalacaoSelectPage,
    /* Páginas -- Select Instrumento */
    SelectInstrumentoHomePage, SelectInstrumentoBarCodePage,
    SelectInstrumentoTypingPage, SelectInstrumentoSearchPage,
    /* Páginas -- Leitura */
    LeituraHomePage,
    LeituraLeituraPage, LeituraLeituraMultipontoPage,
    LeituraCampanhaPage,
    LeituraUltimas12Page, LeituraUltimas12DetalhePage,
    LeituraInstrumentoPage, LeituraLeituraErroPage,

    /* transition */
    InstrumentoDetailHomePage, InstrumentoDetailDetailPage,
    InstrumentoDetailHistoricoPage,
    InstrumentoDetailHistoricoDetailPage,
    InstrumentoDetailLeituraLeituraPage,
    InstrumentoDetailLeituraErroPage,
    InstrumentoDetailLeituraCampanhaPage
  ],
  imports: [
    BrowserModule,
    CurrencyMaskModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    /* Páginas -- Home */
    HomePage,
    InstalacaoSelectPage,
    /* Páginas -- Select Instrumento */
    SelectInstrumentoHomePage, SelectInstrumentoBarCodePage,
    SelectInstrumentoTypingPage, SelectInstrumentoSearchPage,
    /* Páginas -- Leitura */
    LeituraHomePage,
    LeituraLeituraPage, LeituraLeituraMultipontoPage,
    LeituraCampanhaPage,
    LeituraUltimas12Page, LeituraUltimas12DetalhePage,
    LeituraInstrumentoPage, LeituraLeituraErroPage,
    /* transition */
    InstrumentoDetailHomePage, InstrumentoDetailDetailPage,
    InstrumentoDetailHistoricoPage,
    InstrumentoDetailHistoricoDetailPage,
    InstrumentoDetailLeituraLeituraPage,
    InstrumentoDetailLeituraErroPage,
    InstrumentoDetailLeituraCampanhaPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    File,
    BarcodeScanner,
    SISOPGlobals, SISOPEnvironment,
    StorageManager,
    StorageSql,
    StorageWeb,
    Storage, Device,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
