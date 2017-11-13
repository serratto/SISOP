import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectInstrumentoBarCodePage } from './select-instrumento-bar-code';

@NgModule({
  declarations: [
    SelectInstrumentoBarCodePage,
  ],
  imports: [
    IonicPageModule.forChild(SelectInstrumentoBarCodePage),
  ],
})
export class SelectInstrumentoBarCodePageModule {}
