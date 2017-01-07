import {Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef} from '@angular/core';


@Component({
    selector: 'app-click-test',
    templateUrl: './click-test.component.html',
    styleUrls: ['./click-test.component.scss']
})
export class ClickTestComponent implements OnInit, OnDestroy {

    private doc:Document;
    private clickJsCaptureListener = this.onClickJsCapture.bind(this);
    private clickJsBubbleListener = this.onClickJsBubble.bind(this);
    private prevTimeout = null;

    public messages = [];

    constructor(private changeDetectorRef:ChangeDetectorRef, private elementRef: ElementRef) {
    }

    private addEventListeners() {
        this.doc.addEventListener('click', this.clickJsCaptureListener, true);
        this.doc.addEventListener('click', this.clickJsBubbleListener, false);
    }

    private removeEventListeners() {
        this.doc.removeEventListener('click', this.clickJsCaptureListener, true);
        this.doc.removeEventListener('click', this.clickJsBubbleListener, false);
    }

    ngOnInit() {
        this.doc = window.document;
        this.addEventListeners()
    }

    ngOnDestroy() {
        this.removeEventListeners()
    }

    onClickJsCapture($event) {
        this.log($event, 'JsCapture');
    }

    onClickJsBubble($event) {
        this.log($event, 'JsBubble');
    }

    onClick($event) {
        this.log($event, 'Ng');
    }

    log($event, kind) {
        const tgt = $event.target;
        const tgtCl = tgt.id ? tgt.id + '-flash' : 'flash';
        const tgtId = tgt.id || tgt.tagName;

        let curTgt = $event.currentTarget;
        const curTgtCl = curTgt ? (curTgt.id ? curTgt.id + '-flash' : 'flash') : null;
        const curTgtId = curTgt.id || curTgt.tagName;

        tgt.classList.add(tgtCl);
        setTimeout(() => { tgt.classList.remove(tgtCl) }, 500);

        if (curTgt == window.document) {
            curTgt = this.elementRef.nativeElement;
        }
        if (curTgt) {
            curTgt.classList.add(curTgtCl);
            setTimeout(() => { curTgt.classList.remove(curTgtCl) }, 500);
        }

        const m = `${kind}: ${tgtId} -> ${curTgtId}`;
        this.messages.push(m);
        this.changeDetectorRef.markForCheck();
        if (this.prevTimeout !== null) {
            clearTimeout(this.prevTimeout);
        }
        this.prevTimeout = setTimeout(() => this.messages.push('---'), 500);
    }

    event = {screenX:0, screenY:0, clientX:0, clientY:0, pageX:0, pageY:0};
    onPointerMove(event) {
        this.event = event;
    }

}
