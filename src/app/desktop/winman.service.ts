import {Injectable, ComponentRef, ReflectiveInjector} from '@angular/core';
import {WmWindow, WM_ALLOWED_ACTIONS, WM_STATE, WM_WINDOW_TYPE, FRAME_EXTENTS} from "./models";
import {Store} from "@ngrx/store";
import * as fromRoot from '../core/store.reducers';
import {State as DesktopState} from './store.reducers';
import * as desktop from './store.actions';
import {WmWindowComponent} from "./wm-window/wm-window.component";
import {Direction, Rect} from "../utils";
import {ResizeAction, MoveAction, Action} from "./winman-actions";


export const MOUSE_BORDER = 4;
export const DEFAULT_WINDOW_TYPE: Array<WM_WINDOW_TYPE> = [
    WM_WINDOW_TYPE.NORMAL
];
export const DEFAULT_ALLOWED_ACTIONS: Array<WM_ALLOWED_ACTIONS> = [
    WM_ALLOWED_ACTIONS.MOVE,
    WM_ALLOWED_ACTIONS.RESIZE,
    WM_ALLOWED_ACTIONS.MINIMIZE,
    WM_ALLOWED_ACTIONS.SHADE,
    WM_ALLOWED_ACTIONS.STICK,
    WM_ALLOWED_ACTIONS.MAXIMIZE_HORZ,
    WM_ALLOWED_ACTIONS.MAXIMIZE_VERT,
    WM_ALLOWED_ACTIONS.FULLSCREEN,
    WM_ALLOWED_ACTIONS.CHANGE_DESKTOP,
    WM_ALLOWED_ACTIONS.CLOSE,
    WM_ALLOWED_ACTIONS.ABOVE,
    WM_ALLOWED_ACTIONS.BELOW
];
export const DEFAULT_FRAME_EXTENTS: FRAME_EXTENTS = {
    left: MOUSE_BORDER,
    top: MOUSE_BORDER,
    right: MOUSE_BORDER,
    bottom: MOUSE_BORDER
};
export const DEFAULT_STATE: Array<WM_STATE> = [];
export const DEFAULT_WINDOW: WmWindow = {
    // base
    id: null,
    wmWindowType: DEFAULT_WINDOW_TYPE,
    wmAllowedActions: DEFAULT_ALLOWED_ACTIONS,
    frameExtents: DEFAULT_FRAME_EXTENTS,
    // dimensions
    left: 100,
    top: 100,
    width: 200,
    height: 200,
    zIndex: 1,
    translateX: 0,
    translateY: 0,
    scaleX: 0,
    scaleY: 0,
    prevRect: {left:0, top:0, width:0, height:0},
    // state
    wmState: DEFAULT_STATE,
};


@Injectable()
export class WinmanService {

    protected desktop: DesktopState;
    protected lastWindowNum: number = 0;
    protected resolver;
    protected container;

    protected actions:Map<string, Action> = new Map<string, Action>();
    protected windowRefs: Map<string, ComponentRef<WmWindowComponent>> = new Map<string, ComponentRef<WmWindowComponent>>();

    mouseBorder: number = MOUSE_BORDER;
    viewportRect: Rect;

    constructor(private store: Store<fromRoot.State>) {
        store.select(fromRoot.getDesktop).subscribe(state => this.handleDesktopChange(state));
    }

    destroy() {
        const refIds: Set<string> = new Set<string>(this.windowRefs.keys());
        for (let id of refIds.values()) {
            this.destroyRef(id);
        }
    }

    protected handleDesktopChange(desktop: DesktopState) {
        this.desktop = desktop;
        const refIds: Set<string> = new Set<string>(this.windowRefs.keys());
        const storeIds: Set<string> = new Set<string>(desktop.ids);
        const refOnly = new Set([...refIds].filter(x => !storeIds.has(x)));
        const storeOnly = new Set([...storeIds].filter(x => !refIds.has(x)));
        for (let id of refOnly.values()) {
            this.destroyRef(id);
        }
        for (let id of storeOnly.values()) {
            this.createRef(desktop.wmWindows.get(id));
        }
        // Store has changed. Remember to inform the components @Input properties about
        // the new values.
        for (let [id, wmWindow] of desktop.wmWindows.entries()) {
            let x = this.windowRefs.get(id).instance;
            x.wmWindow = wmWindow;
        }
    }

    protected createRef(wmWindow: WmWindow) {
        // Example how to programmatically inject properties into component's constructor
        let inputs = {
            // id: wmWindow.id,
        };

        // Inputs need to be in the following format to be resolved properly
        let inputProviders = Object.keys(inputs).map(
            (inputName) => {
                return {
                    provide: inputName,
                    useValue: inputs[inputName]
                };
            }
        );
        let resolvedInputs = ReflectiveInjector.resolve(inputProviders);
        // Create an injector out of the data we want to pass down and this components injector
        let injector = ReflectiveInjector.fromResolvedProviders(resolvedInputs, this.container.parentInjector);
        // Create a factory out of the component we want to create
        let factory = this.resolver.resolveComponentFactory(WmWindowComponent);
        // Create the component using the factory and the injector
        let windowRef = factory.create(injector);
        // Insert the component into the dom container
        this.container.insert(windowRef.hostView);
        this.windowRefs.set(wmWindow.id, windowRef);
        // The new window shall be focused
        this.focus(wmWindow.id);
    }

    protected destroyRef(id: string) {
        // Destroy window reference
        this.windowRefs.get(id).destroy();
        // Remove it from our list and notify subscribers
        this.windowRefs.delete(id);
    }

    /**
     * See also
     * https://specifications.freedesktop.org/wm-spec/wm-spec-latest.html#STACKINGORDER
     */
    protected restackWindows(focusedId:string): Map<string, number> {
        let below:Array<string> = [];
        let other:Array<string> = [];
        let above:Array<string> = [];
        let fullscreen:Array<string> = [];
        let modal:Array<string> = [];
        let stackedIds = [...this.desktop.ids].sort((a, b) =>
            this.desktop.wmWindows.get(a).zIndex - this.desktop.wmWindows.get(b).zIndex);
        for (let id of stackedIds) {
            let st = this.desktop.wmWindows.get(id).wmState;
            let ty = this.desktop.wmWindows.get(id).wmWindowType;
            if (st.indexOf(WM_STATE.BELOW) != -1 || ty.indexOf(WM_WINDOW_TYPE.DESKTOP) != -1) {
                below.push(id);
            }
            else if (st.indexOf(WM_STATE.ABOVE) != -1 || ty.indexOf(WM_WINDOW_TYPE.TOOLBAR) != -1) {
                above.push(id);
            }
            else if (st.indexOf(WM_STATE.FULLSCREEN) != -1) {
                fullscreen.push(id);
            }
            else if (st.indexOf(WM_STATE.MODAL) != -1) {
                modal.push(id);
            }
            else {
                other.push(id);
            }
        }
        let z = 1;
        let focusedZ;
        let stack:Map<string, number> = new Map<string, number>();
        for (let id of below)      { if (id != focusedId) { stack.set(id, z++) } }
        if (below.indexOf(focusedId) != -1) { focusedZ = z++; }
        for (let id of other)      { if (id != focusedId) { stack.set(id, z++) } }
        if (other.indexOf(focusedId) != -1) { focusedZ = z++; }
        for (let id of above)      { if (id != focusedId) { stack.set(id, z++) } }
        if (above.indexOf(focusedId) != -1) { focusedZ = z++; }
        for (let id of fullscreen) { if (id != focusedId) { stack.set(id, z++) } }
        if (fullscreen.indexOf(focusedId) != -1) { focusedZ = z++; }
        for (let id of modal)      { if (id != focusedId) { stack.set(id, z++) } }
        if (modal.indexOf(focusedId) != -1) { focusedZ = z; }
        stack.set(focusedId, focusedZ);
        return stack;
    }

    initFactory(resolver, container) {
        this.resolver = resolver;
        this.container = container;
    }

    createWindow(data: WmWindow) {
        let dd = Object.assign({}, DEFAULT_WINDOW, data);
        if (!dd.id) {
            dd.id = `window${this.lastWindowNum++}`;
        }
        dd.zIndex = this.desktop.ids.length
            ? this.desktop.wmWindows.get(this.desktop.ids[this.desktop.ids.length-1]).zIndex + 1
            : 1;
        this.store.dispatch(new desktop.CreateWindowAction(dd));
        this.focus(dd.id);
    }

    destroyWindow(id: string) {
        this.store.dispatch(new desktop.DestroyWindowAction(id));
    }

    initAction(wmWindow, event, which:string) {
        if (this.actions.has(wmWindow.id)) {
            this.actions.get(wmWindow.id).end(null);
            console.warn(`Old action for '${wmWindow.id}' not finished when new action was triggered. Destroyed old action.`);
        }
        this.focus(wmWindow.id);
        let action;
        let pd = this.calcPointerData(event, wmWindow.left, wmWindow.top, wmWindow.width, wmWindow.height);
        switch (which) {
            case 'move':
                action = new MoveAction(this, wmWindow, event, pd);
                break;
            case 'resize':
                action = new ResizeAction(this, wmWindow, event, pd);
                break;
            default:
                throw new Error(`Unknown action: '${which}'`);
        }
        this.actions.set(wmWindow.id, action);
        return action;
    }

    onEndAction(action:Action) {
        this.actions.delete(action.wmWindow.id);
    }

    moveBy(id, dx, dy) {
        let aa = this.desktop.wmWindows.get(id).wmAllowedActions;
        if (aa.indexOf(WM_ALLOWED_ACTIONS.MOVE) == -1) {
            return false;
        }
        this.store.dispatch(new desktop.MoveWindowAction({id, dx, dy}));
        return true;
    }

    resizeBy(id:string, direction:Direction, dx:number, dy:number) {
        let aa = this.desktop.wmWindows.get(id).wmAllowedActions;
        if (aa.indexOf(WM_ALLOWED_ACTIONS.RESIZE) == -1) {
            return false;
        }

        let [mdx, mdy, rdx, rdy] = [0, 0, 0, 0];
        switch (direction) {
            case 'N':  //         dy < 0
                [mdx, mdy] = [  0,  dy];
                [rdx, rdy] = [  0, -dy];
                break;
            case 'NE': // dx > 0, dy < 0
                [mdx, mdy] = [  0,  dy];
                [rdx, rdy] = [ dx, -dy];
                break;
            case 'E':  // dx > 0
                [rdx, rdy] = [ dx,   0];
                break;
            case 'SE': // dx > 0, dy > 0
                [rdx, rdy] = [ dx,  dy];
                break;
            case 'S':  //         dy > 0
                [rdx, rdy] = [  0,  dy];
                break;
            case 'SW': // dx < 0, dy > 0
                [mdx, mdy] = [ dx,   0];
                [rdx, rdy] = [-dx,  dy];
                break;
            case 'W':  // dx < 0
                [mdx, mdy] = [ dx,   0];
                [rdx, rdy] = [-dx,   0];
                break;
            case 'NW': // dx < 0, dy < 0
                [mdx, mdy] = [ dx,  dy];
                [rdx, rdy] = [-dx, -dy];
                break;
        }
        if (mdx != 0 || mdy != 0) {
            this.store.dispatch(new desktop.MoveWindowAction({id:id, dx:mdx, dy:mdy}));
        }
        if (rdx != 0 || rdy != 0) {
            this.store.dispatch(new desktop.ResizeWindowAction({id:id, dx:rdx, dy:rdy}));
        }
        return true;
    }

    setWindowPosition(id): boolean {
        let w = this.desktop.wmWindows.get(id);
        let pos = {
            left: w.left + w.translateX,
            top: w.top + w.translateY,
            translateX: 0,
            translateY: 0
        };
        this.store.dispatch(new desktop.SetWindowPositionAction({id, pos}));
        return true;
    }

    maximize(id: string): boolean {
        let w = this.desktop.wmWindows.get(id);
        let aa = w.wmAllowedActions;
        if (aa.indexOf(WM_ALLOWED_ACTIONS.MAXIMIZE_HORZ) == -1 && aa.indexOf(WM_ALLOWED_ACTIONS.MAXIMIZE_VERT) == -1) {
            return false;
        }
        if (this.isMaximized(id)) {
            return false;
        }
        let rect = Object.assign({}, this.viewportRect);
        let prevRect = {
            left: w.left,
            top: w.top,
            width: w.width,
            height: w.height
        };
        this.store.dispatch(new desktop.MaximizeWindowAction({id, rect, prevRect}));
        return true;
    }

    unmaximize(id: string): boolean {
        if (!this.isMaximized(id)) {
            return false;
        }
        let w = this.desktop.wmWindows.get(id);
        let rect = Object.assign({}, w.prevRect);
        let prevRect = {
            left: 0,
            top: 0,
            width: 0,
            height: 0
        };
        this.store.dispatch(new desktop.UnMaximizeWindowAction({id, rect, prevRect}));
        return true;
    }

    isMaximized(id: string): boolean {
        let st = this.desktop.wmWindows.get(id).wmState;
        return (st.indexOf(WM_STATE.MAXIMIZED_HORZ) != -1 || st.indexOf(WM_STATE.MAXIMIZED_VERT) != -1);
    }

    focus(id: string): boolean {
        if (this.isFocused(id)) {
            return false;
        }
        this.store.dispatch(new desktop.FocusWindowAction({focusedWindow:id, stack:this.restackWindows(id)}));
        return true;
    }

    isFocused(id: string): boolean {
        let st = this.desktop.wmWindows.get(id).wmState;
        return st.indexOf(WM_STATE.FOCUSED) != -1;
    }

    toggleMaximize(id: string): boolean {
        if (this.isMaximized(id)) {
            return this.unmaximize(id);
        }
        else {
            return this.maximize(id);
        }
    }

    setKeepBelow(id: string, v: boolean) {
    }

    setKeepAbove(id: string, v: boolean) {
    }

    setDecorated(id: string, v: boolean) {
    }

    calcPointerData(event: PointerEvent,
                    left: number,
                    top: number,
                    width: number,
                    height: number): {
        pointerXOffset: number,  // pointer hit relative to widget_OFF.left
        pointerYOffset: number,  // pointer hit relative to widget_OFF.top
        direction: Direction,    // pointer hit relative to widget_OFF's border
        scrollX: number,
        scrollY: number
    } {
        let bottom = top + height;
        let right = left + width;

        // Calculate the pointer offset relative to target element's
        // NW corner (0, 0) and take scroll position into account.
        // TODO scroll position does not work yet: take scroll pos from desktop, not browser window. Put a div as viewport with virtual size in desktop so that desktop scrolls
        let scrollX = window.scrollX;
        let scrollY = window.scrollY;
        // let pointerXOffset = event.pageX - scrollX;
        // let pointerYOffset = event.pageY - scrollY;

        let pointerXOffset = event.pageX;
        let pointerYOffset = event.pageY;

        let dir = '';
        if (Math.abs(pointerYOffset - top) <= this.mouseBorder) {
            dir = 'N';
        }
        else if (Math.abs(pointerYOffset - bottom) <= this.mouseBorder) {
            dir = 'S';
        }
        if (Math.abs(pointerXOffset - left) <= this.mouseBorder) {
            dir += 'W';
        }
        else if (Math.abs(pointerXOffset - right) <= this.mouseBorder) {
            dir += 'E';
        }
        if (dir === '') {
            dir = null;
        }
        let direction: Direction = <Direction>dir;

        return {pointerXOffset, pointerYOffset, direction, scrollX, scrollY};
    }
}
