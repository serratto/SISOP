import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectInstrumentoHomePage } from './select-instrumento-home';

@NgModule({
  declarations: [
    SelectInstrumentoHomePage,
  ],
  imports: [
    IonicPageModule.forChild(SelectInstrumentoHomePage),
  ],
})
export class SelectInstrumentoHomePageModule {}
