import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InstrumentoDetailHomePage } from './instrumento-detail-home';

@NgModule({
  declarations: [
    InstrumentoDetailHomePage,
  ],
  imports: [
    IonicPageModule.forChild(InstrumentoDetailHomePage),
  ],
})
export class InstrumentoDetailHomePageModule {}
