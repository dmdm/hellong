import {TestBed, async, inject} from '@angular/core/testing';
import {WinmanService, DEFAULT_WINDOW} from './winman.service';
import {State as DesktopState} from './store.reducers';
import {Store} from "@ngrx/store";
import * as fromRoot from '../core/store.reducers';
import {WmWindow} from "./models";
import {Injectable} from "@angular/core";
import {testBedWithStore} from "../testing/presets";


class MockWindowRef {
    constructor(public data:WmWindow) {}
    destroy() { this.data = undefined; }
}


@Injectable()
class MockWinmanService extends WinmanService {

    public desktop: DesktopState;

    constructor(store: Store<fromRoot.State>) {
        super(store);
    }

    public createRef(wmWindow: WmWindow) {
        //noop
    }

    protected destroyRef(id: string) {
        //noop
    }

}


describe('WinmanService', () => {
    beforeEach(() => {
        const conf: any = Object.assign({}, testBedWithStore);
        conf.providers = [...conf.providers, {provide: WinmanService, useClass:MockWinmanService}];
        TestBed.configureTestingModule(conf);
    });

    it('should exist', inject([WinmanService], (winman: MockWinmanService) => {
        expect(winman).toBeTruthy();
    }));

    it('should create a focused window', inject([WinmanService], (winman: MockWinmanService) => {
        let fixtId = 'testwin1';
        let fixtWin = Object.assign({}, DEFAULT_WINDOW, {id: fixtId});
        winman.createWindow(fixtWin);
        let win = winman.desktop.wmWindows[fixtId];
        expect(winman.desktop.ids[0]).toBe(fixtId);
        expect(winman.desktop.ids.length).toBe(1);
        expect(win.zIndex).toBe(1);
        expect(winman.isFocused(fixtId)).toBe(true);
    }));

    it('should create several windows', inject([WinmanService], (winman: MockWinmanService) => {
        let fixtIds = ['testwin1', 'testwin2', 'testwin3', 'testwin4', 'testwin5'];
        let count = fixtIds.length;
        for (let id of fixtIds) {
            let fixtWin = Object.assign({}, DEFAULT_WINDOW, {id: id});
            winman.createWindow(fixtWin);
        }
        expect(winman.desktop.ids.length).toBe(count);
        fixtIds.forEach((id, i) => {
            expect(winman.desktop.ids[i]).toBe(id);
            let win = winman.desktop.wmWindows[id];
            // zIndex should be ascending
            expect(win.zIndex).toBe(i + 1);
            // only last win should be focused
            if (i < count - 1) {
                expect(winman.isFocused(id)).toBe(false);
            }
            else {
                expect(winman.isFocused(id)).toBe(true);
            }
        });
    }));
});
