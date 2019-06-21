import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StartupPage } from '../pages/startup/startup';
import { DataProvider } from '../providers/data/data';

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
	selectedRow: any;
  rootPage:any; 

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,private data:DataProvider) {
    platform.ready().then(() => {
      console.log(" app-component platforms="+platform.platforms());
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleLightContent();
      splashScreen.hide();
      var self=this;
      self.rootPage = StartupPage; 
    });
  }
}

