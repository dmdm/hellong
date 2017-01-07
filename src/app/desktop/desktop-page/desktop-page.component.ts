import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'app-desktop-page',
    templateUrl: './desktop-page.component.html',
    styleUrls: ['./desktop-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesktopPageComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
