import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TestMaterialsComponent} from "./components/test-materials/test-materials.component";
import {LandingPageComponent} from "./components/landing-page/landing-page.component";
import {ClickTestComponent} from "./components/click-test/click-test.component";
import {DesktopPageComponent} from "./desktop/desktop-page/desktop-page.component";

const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent,
        children: []
    },
    {
        path: 'desktop',
        component: DesktopPageComponent,
        children: []
    },
    {
        path: 'clicktest',
        component: ClickTestComponent,
        children: []
    },
    {
        path: 'test-materials',
        component: TestMaterialsComponent,
        children: []
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule {
}
