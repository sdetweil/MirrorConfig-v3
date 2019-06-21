import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DataSourceModalPage } from './datasource-modal';

@NgModule({
  declarations: [
    DataSourceModalPage,
  ],
  imports: [
    IonicPageModule.forChild(DataSourceModalPage),
  ],
})
export class DataSourceModalPageModule {}
