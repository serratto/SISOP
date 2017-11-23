import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LeituraHomePage } from './leitura-home';

@NgModule({
  declarations: [
    LeituraHomePage,
  ],
  imports: [
    IonicPageModule.forChild(LeituraHomePage),
  ],
})
export class LeituraHomePageModule {}
