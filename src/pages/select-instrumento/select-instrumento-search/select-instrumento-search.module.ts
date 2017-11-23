import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectInstrumentoSearchPage } from './select-instrumento-search';

@NgModule({
  declarations: [
    SelectInstrumentoSearchPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectInstrumentoSearchPage),
  ],
})
export class SelectInstrumentoSearchPageModule {}
