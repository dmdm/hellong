import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'app-landing-page'
    }
})
export class LandingPageComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
