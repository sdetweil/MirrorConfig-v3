import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { ViewController } from 'ionic-angular';
import {NgZone} from '@angular/core';
import { LoadingController } from 'ionic-angular';
/**
 * Generated class for the FileModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-file-modal',
  templateUrl: 'file-modal.html'
 
})
export class FileModalPage {
  d: any;
  modaltype:any;
  files: any;

  thisobject: any;
  selectedRow: any;
  parentpath: any;
  parentobject: any;
  parentsource:any;
  dialog_title:any;
  constructor(public navCtrl: NavController, 
  										public navParams: NavParams, 
  										private data: DataProvider,
  										public viewCtrl: ViewController,
  										private zone: NgZone,
  										public loading: LoadingController) {
    this.d=data;
    console.log("in file modal");
    this.modaltype=navParams.get("type");  // add or edit
    this.thisobject=navParams.get("object");
    this.dialog_title=navParams.get("dialog_title");
    this.parentpath='';
    this.parentobject=null;
    this.parentsource=null;   
    this.selectedRow={};
    this.selectedRow = {};  // initialize our variable to null
   	this.selectedRow.tag = null;  // initialize our variable to null
   	this.files=[];


    }
  ionViewDidLoad() {
    console.log('ionViewDidLoad FileModalPage');
				var self= this;
				var loadmsg=self.loading.create({
    				content: 'updating file list...',
     			});
			 	loadmsg.present()
			 		.then(function() {
						self.initFileList(self.thisobject,null)
							.then(
								function(){
									loadmsg.dismiss();
									//self.parentpath=workpath;
								},
								function(foo){ 
									console.log("error="+foo);
									loadmsg.dismiss();
								}
							)
							.catch(function(err){
								console.log("catch error from get files="+err);
								loadmsg.dismiss();
							});
						},
						function(f){ console.log("f="+f);}
					)
					.catch(function(err){
						console.log("loading error!="+err);
						loadmsg.dismiss();
						}
					);
  }
  doubleClick(index,item)
  {
  		console.log("double click new");
  		// double click only matters for folder entries
  		if(this.files[index].filetype=='Folder')
  		{
			var workpath=this.parentpath;
			// if the current path doesn't contain a slash, add one
			if(!workpath.includes('/'))
			  workpath='/'+this.parentpath;
			console.log("updated workpath="+workpath);  
			// get the path parts  
			var pathparts=workpath.split('/');  
			console.log("pathparts has="+pathparts.length+ " elements after split");
			// if the last element of the array does NOT contain a wildcard char,
			if(!pathparts[pathparts.length-1].includes('*'))
			  // add one
			  pathparts.push("*")
			// if we are backing up a directory level
			if(this.files[index].name=="..")
			{
				console.log("backing up, removing '"+pathparts[pathparts.length-2]+"'");
				// if we have two entries in the path or more
				// shouldn't have .. if not, but be safe
			  if(pathparts.length>=2)
				  // remove the next to the last entry, 0 based
					pathparts.splice(pathparts.length-2,1)
			}
			else
			{
					console.log("moving down, adding '"+this.files[index].name+"'");
					// add an entry after next to last, 0 based
					//if(this.files[index].id!==undefined)
					//	pathparts.splice(	pathparts.length-1,0,this.files[index].id)
					//else
						pathparts.splice(	pathparts.length-1,0,this.files[index].name)
			}
			// put the string back together
			workpath=pathparts.join('/');
			if(workpath.startsWith('//'))
				workpath=workpath.substring(1);
			// if the new path doesn't start with slash
			if(!workpath.startsWith('/'))
			  // add one
			  workpath='/'+workpath;
			console.log("new path="+workpath);
			// if the new path is different
			if(workpath!==this.parentpath)
			{
				var self= this;
				var loadmsg=self.loading.create({
    				content: 'updating file list...',
     			});
			 	loadmsg.present()
			 		.then(function() {
						self.initFileList(self.parentobject,workpath)
							.then(
								function(){
									loadmsg.dismiss();
									self.parentpath=workpath;
								},
								function(foo){ 
									console.log("error="+foo);
									loadmsg.dismiss();
								}
							)
							.catch(function(err){
								console.log("catch error from get files="+err);
								loadmsg.dismiss();
							});
						},
						function(f){ console.log("f="+f);}
					)
					.catch(function(err){
						console.log("loading error!="+err);
						loadmsg.dismiss();
						}
					); 			  
			}
  		}
  }
 
  	closeModal() {
		this.viewCtrl.dismiss();
	}
	saveModal()
	{
		this.viewCtrl.dismiss({type:this.modaltype,data:this.thisobject,path:this.parentpath,files:this.files}/* some data, thisdatasource has been updated*/);
	}
	  setClickedRow(index,type,column){      //function that sets the value of selectedRow to current index
			var i=this.files[index].selected;
			//console.log("clicked row="+type+" column="+column+" index="+index);
			if(this.files[index].filetype!='Folder')
			{
				switch(i)
				{	
					// click on row already selected
					case true:
						// deselect
						i=false;
						break;
					// not selected		
					default:
						// make selected
						i=true;
				
				}
				this.files[index].selected=i;
			}
  }
initFileList(object, newpath)
{
    var self=this;
    let promise = new Promise(function(resolve, reject){
    console.log("in init filelist");

		var foldersOnly=false;
		var path='';
		var urlstring='';
		if(object.hasOwnProperty('PathFromSource'))
			{
				if(newpath==null)
				{
					// is an image entry
					path=self.parentpath=object.PathFromSource;	
					if(!path.includes('*') && !path.endsWith('/') && !path.endsWith('/*'))
					  path+='/*';					
			  	}
			  	else {
			  		if(newpath=='')
			  		  newpath='/*';
			  	  path=self.parentpath=newpath;
			  	}  
			  	if(path=='/')
			  	  path='/*';
        self.parentobject=object;
				console.log("Image selected="+object.Name);	
				if(object.DataSource !=="")
				{
				  console.log("find datasource object with this id="+object.DataSource);
				  console.log("there are "+self.d.DataSources.length+" datasource entries");
				  var dsIndex=-1;
				  for(var ds of self.d.DataSources)
				  {
				  //console.log("ds entry="+JSON.stringify(ds));
				  	  console.log("checking datasource="+ds.Name+" for id="+object.DataSource+" with"+ds._id);
				  	  dsIndex++;
				  		if(ds._id==object.DataSource)
				  		{
				  		  console.log("found entry"); 
				  			break;
				  		}
				  }
					self.parentsource=self.d.DataSources[dsIndex];
					console.log("parent source="+self.parentsource.Name);
					//var p='';
					if(self.parentsource.Type.Type=='File')
					{
					if(path.substring(path.lastIndexOf('/')).includes('*'))
						path=path.substring(0,path.lastIndexOf('/'))+'{/*,'+path.substring(path.lastIndexOf('/'))+'}';
					}
					urlstring="SourceId="+object.DataSource+"&FoldersOnly="+foldersOnly+"&path="+path;
					console.log("urlstring="+urlstring);
					
				}
			}
			else if(object.hasOwnProperty('Root'))
			{

				// is a datasource entry
				
        self.parentobject=object;
        self.parentsource=object;
				console.log("DataSource selected="+object.Name);
				foldersOnly=true;  
				console.log("set foldersOnly="+foldersOnly);	
				if(newpath==null)
				{
					self.parentpath=object.Root;
					console.log("set parent");
					path=object.Root=="/*"?"":object.Root;		 
					console.log("set path"); 			
				}
				else
				{
					self.parentpath=newpath;
					console.log("set parent");
					path=self.parentpath=="/*"?"":self.parentpath;		 
					console.log("set path");
				}
				urlstring="FoldersOnly="+foldersOnly+"&path="+path+(path.endsWith('/*')?'':"/*");
				console.log("url set, checking authinfo");
				if(object.hasOwnProperty('Authinfo') && object.Authinfo.OAuthid.length>0)
				{
					urlstring=urlstring+"&SourceId="+object._id;
        }
        else 
        {
          urlstring=urlstring+"&SourceType="+object.Type.Type;
        }
        console.log("done with Authinfo");
      }
			else
			{
					// is a file entry
					if(self.parentobject.hasOwnProperty('Root') &&
							(self.parentobject.Type.Type=='GoogleDrive')
						)
					{
						path=self.fixupPath(object.id);
					}
					else
					{
						path=self.fixupPath(object.name);
					}
					//path=self.fixupPath(object.name);				
					//  check the parent object..
					
					// if a datasource, then use sourcetype=
					if(self.parentobject.hasOwnProperty('Root'))
					{
						if(self.parentobject.hasOwnProperty('Authinfo') && self.parentobject.Authinfo.OAuthid.length>0)
						{
							urlstring="SourceId="+self.parentobject._id;
		        }
						else 
						{
							urlstring="SourceType="+self.parentobject.Type.Type;
		        }
						foldersOnly=true;
					}	
					// if an image use sourceid=
					else {
					    urlstring="SourceId="+self.parentsource._id;
					}    
					// add on the fixed part of the url string
					urlstring = urlstring+"&FoldersOnly="+foldersOnly+"&path="+path+"/*";									
			}
			console.log("urlstring="+urlstring);
			self.zone.run(() =>{			
     	 self.files=[];
      });
			self.data.getFiles(urlstring)
				.then(function(f)
					{
						self.files=f;
						console.log("file callback returned "+self.files.length+" file entries");	
						// if this is an image object
						if(self.parentobject.hasOwnProperty('PathFromSource'))
						{
							console.log("searching thru files");
							for(var file of self.files)
							{
								//console.log("file entry="+file.name+" type="+file.filetype+" data = "+JSON.stringify(file)+" parent path="+self.parentobject.PathFromSource);
								if(self.parentobject.PathFromSource.includes('*') || !self.parentobject.PathFromSource.endsWith('/'))
								{
									self.d.Images.forEach(
										function(Image)
										{
											//console.log("comparing \'"+Image.PathFromSource+"\' with \'"+file.name+"\'");
											if(Image.PathFromSource.endsWith(file.name) && file.filetype=='File')
											{
												file.selected=true;
												console.log("\t\tmatched");
											}
										}
									);
								}
								else
								{
									if(self.parentobject.PathFromSource.endsWith(file.name))
									{
											file.selected=true;
											//console.log("\t\tmatched exact");
									}
								}
							}; 
						}
						console.log("almost done path="+path);
						if(path+'/*' !== '/*' && path !== '/*')
						{
							//console.log("insert ..files="+self.files);
							//var foo={"selected":false,"filetype":"Folder","name":".."};
							self.files.splice(0,0,{"selected":false,"filetype":"Folder","name":".."});
							console.log("done with ..");
				    }                                    
				    console.log("file callback after insert has "+self.files.length+" file entries");		
				    resolve();
					},				
					function(errormsg) 
					{
						 console.log("files http error ="+errormsg);
						 reject("files http error ="+errormsg);
					}
				).catch(function(error)
					{
				   console.log("getfiles error="+error);
				   reject(error);
					});
		});
		
  		return promise;				
  }
  fixupPath(newpart)
  {
		  var path1=''
			// is a file entry
			path1=this.parentpath
		  if (newpart == "..")
          // remove the leaf most folder name
          path1 = path1.substring(0, path1.lastIndexOf("/"));
      else
          // go forward 
          path1 += "/" + newpart;
      if(path1.startsWith("/*/"))
      	path1=path1.substring(2);
      this.parentpath=path1.length>0?path1:"";
    return path1
  }
}
