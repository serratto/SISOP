import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InstalacaoSelectPage } from './instalacao-select';

@NgModule({
  declarations: [
    InstalacaoSelectPage,
  ],
  imports: [
    IonicPageModule.forChild(InstalacaoSelectPage),
  ],
})
export class InstalacaoSelectPageModule {}
