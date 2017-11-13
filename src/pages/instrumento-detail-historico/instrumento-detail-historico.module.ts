import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InstrumentoDetailHistoricoPage } from './instrumento-detail-historico';

@NgModule({
  declarations: [
    InstrumentoDetailHistoricoPage,
  ],
  imports: [
    IonicPageModule.forChild(InstrumentoDetailHistoricoPage),
  ],
})
export class InstrumentoDetailHistoricoPageModule {}
