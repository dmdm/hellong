import {Component, OnInit, OnDestroy, ChangeDetectionStrategy, ComponentFactoryResolver, ViewChild, ViewContainerRef, ElementRef, AfterViewInit} from '@angular/core';
import {WmWindowComponent} from "../wm-window/wm-window.component";
import {WinmanService, DEFAULT_WINDOW} from "../winman.service";
import {Store} from "@ngrx/store";
import * as fromRoot from '../../core/store.reducers';


declare const ResizeObserver:any;


@Component({
    selector: 'app-desktop',
    templateUrl: './desktop.component.html',
    styleUrls: ['./desktop.component.scss'],
    host: {
        'class.clearfix': '1'
    },
    entryComponents: [WmWindowComponent],
    providers: [WinmanService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesktopComponent implements OnInit, OnDestroy, AfterViewInit {

    private resizeObserver;

    @ViewChild('wmWindowsContainer', {read: ViewContainerRef})
    wmWindowsContainer: any;

    @ViewChild('viewport')
    viewport: ElementRef;

    public wmWindowList$;

    constructor(private winman: WinmanService, private resolver: ComponentFactoryResolver, private store: Store<fromRoot.State>) {
    }

    ngOnInit() {
        this.winman.initFactory(this.resolver, this.wmWindowsContainer);
        this.wmWindowList$ = this.store.select(fromRoot.getWmWindowList);
    }

    ngOnDestroy() {
        this.winman.destroy();
        this.resizeObserver.disconnect();
    }

    ngAfterViewInit(): void {
        let cr = this.viewport.nativeElement.getBoundingClientRect();
        this.winman.viewportRect = {left: cr.left, top: cr.top, width: cr.width, height: cr.height};
        this.resizeObserver = new ResizeObserver(entries => {
            let cr = entries[0].contentRect;
            this.winman.viewportRect.width = cr.width;
            this.winman.viewportRect.height = cr.height;
        });

        // Observe one or multiple elements
        this.resizeObserver.observe(this.viewport.nativeElement);
    }

    createWmWindow() {
        this.winman.createWindow(DEFAULT_WINDOW);
    }

    destroyWmWindow(id) {
        this.winman.destroyWindow(id);
    }

    trackWmWindows(i, wmWindow) {
        return wmWindow.id;
    }
}
