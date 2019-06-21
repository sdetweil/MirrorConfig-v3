import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';

/*
  Generated class for the DataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DataProvider {
  public Viewers: any ;
	public Tags: any ;
	public Images: any;
	public DataSources: any;
	public DataSourceTypes:any;
  
  public ourserveraddress: any;
  thisviewer: any;
  thisdatasource: any;
  thisimage: any;
  thistag: any;
  files: any;
  parentobject: any;
  parentpath: any;
  modaltype: any;
  http: any;
	
  constructor(public Http: HTTP	) 
  	{
    console.log('Hello DataProvider Provider');
    this.DataSourceTypes=[];
		this.DataSourceTypes.push("File");
		this.DataSourceTypes.push("Samba");
		this.DataSourceTypes.push("DropBox");
		this.DataSourceTypes.push("GoogleDrive");
		this.DataSourceTypes.push("Onedrive");
		this.http=Http;
  }

  saveModal(operation, type, obj,files) 
  { 
		this.modaltype=operation;
		var object=obj;   
		//alert("save");
		var urlstring="http://"+this.ourserveraddress+"/"+type+'s';
		console.log("in data savemodal, type="+type+" operation="+operation);
		switch(type)
		{
			case 'viewer':
				object=obj.data;
				delete object.TagNames
				break;
			case 'datasource':
				object=obj.data;
				break;
			case 'tag':
				object=obj.data;
				break;					
			case 'image':
				object=obj.data;
				delete object.TagNames	
				delete object.DataSourceName;	

				console.log("there are "+files.length+" entries in file list + for image="+ JSON.stringify(object));
				var results = this.getAddsandDeletes(object,files)
				if(object.hasOwnProperty("PathFromSource"))
				{

					urlstring="http://"+this.ourserveraddress+"/images";
					console.log("setting new path for image");
					if(results.value!=="")
						object.PathFromSource=results.value;
						
					if(operation ==='edit')
					{
						var self=this;
						// now handle and object add/deletes
						results.addedImages.forEach(
							function(ia)
							{
								//alert("adding image entry="+ia.Name);
								console.log("will add a record="+ia.Name);
								self.add_update_delete('add', urlstring, ia,'image',false);                             
							}
						)
						results.deletedImages.forEach(
							function(ia)
							{
								//alert("removing image entry="+ia.Name);
								console.log("will delete a record="+ia.Name);
								self.add_update_delete('delete', urlstring, ia,'image',false);  
							}
						)		
				  }		
				  break;
				}
				else
				{
					object.Root=results.value;
				}	       	
				return;
			default:
				console.log('unexpected type='+type+' in save modal dialog');
				break;
		}  	
		console.log("will "+operation+" a record="+obj.data.Name);
		this.add_update_delete( operation, urlstring, obj.data,type,true);
  };
  add_update_delete( action, urlstring, object,type,refresh)
  {
  var self=this;
  	var jobject=JSON.parse(JSON.stringify(object));
		delete jobject["$$hashKey"];
		let jsonstring= JSON.stringify(jobject);
    let headers = {
            'Content-Type': 'application/json'
        };
    console.log("would "+action+" url="+urlstring+" data="+jsonstring);
    //return;
		switch(action)
		{  		
			// add a new record	  	
			case 'add':  		  		
				console.log("add object url="+urlstring+"\njson-data="+jsonstring);
				this.http.setDataSerializer('json');
				this.http.post(urlstring,jobject,headers)
				  .then((response)=>
						{
						console.log("add completed");
							self.updateadd_success(response,object,type,refresh)
						}
					)
					.catch((err)=>{console.log("http post error="+JSON.stringify(err))});
				break;
				
			// update existing record
			case 'edit':  	  			  			
				console.log("update object url="+urlstring+"?id="+object._id+"\njson-data="+jsonstring);
				this.http.setDataSerializer('json');
				this.http.put(urlstring+"?id="+object._id,jobject,headers)
					.then(response =>
						{
							self.updateadd_success(response,object,type,refresh);
						}
					).catch((err)=>{console.log("http put error="+JSON.stringify(err))});
				break;	  
					
			// delete existing record
			default:  	  			
				console.log("deleting object url="+urlstring+"?id="+object._id);
				this.http.delete(urlstring+"?id="+object._id,{},{})
					.then(response =>
						{
							self.updateadd_success(response,object,type,refresh)
						}
					);
				break; 
		}
  } 

  getAddsandDeletes(v, Files)
  {
 		var result={value:"",addedImages:[] , deletedImages:[] };

	  	console.log("calculating adds and deletes");
    var counter = 0;
		var newname = v.PathFromSource;		
		console.log("a ="+newname);
    while(newname.includes("*"))
        newname = newname.substring(0, newname.lastIndexOf("*")); 
    
    console.log("b ="+newname); 
    result.value=newname;    
    // v points to current row in the images database list
    // loop thru all the individual files from the file selection list   
    console.log("there are "+ Files.length+" entries to process");
    for(var row of Files) 
    {
    	  //var row=Files[i];    	  
        // if the user selected a folder to be used for this image object
        if (row.selected == true && row.filetype == 'Folder' && row.name!=='..')
        {
        		result.value=row.name;
        		console.log("folder for datasource");
        		break;
        } 
        // if this is a FILE
        else if(row.filetype == 'File') 
        {
         console.log("have a file entry "+row.name);
            var add = true;
            for(var IMAGE of this.Images)
            {
            		//var IMAGE= this.Images[q];
            		//console.log("checking if "+IMAGE.PathFromSource+" matches "+row.name);
                if(IMAGE.PathFromSource.endsWith(row.name))
                {
                    // this file was in the list, so don't add
                    add = false;
                    // this image was in the list before
                    // but not currently selected
                   // console.log("have a file entry "+row.name+" selected="+JSON.stringify(row));
                    if (!row.selected)
                    {
                        result.deletedImages.push(IMAGE);
                        console.log("requesting delete for image="+IMAGE.Name);
                        break;
                    }
                }
            }; 
            // if this file list file was NOT in the image list already
            if (add)
            {
               // AND this row IS selected
                if (row.selected)
                {
                		//console.log("add checking row="+row.name);
                     // save it to be added
                    var io = {Name:"",PathFromSource:"",DataSource:"",Tags:"",Description:""}
                    // make sure we don't have generated name collisions                    
                    nameloop: while(true)
                    {
                        io.Name = v.Name + (++counter);
                        for(var ki of this.Images)
                        {
                        	if(ki.Name == io.Name)
                        		continue nameloop;
                        }
									      break;
                    } 
                    
                    //console.log("file row="+JSON.stringify(row));
                    
                    io.PathFromSource = newname + row.name;
                    io.DataSource = v.DataSource;
                    io.Tags = v.Tags;
                    io.Description=v.Descripion;
                    console.log("requesting add for image="+io.Name+" for selection="+v.Name);
                    result.addedImages.push(io);                     
                }
            } 
        } 
    	};	  
    // update database  info and viewed images list
	
	  return result;	  	
  } 
 reloadData(refresh,callback)
 {

		var url='http://'+this.ourserveraddress+'/tags'
		console.log("in reload sending to="+this.ourserveraddress+" full url="+url);
		this.http.get(url,{},{})
			.then(response =>			
			{
				if(response.status == 200)
				{
				  //console.log("have data back for tags="+response.data);
				 	this.Tags= JSON.parse(response.data);
				 	//console.log("tags type="+typeof this.Tags+" type of response="+ typeof response.data);
	
					//this.tags=this.Tags;

					// this callback will be called asynchronously
					// when the response is available
					url='http://'+this.ourserveraddress+'/datasources'
					this.http.get(url,{},{})
					.then(response =>
					{
						if(response.status == 200)
						{
							//console.log("have data back for datasources="+response.data);
							this.DataSources= JSON.parse(response.data);			          			                             
			
							//this.dataSources=this.DataSources;
							url='http://'+this.ourserveraddress+'/viewers'
							this.http.get(url,{},{}) 
								.then(response =>
								{
									if(response.status == 200)
									{
										//console.log("have data back for viewers="+response.data);
										this.Viewers= JSON.parse(response.data);

										//this.viewers=this.Viewers;
										url='http://'+this.ourserveraddress+'/images'
										this.http.get(url,{},{}) 
										  .then(response =>
											{
												if(response.status == 200)
												{
													//console.log("have data back for images="+response.data);
													this.Images= JSON.parse(response.data);													

													//this.images=this.Images;
													if(refresh == true)
													{
														console.log('Async operation has ended');
														callback(null);
												    //this.$broadcast('scroll.refreshComplete');
												    //$ionicLoading.hide();	
													}
												}
												// this callback will be called asynchronously
												// when the response is available
											}, 
											function errorCallback(response) {
												// called asynchronously if an error occurs
												// or server returns response with an error status.
												callback("error on get images");
											}); 		
									}
									// this callback will be called asynchronously
									// when the response is available
								}, 
								function errorCallback(response) {
									// called asynchronously if an error occurs
									// or server returns response with an error status.
									callback("error on get viewers");
								}); 							
											}
						// this callback will be called asynchronously
						// when the response is available
					}, 
					function errorCallback(response) {
						// called asynchronously if an error occurs
						// or server returns response with an error status.
						callback("error on get datasources");
					}); 
				}
			}, error=>{
				console.log("http get error="+JSON.stringify(error));
				callback("error on get tags");
			}
			);
		}		

	dodelete(object,type)
	{
		
		var urlstring="http://"+this.ourserveraddress+"/"+type+"s?id="+object._id;
		
		console.log("delete of "+type+"="+object.Name+"\n url="+urlstring+"\ndata="+JSON.stringify(object));
		this.http.delete(urlstring,{},{})
			.then((response) =>
				{				
					if(response.status==200)
					{
						console.log("item deleted");
						this.doRefresh(false);
						//$ionicLoading.hide();
					}
					else
					{
						console.log("item delete failed rc="+response.status);
					}
				}, 
				function errorCallback(response) 
				{
					console.log("delete request failed="+response.status);
				}
			).catch((error) =>{
					console.log("delete request failed="+error);
			});
	}
	doRefresh(refresh) 
	{
    	console.log('Begin async operation');
    	try 
    	{     
			this.reloadData(true, function(error){});						
		}
		catch(ex)
		{
			alert("refresh ionic failed="+ex);
		}
	};
	updateadd_success(response,object,type, refresh)
  {
    //alert("success hide and refresh status="+JSON.stringify(response));
  		//var status=response.status;
  		
  		switch(response.status)
  		{
  			case 201:
					if(this.modaltype=='add')
						object._id=response.data; 
					console.log("object added, id="+response.data);	
  			case 200:
  				if(refresh)
  				{	  			  				
	  				//this.modal[type].hide();  				
			    	this.doRefresh(true); 
		    	}
  				break;   
  			default:
	 		}
  }
  doFresh(refresher)
  {
  		this.reloadData(true, 
			function(error)
			{
				refresher.complete();
			}
		);
  }
  getFiles(urlstring)
  {
    var self=this;    
    var promise = new Promise(function(resolve, reject) {
    
  		var u='http://'+self.ourserveraddress+'/files?'+encodeURI(urlstring);
  		console.log("file url="+u);
 	 	self.http.get(u,{},{})
			.then(function(response)
				{				
				  console.log("file list retrieved  status="+response.status);
					if(response.status==200)
					{
						let files=[];
						if(response.data.length>2)
						  files= JSON.parse(response.data);
						console.log("file list retrieved size="+files.length);
						resolve(files);
					}
					else
					{
						console.log("files get failed rc="+response.status);
						reject(response);
					}
				}
			).catch(function(errormsg)
				{
					console.log("http files get exception="+errormsg);
					reject(errormsg);
				});
		});
		
  		return promise;
  }
	
}
