import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public dark: boolean;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    if (localStorage.getItem('mode') === 'true') {
      this.dark = true;
    } else {
      this.dark = false;
    }
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  setStatusBar(value) {
    this.dark = value;
    if (!this.dark) {
      this.statusBar.backgroundColorByHexString('#ffffff');
      this.statusBar.styleDefault();
      localStorage.setItem('mode', 'false');
    } else {
      this.statusBar.backgroundColorByHexString('#1f1f1f');
      this.statusBar.styleLightContent();
      localStorage.setItem('mode', 'true');
    }
  }
}
