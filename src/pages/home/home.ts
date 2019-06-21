
import { Component, ViewChild } from '@angular/core';
import { NavController , Platform , IonicPage} from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { ActionSheetController } from 'ionic-angular';
import { Slides } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { ModalController } from 'ionic-angular';
import * as Constants from '../../services/constants';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import {NgZone} from '@angular/core';

@IonicPage() 
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'

})

export class HomePage {
 
  @ViewChild(Slides) sliderComponent: Slides;
  d: any;
  viewers:any;
  datasources:any;
  images:any;
  tags:any;
  selectedRow: any;
  thisviewer: any
  saveobject:any;

	thisdatasource: any;
	thisimage: any;
	thistag:any;
	modaltype: any;
	modal: any;
	parentobject: any;
	
	  
  constructor(public navCtrl: NavController,
  							private  data: DataProvider,
  							public actionSheetCtrl: ActionSheetController,
  							public modalCtrl: ModalController,
  							private screenOrientation: ScreenOrientation,
  							//private device: Device,
  							private platform: Platform,
  							private storage: Storage,
  							private zone: NgZone
  							) {
  		
  		this.d=data;  		
			
  	  this.modal={};
    this.modaltype=null;
    this.selectedRow={};
    this.thisviewer={};
    this.saveobject={};
    this.parentobject=null;
    	this.thisdatasource={};
	  this.thisimage={};
	  this.thistag={};

		this.selectedRow['viewer'] = Constants.NOT_SELECTED;  // initialize our variable to null
		this.selectedRow['datasource'] = Constants.NOT_SELECTED;  // initialize our variable to null
		this.selectedRow['image'] = Constants.NOT_SELECTED;  // initialize our variable to null
		this.selectedRow['tag'] = Constants.NOT_SELECTED;  // initialize our variable to null
		//this.doRefresh(0);
  }
  focusChanged(type)
  {
  		console.log("focus changing="+type);
  }
  doRefresh(refresher){
  		var self=this;
  		if(refresher!==0){
			self.d.reloadData(true, 
				function(error)
				{
				 self.zone.run(() =>{
		   		 self.viewers=self.d.Viewers;
						self.datasources=self.d.DataSources;
						self.images=self.d.Images;
						self.tags=self.d.Tags;
  				 });
				 refresher.complete();
				}
			);
    }
  }
  menu(){
   let self=this;
   console.log("entered menu");
		self.storage.get("server_ip")
				.then(function(address)
				{
			 	 	let address_dialog=self.modalCtrl.create('AddressModalPage',{address:address!=null?address:''});
					console.log("dialog created");
					address_dialog.onDidDismiss(function(updatedObject) 
					{
			 		 		// Do things with data coming from modal, for instance :
			 		 	if(updatedObject != undefined)
			 		 	{
							 if(updatedObject.address!=undefined)
							 {
							 		console.log("the server address specified was "+updatedObject.address);
							 		self.storage.set("server_ip",updatedObject.address);
							 }
							 else
							 	if(updatedObject.action=='delete')
								 	self.storage.remove("server_ip");
					 	 }	 
					 	 else
					 	 {
					 	   console.log ("return from dialog, no data")
					 		 //reject("user canceled dialog, no data");
					 	 }
					})
					console.log("showing dialog");
					address_dialog.present();  				
  				});
  }
  ionViewDidLoad() 
  {
    console.log('ionViewDidLoad HomePage');
    // set to landscape
  		console.log("this device width=="+this.platform.width());
  		if(this.platform.width()<750 )
  		if(this.screenOrientation.type!=this.screenOrientation.ORIENTATIONS.LANDSCAPE)
  		{
      this.screenOrientation.lock(
    			this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    			//  slides.update()
		}
    this.zone.run(() =>{
	    this.viewers=this.d.Viewers;
			this.datasources=this.d.DataSources;
			this.images=this.d.Images;
			this.tags=this.d.Tags;
			});
  }

  next(){
  		this.sliderComponent.slideNext();
  }
  back(){
  		this.sliderComponent.slidePrev();
  }
   
  getselectedRow(type){
		//console.log("get selected returning "+this.selectedRow[type]+" type="+type);
		return this.selectedRow[type];
  }
  addeditClicked(type, index,page,action)
  {
		console.log(action+" button clicked on page "+page+" and row="+index);  
		if((type==2 && index==this.selectedRow[page]) || (type==1 && index!=this.selectedRow[page]) )
		{
	    console.log("add edit, row selected, uncheck");
		  this.setClickedRow(index,page,0);
		}
  		this.modaltype=action;
  		switch(page)
  		{
  			case 'viewer':
					{
						
						if(index != Constants.NOT_SELECTED)
						{		
							this.thisviewer=this.data.Viewers[index];
							
							this.thisviewer.isActive=this.data.Viewers[index].Active?"true":"false";

							this.saveobject[page]=JSON.parse(JSON.stringify(this.thisviewer));						
						}
						else
						{
							this.thisviewer=
									{Name:'foo',
									Description:'bar',
									Advance:10,
									Active:false,
									ImageRefreshRate:30,Tags:[]}; 
	
							this.saveobject[page]=null;			
						}
						this.parentobject=this.thisviewer;		
						this.modal[page]=this.modalCtrl.create('ViewerModalPage',{type:this.modaltype,object:this.thisviewer,parent:this.parentobject})				
					}
					break;
			case 'datasource':
					{
						if(index != Constants.NOT_SELECTED )
						{		
							this.thisdatasource=this.data.DataSources[index];			
							this.thisdatasource.isActive=this.data.DataSources[index].Active?"true":"false";				
					  		this.saveobject[page]=JSON.parse(JSON.stringify(this.thisdatasource));						
						}
						else
						{
							this.thisdatasource={
								Name:'sample',
								Description:' some source info',
								Active:false,
								Root:"/*",
								AuthInfo:{"OAuth":"","Userid":"","Password":""},
								Type:{"Type":"File"}};						
							this.saveobject[page]=null;			
						}
						this.parentobject=this.thisdatasource;
           	this.modal[page]=this.modalCtrl.create('DataSourceModalPage',{type:this.modaltype,object:this.thisdatasource,parent:this.parentobject}); 
					}
					break;			
			case 'image':
					{
						if(index != Constants.NOT_SELECTED)
						{		
							this.thisimage=this.data.Images[index];		
							this.saveobject[page]=JSON.parse(JSON.stringify(this.thisimage));																		
						}
						else
						{
							this.thisimage={
								Name:'',
								Description:'',
								DataSource:'',
								PathFromSource:"/*jpg",
								Tags:[]};//JSON.parse(JSON.stringify(this.images[0]));
								
							this.saveobject[page]=null;						
						}
						this.parentobject=this.thisimage;
					}
						this.modal[page]=this.modalCtrl.create('ImageModalPage',{type:this.modaltype,object:this.thisimage,parent:this.parentobject});
					break;
			case 'tag':
					{
						if(index != Constants.NOT_SELECTED)
						{		
							this.thistag=JSON.parse(JSON.stringify(this.data.Tags[index]));
							this.saveobject[page]=JSON.parse(JSON.stringify(this.thistag));													
						}
						else
						{
							this.thistag={
								value:'sample_tag_name',
								Description:'sample tag description'}; 

							this.saveobject[page]=null;
						}
						this.parentobject=this.thistag;
							this.modal[page]=this.modalCtrl.create('TagModalPage',{type:this.modaltype,object:this.thistag,parent:this.parentobject});
					}
					break					
					
  		}
  		console.log("would open dialog ="+page);
  		// setup the dialog close handler
  		this.modal[page].onDidDismiss(function(updatedObject) {
   		 // Do things with data coming from modal, for instance :
   		 if(updatedObject != undefined)
   		 {
	   		 console.log("return from dialog type="+updatedObject.type+" data="+JSON.stringify(updatedObject.data));
				 console.log("sometimes files returned="+updatedObject.files);
				 if(updatedObject.files!=undefined)
				 {
				 		console.log("there are "+updatedObject.files.length+" file to process for selections")
				 		;
				 }
	   		 this.d.saveModal(this.action, this.page, updatedObject, updatedObject.files);
	   	 }	 
	   	 else
	   	   console.log ("return from dialog, no data")
			}.bind({d:this.d,action:action, page:page}));
  		this.modal[page].present();
  
  }
  setClickedRow(index,type,column)
  {    //function that sets the value of selectedRow to current index
			var i = this.selectedRow[type];
			console.log("clicked row="+type+" column="+column+" index="+index);
			switch(i)
			{	
				// click on row already selected
				case index:
					// deselect
					console.log("row "+type+" was previously selected");
					i=Constants.NOT_SELECTED;
					break;
				// not selected		
				default:
					// make selected
					i=index;
					console.log("row "+type+" was NOT previously selected");
			}
			this.zone.run(() =>{
		 	 this.selectedRow[type] = i;
		  })
  }
	deleterow(index,type)
	{
			console.log("delete pressed, row="+index+" for type="+type);
			var object=null;
			switch(type)
			{
				case 'viewer':
					object=this.data.Viewers[index];
					if(object.Active==true)
					{
						alert("this Viewer is active");
						return;
					}
					break;
				case 'datasource':
					object=this.data.DataSources[index];
					// check for images using this source
					for(let i=0;i<this.images.length; i++)
					{
						if(this.data.Images[i].DataSource=== object._id)
						{
							alert("this DataSource is being used by Image "+ this.data.Images[i].Name);
							return;
						}
					}
					if(object.Active==true)
					{
						alert("this DataSource is active");
						return;
					}
					break;
				case 'image':
					object=this.data.Images[index];
					break;					
				case 'tag':
					object=this.data.Tags[index];
					object.Name=object.value;
					// check for images using this tag
					for(var i=0;i<this.data.Images.length;i++)
					{
						for(let j=0;j<this.data.Images[i].Tags.length;j++)
						{
							if(this.data.Images[i].Tags[j]=== object._id)
							{
								alert("this Tag is being used by Image "+this.data.Images[i].Name);
								return;
							}
						}
					}			
					// check for viewers using this tag
					for(let i=0;i<this.data.Viewers.length;i++)
					{
						for(let j=0;j<this.data.Viewers[i].Tags.length;j++)
						{
							if(this.data.Viewers[i].Tags[j]=== object._id)
							{
								alert("this Tag is being used by Viewer "+ this.data.Viewers[i].Name);
								return;
							}
						}
					}								
					break;																								
			}
			this.confirmDelete(type,object);

	}
	confirmDelete(type,object) 
	{
	  console.log("in confirm delete");
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Delete '+type+ "?",
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            console.log('Destructive clicked');
            this.data.dodelete(object,type)
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }
	tagfromID(id)
  {
    var r="";
    	//console.log("in data looking for tag="+id);
  		for(var i=0;i<this.data.Tags.length;i++)
  		{
  			if(this.data.Tags[i]._id===id)
  			{
  				r=this.data.Tags[i].value;
  				break;
  			}
  		}
  		return r;
  }
  datasourcefromID(id)
  {
    var r="";
  		for(let i=0;i<this.data.DataSources.length;i++)
  		{
  			if(this.data.DataSources[i]._id===id)
  			{
  				r=this.data.DataSources[i].Name;
  				break;
  			}
  		}
  		return r;
  }
  openModal(type) 
  {    
    this.modal[type].present();
  };
  
  tagNamefromId(id)
  {
    var r="";
  		for(let t=0;t<this.tags.length;t++)
  		{
  			if(this.tags[t]._id==id)
  			{
  			  r=this.tags.value;
  			  break;
  			}
  		}
  		return r;
  }
}

