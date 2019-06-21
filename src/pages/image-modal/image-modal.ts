import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { ViewController , ModalController} from 'ionic-angular';
import {NgZone} from '@angular/core';

/**
 * Generated class for the ImageModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-image-modal',
  templateUrl: 'image-modal.html'  
 
})
export class ImageModalPage {
  thisimage: any;
  modaltype: any;
  modal: any;
  file:any;
  selectorFiles:any;

  constructor(public navCtrl: NavController, 
  						 public navParams: NavParams,
  						 private data: DataProvider,
  						 public viewCtrl: ViewController,
  						 public modalCtrl: ModalController,
  						 private zone: NgZone) {
    this.modaltype=navParams.get("type");
    this.thisimage=navParams.get("object");   
    this.selectorFiles=[];
    }

	closeModal() {
		this.viewCtrl.dismiss();
	}
	saveModal()
	{
		this.viewCtrl.dismiss({type:'image',data:this.thisimage,files:this.selectorFiles}/* some data, thisdatasource has been updated*/);
	}
  ionViewDidLoad() {
    console.log('ionViewDidLoad ImageModalPage');
  }
    checkSelectedTag(tag1, tag2){
  	return tag1==tag2;
  }
    checkSelectedSource(source1, source2){
  	return source1==source2;
  }
  f(){
  	if(this.thisimage.DataSource!='')
  	   this.thisimage.PathFromSource="/*";
  }
  doubleClick(object, opendialog){
  			//this.thisimage=object;
      if(this.thisimage.PathFromSource!="" && this.thisimage.DataSource!="")
      {
		    var modal=this.modalCtrl.create('FileModalPage',{type:'file',object:object,dialog_title:"Image: select files or folder"})
		    modal.onDidDismiss(updatedObject => 
				  {
			 		 // Do things with data coming from modal, for instance :
			 		 if(updatedObject != undefined){
				 		 console.log("return from dialog type="+updatedObject.type+" data="+JSON.stringify(updatedObject.data));

				 		 console.log("return from dialog type="+updatedObject.type+" data="+JSON.stringify(updatedObject.data)+" path="+updatedObject.path);
				 		 console.log("there are "+updatedObject.files.length+" file entries to process");
				 		 this.selectorFiles=updatedObject.files;
				 		 console.log("after save filelist");
				 		 if(object.PathFromSource!=updatedObject.path)
				 		 {
				 		 		updatedObject.data.PathFromSource=updatedObject.path;
				 		 }				 		 		
				 		 console.log("after update");
				 		 var self=this;
		 		 		 this.zone.run(() =>{
		 		 		   console.log("before in run");
		 		 		   self.thisimage=updatedObject.data;
		 		 		   console.log("after in run");
		 		 		 })				 		 	
		 		 		 console.log("after run");
				 	 }
				 	  else
				 	   console.log ("return from dialog, no data")
					}
				);
				modal.present();
			}
			else
			{
			  alert("you must select a Datasource");				
			}
  }
}
