import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TagModalPage } from './tag-modal';

@NgModule({
  declarations: [
    TagModalPage,
  ],
  imports: [
    IonicPageModule.forChild(TagModalPage),
  ],
})
export class TagModalPageModule {}
