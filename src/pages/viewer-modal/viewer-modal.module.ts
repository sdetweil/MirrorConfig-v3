import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewerModalPage } from './viewer-modal';

@NgModule({
  declarations: [
    ViewerModalPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewerModalPage),
  ],
})
export class ViewerModalPageModule {}
