import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { File } from '@ionic-native/file'
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Device } from '@ionic-native/device';


/* Páginas */
import {
  HomePage,
  InstalacaoSelectPage, SelectInstrumentoHomePage,
  SelectInstrumentoBarCodePage, SelectInstrumentoTypingPage,
  SelectInstrumentoSearchPage,
  InstrumentoDetailHomePage, InstrumentoDetailDetailPage,
  InstrumentoDetailLeituraPage, InstrumentoDetailHistoricoPage,
  InstrumentoDetailHistoricoDetailPage
} from '../pages/pages';

/* Global Vars module */
import { SISOPGlobals, SISOPEnvironment } from '../shared/shared';
/* Storage manager and modules */
import { StorageManager, StorageSql, StorageWeb } from '../shared/shared';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    InstalacaoSelectPage,
    SelectInstrumentoHomePage,
    SelectInstrumentoBarCodePage,
    SelectInstrumentoTypingPage,
    SelectInstrumentoSearchPage,
    InstrumentoDetailHomePage, InstrumentoDetailDetailPage,
    InstrumentoDetailLeituraPage, InstrumentoDetailHistoricoPage,
    InstrumentoDetailHistoricoDetailPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    InstalacaoSelectPage,
    SelectInstrumentoHomePage,
    SelectInstrumentoBarCodePage,
    SelectInstrumentoTypingPage,
    SelectInstrumentoSearchPage,
    InstrumentoDetailHomePage, InstrumentoDetailDetailPage,
    InstrumentoDetailLeituraPage, InstrumentoDetailHistoricoPage,
    InstrumentoDetailHistoricoDetailPage
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
