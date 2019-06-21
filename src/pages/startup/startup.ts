import { Component} from '@angular/core';
import {  NavController, NavParams, Platform } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ModalController } from 'ionic-angular';


/**
 * Generated class for the StartupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-startup',
  templateUrl: 'startup.html'
})

export class StartupPage  {
 chrome: any;
  timeoutId: any;
  serveraddress: any;
  ourserveraddress: any;
  port: any;
  d: any;
  storage:any;
  
  constructor(public navCtrl: NavController, 
 						  public navParams: NavParams,
  						  private data: DataProvider,
  						  public viewCtrl: ViewController, 
  						  platform:Platform,
  						  private storagee: Storage,
  						  public modalCtrl: ModalController
  						  )
  	{
 		console.log("========>in constructor==========");
     this.serveraddress='192.168.2.128:8099';
     this.port='';
     this.d=data;
     var p=platform.platforms();
     this.storage=storagee;
     console.log("====>platforms="+p);
		 if(p.indexOf("remote-ios")==-1)
		 {
       platform.ready().then(
				(readySource) => 
				{
					console.log(readySource+" Platform ready! there are "+platform.platforms().length+" platforms");
					for(let f of platform.platforms())
					   console.log("platform ="+f);
			   	if(readySource=='cordova')
			   	{	     	 
			   	 this.OnInit();
			   	}
			  }
  		   ); 	  		   	
		 }
		 else
		 {
		 	this.loadData(this.serveraddress)	
		 }     
  }

	OnInit() 
	{
	 var self=this;
	 (<any>window).networkinterface.getWiFiIPAddress(	 
		 function (our_ip) 
		 { 
		 	 console.log("have our ip="+our_ip);
		 	 self.findServerAddress(our_ip,
				function(server_address)
				{
					if(server_address!=null)
						self.loadData(server_address)
					else
					{	
						self.storage.get("server_ip")
							.then(function(address)
							{
								if(address==null)
								{
									console.log("have saved server address="+address);
									self.serveraddress=address;
									self.loadData(self.serveraddress);
								}
								else
								{
									console.log("data not found, need to prompt");
									
									self.getServerAddress()
										.then(function(address)
										{
											self.storage.set("server_ip",address);
											self.serveraddress=address;
											self.loadData(self.serveraddress);
										})
										.catch(function(action)
										{
											if(action=='delete')
											  self.storage.remove("server_ip");												
										});
								}
							},
							 function(findit)
								{
										console.log("need to dialog prompt to get address");
								}
							)
					}					
				}
			);
		 }	,
		 function(error)
		 {
		 		console.log("error finding wifif addresss");
		 }	 
	 )
  }
  getServerAddress()
  {

  		var self=this;
  		console.log("in getserver");
  		var promise=new Promise(function(resolve,reject)
  		{
  			console.log("in promise");
  			// check if there is a file saved with the ip address in it
  			// if so, use that
  			// otherwise prompt the user
  			try 
  			{
				let address_dialog=self.modalCtrl.create('AddressModalPage',{});
				console.log("dialog created");
				address_dialog.onDidDismiss(function(updatedObject) 
				{
		 		 		// Do things with data coming from modal, for instance :
		 		 	if(updatedObject != undefined){
					 if(updatedObject.address!=undefined)
					 {
					 		console.log("the server address specified was "+updatedObject.address);
					 		;
					 		resolve(updatedObject.address);
					 }
					 else
					 	if(updatedObject.action=='delete')
						 	reject("delete");
					 else
					 		reject(null);
			 	 }	 
			 	 else
			 	 {
			 	   console.log ("return from dialog, no data")
			 		 reject("user canceled dialog, no data");
			 	 }
				})
				console.log("showing dialog");
		  		address_dialog.present();  
			}
			catch(err)
			{	
				console.log("dialog handler setup failed "+err);
				reject(null);
			}

  		})
  		return promise;			
  }
  focusChanged(type)
  {
  			console.log("startup focus changing="+type);
  }
  loadData(server)
  {
  	var self=this
  		self.data.ourserveraddress=server;
		self.data.reloadData(true, 
			function(error)
			{
		  console.log("back from reload");
		  console.log("viewers="+self.data.Viewers+" type="+typeof self.data.Viewers);
			self.navCtrl.push('HomePage')
 			 .then(
 			 	 () => 
	 			 {
		 			  console.log("new page loaded");
			 		 // first we find the index of the current view controller:
						const index = self.viewCtrl.index;
			 		 // then we remove it from the navigation stack
			 		 self.navCtrl.remove(index);
			 		// self.navCtrl.setRoot(self.navCtrl.getActive().component);
	 		   }
 		   );		
 		  }
 	  );	
  }
  
  ionViewDidLoad() {
    console.log('================ionViewDidLoad StartupPage============');
    //this.OnInit();
  }
   

  findServerAddress(ip,cb)
	{
		   var ReceiverPort =8100;
		   var BROADCAST_ADDR = "192.168.2.255";
       var MirrorRequest = "DISCOVER_MIRRORSERVER_REQUEST:";
       var expectedResponse = "DISCOVER_MIRRORSERVER_RESPONSE:";
       var amountReceived=0;
       var callback=cb;
       var counter=0;
       var server_address="";
       let timeout_handle=0;
       let discoveryTimeout=5000;
			
			//$scope.openModal('server');
      //console.log("have our ip address="+ip); 
     
      
      this.timeoutId = setTimeout(function() {
      //  console.warn('jquery only got: ' + amountReceived + ' of '+(expectedResponse.length+4) +' bytes');
        //$scope.closeModal('server',null); 
      }, 120000); 
      
     function  handleAccept(info1)
      {
        console.log("in handle");
      		if(++counter == 1)
      		{     		
      		console.log("accept");
				(<any>window).chrome.sockets.tcp.getInfo(info1.clientSocketId, 
						function(info2)
						{									
							console.log("saving peer="+	info2.peerAddress);			 
							server_address = info2.peerAddress;         	
					    (<any>window).chrome.sockets.tcp.setPaused(info1.clientSocketId, false);					    
						} 
					) 	    			
      		}
      }
      
     function recvListener(info) 
      {
        amountReceived += info.data.byteLength;
        console.log("receive socket info ="+info.socketId+" size="+info.data.byteLength+" amt rcv="+amountReceived);
        // 84320 is size of body, but will be more from headers.
        if (amountReceived >= expectedResponse.length+4) 
        {
        	try
        	{
		      	var arr = new Uint8Array(info.data);   				
		      	var textChunk = String.fromCharCode.apply(null,arr);
		      	console.log("data="+typeof textChunk);
		      	if(textChunk.length>0)
						{
							textChunk = textChunk.toString();
							console.log("data="+textChunk);
							// check if its the right respose
			        if (textChunk.substring(0,expectedResponse.length) === expectedResponse)
			        {        
					      	try
					      	{                           
							      var port_info = textChunk.substring(expectedResponse.length);			          
										var serveraddress = server_address + ":" + port_info;	    
									   				
									  console.log("server address="+	serveraddress);			
										  		
										(<any>window).chrome.sockets.tcp.close(info.socketId);		
										clearTimeout(timeout_handle);							    		  					  							    
										callback(serveraddress)                         
									}
									catch(ex)
									{
										console.log("error="+ex);
									}
					      }
					      else
					      		console.log("wrong message '"+textChunk.substring(0,expectedResponse.length)+"'='"+expectedResponse+"'");
		        }
          }
          catch(ex)
          {
          	console.log("receve data error="+ex);
          }
        }
      };
     function	  stringToArrayBuffer(string) {
    // UTF-8
    var buf = new ArrayBuffer(string.length);
    var bufView = new Uint8Array(buf)
    for (var i = 0, strLen = string.length; i < strLen; i++) {
      bufView[i] = string.charCodeAt(i);
    }
    return buf;
  	} 
      function sendTo(data,  port, addr) {
 		    (<any>window).chrome.sockets.udp.create(function(createInfo) {
    			console.log("in udp create");
      		(<any>window).chrome.sockets.udp.bind(createInfo.socketId, '0.0.0.0', 0, function(result) {
						console.log("in bind");
						try 
						{
							(<any>window).chrome.sockets.udp.setBroadcast(createInfo.socketId,true,function(){});
							(<any>window).chrome.sockets.udp.send(createInfo.socketId, stringToArrayBuffer(data), addr, port, function(result) {
								console.log("in udp send");
								if (result < 0) {
									console.log('send fail: ' + result);
									(<any>window).chrome.sockets.udp.close(createInfo.socketId);
									console.log("send failed result="+result);
								} else {
									console.log('sendTo: success ' + port);
									(<any>window).chrome.sockets.udp.close(createInfo.socketId);
									//console.log("send succeeded");
								}
							});
						}
						catch(ex)
						{
							console.log("send error="+ex);
						}
					})
				});
			}
      console.log("setup listener");
 			try 
 			{      
 				var p = {persistent:false};
// 				console.log("chrome="+JSON.stringify((<any>window).chrome));
//console.log("sockets="+JSON.stringify((<any>window).chrome.sockets)); 
	 			(<any>window).chrome.sockets.tcpServer.create(p,
	 				function(createInfo)
	 				{
		 				console.log("socket created");
		 				try
		 				{
		 					(<any>window).chrome.sockets.tcpServer.listen(createInfo.socketId,ip, 0,1,
		 						function(result)
		 						{  
									console.log("get socket info");
									(<any>window).chrome.sockets.tcpServer.getInfo(this.socketId, 
										function(info)
										{			
											console.log("socket info ="+ JSON.stringify(info))							  ;
											//this.port=info.localPort
											console.log("using port="+info.localPort);
											var ha= handleAccept;
											console.log(" handleaccept function ="+ha);
											(<any>window).chrome.sockets.tcpServer.onAccept.addListener(ha);		
											(<any>window).chrome.sockets.tcp.onReceive.addListener(recvListener)	;	
											(<any>window).chrome.sockets.tcp.onReceiveError.addListener(
													function(info)
													{
														console.log("socket error="+JSON.stringify(info));
													}
											);

											//console.log("sockets="+JSON.stringify((<any>window).chrome.sockets)); 
											timeout_handle=setTimeout(
												function() 
												{ 												
												// if we timed out,return null so caller can address the issue
												callback(null);
												}, 
												discoveryTimeout
											);
											for(var q=0;q<3;q++)					  		
						 						sendTo(MirrorRequest+info.localPort, ReceiverPort, BROADCAST_ADDR);						 					
										}
									)
				 				}.bind({socketId:createInfo.socketId})				 			
				 			)
			 			}
			 			catch(ex)
			 			{
			 				console.log("listen failed="+ex);
			 			}
		 			}
	 			)  
	 			console.log("after create");  
 			}
 			catch(ex)
 			{
 				console.log("sockets failure="+ex);
 			}	              			
	}

		

}
