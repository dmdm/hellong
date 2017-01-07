import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'app-test-materials',
    templateUrl: './test-materials.component.html',
    styleUrls: ['./test-materials.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestMaterialsComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
