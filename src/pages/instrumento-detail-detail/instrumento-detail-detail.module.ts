import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InstrumentoDetailDetailPage } from './instrumento-detail-detail';

@NgModule({
  declarations: [
    InstrumentoDetailDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(InstrumentoDetailDetailPage),
  ],
})
export class InstrumentoDetailDetailPageModule {}
