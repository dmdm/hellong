import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppRoutingModule} from './app-routing.module';
import {MaterialModule} from '@angular/material';
import {StoreModule} from "@ngrx/store";
import {RouterStoreModule} from "@ngrx/router-store";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import {EffectsModule} from "@ngrx/effects";
import 'hammerjs';
import {AppComponent} from './app.component';
import {TestMaterialsComponent} from './components/test-materials/test-materials.component';
import {reducer} from "./core/store.reducers";
import {requestOptionsProvider} from "./core/default-request-options.service";
import {RcService} from "./core/rc.service";
import {AuthService} from "./auth/auth.service";
import {LandingPageComponent} from './components/landing-page/landing-page.component';
import {FooBarComponent} from './components/foo-bar/foo-bar.component';
import {LoginDialogComponent} from "./auth/login-dialog/login-dialog.component";
import {DesktopComponent} from './desktop/desktop/desktop.component';
import {ClickTestComponent} from './components/click-test/click-test.component';
import {DesktopPageComponent} from './desktop/desktop-page/desktop-page.component';
import {DesktopModule} from "./desktop/desktop.module";
import {WmWindowComponent} from "./desktop/wm-window/wm-window.component";

@NgModule({
    declarations: [
        AppComponent,
        TestMaterialsComponent,
        LandingPageComponent,
        LoginDialogComponent,
        FooBarComponent,
        DesktopComponent,
        ClickTestComponent,
        DesktopPageComponent,
        WmWindowComponent
    ],
    imports: [
        MaterialModule.forRoot(),
        BrowserModule,
        FormsModule,
        HttpModule,
        AppRoutingModule,

        StoreModule.provideStore(reducer),
        RouterStoreModule.connectRouter(),
        // StoreDevtoolsModule.instrumentOnlyWithExtension(),
        // EffectsModule.run(BookEffects),
        // EffectsModule.run(CollectionEffects),
        DesktopModule

    ],
    providers: [
        requestOptionsProvider,
        RcService,
        AuthService,
    ],
    entryComponents: [
        LoginDialogComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
