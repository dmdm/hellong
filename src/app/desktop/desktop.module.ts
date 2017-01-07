import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WmWindowComponent} from "./wm-window/wm-window.component";

/**
 * Do not set WinmanService as provider here.
 * We set it as provider in DesktopComponent, so that each Desktop (if there are several)
 * has its own list of windows.
 */

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        // @+$!  For mdMenu to work, the component must be registered in the app module!
//        WmWindowComponent
    ]
})
export class DesktopModule {
}
