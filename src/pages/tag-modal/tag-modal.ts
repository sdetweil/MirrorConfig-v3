import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { ViewController } from 'ionic-angular';

/**
 * Generated class for the TagModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tag-modal',
  templateUrl: 'tag-modal.html'
  
})
export class TagModalPage {
  //d: any;
  thistag: any;
  modaltype: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, private data: DataProvider,public viewCtrl: ViewController) {
    //this.d=data;
    this.modaltype=navParams.get("type");
    this.thistag=navParams.get("object");
    }

	closeModal() {
		this.viewCtrl.dismiss();
	}
	saveModal()
	{
		this.viewCtrl.dismiss({type:'tag',data:this.thistag}/* some data, thistag has been updated*/);
	}
  ionViewDidLoad() {
    console.log('ionViewDidLoad TagModalPage');
  }
 
}
