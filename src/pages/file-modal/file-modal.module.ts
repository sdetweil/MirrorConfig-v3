import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FileModalPage } from './file-modal';

@NgModule({
  declarations: [
    FileModalPage,
  ],
  imports: [
    IonicPageModule.forChild(FileModalPage),
  ],
})
export class FileModalPageModule {}
