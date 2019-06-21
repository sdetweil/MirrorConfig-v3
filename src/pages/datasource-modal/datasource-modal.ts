import { Component } from '@angular/core';
import {  IonicPage,NavController, NavParams } from 'ionic-angular';

import { ViewController , ModalController} from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import {NgZone} from '@angular/core';

/**
 * Generated class for the DataSourceModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-data-source-modal',
  templateUrl: 'datasource-modal.html'
  
})
export class DataSourceModalPage {
  thisdatasource: any;
  modaltype: any;
  parentobject:any;
  saveobject: any;
  modal: any;

  constructor(public navCtrl: NavController, 
  						  public navParams: NavParams,
  						  private data: DataProvider,
  						  public viewCtrl: ViewController,
  						  public modalCtrl: ModalController,
  						  private zone: NgZone) {

    this.modaltype=navParams.get("type");
    this.thisdatasource=navParams.get("object");
    this.parentobject=navParams.get("parent");
    this.saveobject={};
    this.modal={};

    }

	closeModal() {
		this.viewCtrl.dismiss();
	}
	saveModal()
	{
		this.viewCtrl.dismiss({type:'datasource',data:this.thisdatasource}/* some data, thisdatasource has been updated*/);
	}
  ionViewDidLoad() {
    console.log('ionViewDidLoad DatasouceModalPage');
  }
  checkSelectedSource(tag1, tag2){
  	return tag1==tag2;
  }
  doubleClick(object, opendialog){
  			console.log("in datasource doubleclick");

			if(opendialog)
			{
				this.saveobject['file']=null;
				var modal=this.modalCtrl.create('FileModalPage',{type:this.modaltype,object:object,dialog_title:"Datasource: select folder"});
				console.log("file modal created");
				modal.onDidDismiss(updatedObject => 
				  {
			 		 // Do things with data coming from modal, for instance :
			 		 if(updatedObject != undefined)
			 		 {
				 		 console.log("return from dialog type="+updatedObject.type+" data="+JSON.stringify(updatedObject.data)+" path="+updatedObject.path);
				 		 //if(object.Root!=updatedObject.path)
				 		 //{
				 		 		if(updatedObject.path.endsWith('*'))
				 		 		   updatedObject.path=updatedObject.path.substring(0,updatedObject.path.length-1);
				 		 		updatedObject.data.Root=updatedObject.path;
				 		 		var self=this;
				 		 		this.zone.run(() =>{
				 		 		  self.thisdatasource=updatedObject.data;
				 		 		})
				 		 //}
				 	 }
				 	 else
				 	   console.log ("return from dialog, no data")
					}
				);
				console.log("file modal opening");
				modal.present();	
				console.log("file modal open");
			}				
  }

}
