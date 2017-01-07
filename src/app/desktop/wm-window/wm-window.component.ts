import {Component, OnInit, OnDestroy, ElementRef, Renderer, AfterViewInit, Input, Injector, ChangeDetectionStrategy, SimpleChanges, OnChanges, ViewChild, ViewContainerRef} from '@angular/core';
import {addEventListener, resizeCursor} from "../../utils";
import {WinmanService} from "../winman.service";
import {WmWindow, WM_ALLOWED_ACTIONS, WM_WINDOW_TYPE} from "../models";


@Component({
    selector: 'app-wm-window',
    templateUrl: './wm-window.component.html',
    styleUrls: ['./wm-window.component.scss'],
    // @#$!  If we switch the strategy to OnPush, the template does not pick up the changes inside wmWindow property,
    //       even though the host styles are applied correctly.
    //       --> For real OnPush, use @Input for all properties!
    //           The position properties get updated because the change happens during events: zone does its thing here.
    // TODO Rewrite all properties as @Input
    //changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[style.z-index]': 'wmWindow.zIndex',
        '[style.left.px]': 'wmWindow.left',
        '[style.top.px]': 'wmWindow.top',
        '[style.width.px]': 'wmWindow.width',
        '[style.height.px]': 'wmWindow.height',
        '[style.transform]': 'transform',
        '[id]': 'wmWindow.id'
    }
})
export class WmWindowComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

    private listenerRemovers: Map<string, Function> = new Map();

    @ViewChild('title')
    elemTitle: ElementRef;
    @ViewChild('content')
    elemContent: ElementRef;

    @Input() wmWindow;

    elem: any;

    get bottom(): number {
        return this.wmWindow.top + this.wmWindow.height;
    }

    get right(): number {
        return this.wmWindow.left + this.wmWindow.width;
    }

    get transform() {
        let tt = [];
        if (this.wmWindow.translateX != 0 || this.wmWindow.translateY != 0) {
            tt.push(`translate(${this.wmWindow.translateX}px, ${this.wmWindow.translateY}px)`);
        }

        if (this.wmWindow.scaleX != 0 || this.wmWindow.scaleY != 0) {
            tt.push(`scale(${this.wmWindow.scaleX}, ${this.wmWindow.scaleY})`);
        }

        return tt.join(' ');
    }

    get moveAllowed(): boolean {
        return this.wmWindow.wmAllowedActions.indexOf(WM_ALLOWED_ACTIONS.MOVE) != -1;
    }

    get resizeAllowed(): boolean {
        return this.wmWindow.wmAllowedActions.indexOf(WM_ALLOWED_ACTIONS.RESIZE) != -1;
    }

    get hasTitlebar(): boolean {
        return this.wmWindow.wmWindowType.indexOf(WM_WINDOW_TYPE.NORMAL) != -1;
    }

    get isMaximized(): boolean { return this.winman.isMaximized(this.wmWindow.id); }

    get isFocused(): boolean { return this.winman.isFocused(this.wmWindow.id); }

    constructor(private winman: WinmanService, private elemRef: ElementRef, private renderer: Renderer, private injector: Injector) {
        // Example how to pick up properties that were programatically injected by the creator
        // See WinmanService.createRef()
        // this.id = this.injector.get('id');
    }

    private addEventListeners() {
        // Click on anything to focus the window. Event must be passed through, focus must not prevent
        // any action of the target element.
        this.listenerRemovers.set('focus', addEventListener(
            this.elem, 'pointerdown', event => this.focus(event), {capture:false, passive:true}));

        if (this.moveAllowed) {
            // bind this only to the title if available, else to window itself
            let elem = this.hasTitlebar ? this.elemTitle.nativeElement : this.elem;
            this.listenerRemovers.set('move', addEventListener(
                elem, 'pointerdown', event => this.initAction(event, 'move'), {capture:true, passive:false}));
        }
        if (this.resizeAllowed) {
            this.listenerRemovers.set('resize', addEventListener(
                this.elem, 'pointerdown', event => this.initAction(event, 'resize'), {capture:true, passive:false}));
        }
        this.addResizeListener();
    }

    private addResizeListener() {
        // always bind resize listener to window itself
        if (this.resizeAllowed) {
            this.listenerRemovers.set('resizecursor', addEventListener(
                this.elem, 'pointermove', event => this.setResizeCursor(event), {capture:true, passive:false}));
        }
    }

    private removeResizeListener() {
        let f = this.listenerRemovers.get('resizecursor');
        if (f) {
            f();
            this.listenerRemovers.delete('resizecursor');
        }
    }

    private removeEventListeners() {
        this.listenerRemovers.forEach(f => f());
        this.listenerRemovers.clear();
    }

    private focus(event) {
        this.winman.focus(this.wmWindow.id);
    }

    private initAction(event, which:string) {
        this.removeResizeListener();
        let action;
        let pd = this.winman.calcPointerData(event,
            this.wmWindow.left, this.wmWindow.top, this.wmWindow.width, this.wmWindow.height);
        // If action was initiated on the resize border, init only the resize action
        if (pd.direction) {
            if (which == 'resize') {
                action = this.winman.initAction(this.wmWindow, event, which);
            }
        }
        // If action was initiated outside of the resize border, do not init resize action
        else {
            if (which != 'resize') {
                action = this.winman.initAction(this.wmWindow, event, which);
            }
        }
        // if (! action) {
        //     console.warn('Why is action not initialized?', 'which=', which, 'direction=', pd.direction);
        // }
        if (action) {
            action.onEnd = () => this.onEndAction();
        }
    }

    private onEndAction() {
        this.addResizeListener();
    }

    private setResizeCursor(event: any) {
        let pd = this.winman.calcPointerData(event,
            this.wmWindow.left, this.wmWindow.top, this.wmWindow.width, this.wmWindow.height);
        this.renderer.setElementStyle(this.elem, 'cursor', resizeCursor(pd.direction));
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.removeEventListeners();
    }

    ngOnChanges(changes: SimpleChanges) {
        // @#$!  Strangely, no OnChanges is fired event though the changes are detected by the host styles...
        console.debug('changes', changes);
    }

    ngAfterViewInit() {
        this.elem = this.elemRef.nativeElement;
        this.addEventListeners();
        this.renderer.setElementClass(this.elem, 'flash-on-create', true);
        setTimeout(() => this.renderer.setElementClass(this.elem, 'flash-on-create', false), 1000);
    }

    toggleMaximize() {
        this.winman.toggleMaximize(this.wmWindow.id);
    }

    close() {
        this.winman.destroyWindow(this.wmWindow.id);
    }
}
