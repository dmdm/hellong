import * as desktop from './store.actions';
import {WmWindow, WM_STATE} from "./models";


export interface State {
    // IDs of the opened windows in order of their stacking
    ids: string[];
    // The window definitions
    wmWindows: Map<string, WmWindow>;
}


const initialState: State = {
    ids: [],
    wmWindows: new Map<string, WmWindow>()
};


export function reducer(state = initialState, action: desktop.Actions): State {

    function newWw(): Map<string, WmWindow> {
        let ww: Map<string, WmWindow> = new Map<string, WmWindow>();
        for (let [id, w] of state.wmWindows) { ww.set(id, Object.assign({}, w)); }
        return ww;
    }

    function addFlags(id, where, ...flags) {
        let ww = new Map();
        let newList = [...state.wmWindows.get(id)[where], ...flags];
        for (let id2 of state.wmWindows.keys()) {
            if (id2 == id) {
                ww.set(id2, Object.assign({}, state.wmWindows.get(id2), {[where]: newList}));
            }
            else {
                ww.set(id2, Object.assign({}, state.wmWindows.get(id2)));
            }
        }
        return ww;
    }

    function removeFlags(id, where, ...flags) {
        let ww = new Map();
        let newList = state.wmWindows.get(id)[where].filter(x => flags.indexOf(x) === -1);
        for (let id2 of state.wmWindows.keys()) {
            if (id2 == id) {
                ww.set(id2, Object.assign({}, state.wmWindows.get(id2), {[where]: newList}));
            }
            else {
                ww.set(id2, Object.assign({}, state.wmWindows.get(id2)));
            }
        }
        return ww;
    }

    function removeFlagsFromAll(where, ...flags) {
        let ww = new Map();
        for (let id of state.wmWindows.keys()) {
            let newList = state.wmWindows.get(id)[where].filter(x => flags.indexOf(x) === -1);
            ww.set(id, Object.assign({}, state.wmWindows.get(id), {[where]: newList}));
        }
        return ww;
    }

    switch (action.type) {

        case desktop.ActionTypes.CREATE_WINDOW: {
            const wmWindow = action.payload;
            let ww = newWw();
            ww.set(wmWindow.id, wmWindow);
            return {
                ids: [...state.ids, wmWindow.id],
                wmWindows: ww
            }
        }

        case desktop.ActionTypes.DESTROY_WINDOW: {
            const idToDelete = action.payload;
            let ww = newWw();
            ww.delete(idToDelete);
            return {
                ids: state.ids.filter(id => id !== idToDelete),
                wmWindows: ww
            }
        }

        case desktop.ActionTypes.MAXIMIZE_WINDOW: {
            const {id, rect, prevRect} = action.payload;
            let newW = Object.assign({}, state.wmWindows.get(id), rect, {prevRect: prevRect});
            newW.wmState = [...newW.wmState, WM_STATE.MAXIMIZED_HORZ, WM_STATE.MAXIMIZED_VERT];
            let ww = new Map(state.wmWindows);
            ww.set(id, newW);
            return {
                ids: [...state.ids],
                wmWindows: ww
            }
        }

        case desktop.ActionTypes.UNMAXIMIZE_WINDOW: {
            const {id, rect, prevRect} = action.payload;
            let newW = Object.assign({}, state.wmWindows.get(id), rect, {prevRect: prevRect});
            newW.wmState = newW.wmState.filter(x => x != WM_STATE.MAXIMIZED_HORZ && x != WM_STATE.MAXIMIZED_VERT);
            let ww = new Map(state.wmWindows);
            ww.set(id, newW);
            return {
                ids: [...state.ids],
                wmWindows: ww
            }
        }

        case desktop.ActionTypes.FOCUS_WINDOW: {
            const {focusedWindow, stack} = action.payload;
            let ww = removeFlagsFromAll('wmState', WM_STATE.FOCUSED);
            for (let [id, z] of stack.entries()) {
                ww.get(id).zIndex = z;
                if (id == focusedWindow) {
                    ww.get(id).wmState.push(WM_STATE.FOCUSED);
                }
            }
            return {
                ids: [...state.ids].sort((a, b) => state.wmWindows.get(a).zIndex - state.wmWindows.get(b).zIndex),
                wmWindows: ww
            }
        }

        case desktop.ActionTypes.MOVE_WINDOW: {
            const {id, dx, dy} = action.payload;
            let ww = newWw();
            ww.get(id).translateX += dx;
            ww.get(id).translateY += dy;
            return {
                ids: [...state.ids],
                wmWindows: ww
            }
        }

        case desktop.ActionTypes.RESIZE_WINDOW: {
            const {id, dx, dy} = action.payload;
            let ww = newWw();
            ww.get(id).width += dx;
            ww.get(id).height += dy;
            return {
                ids: [...state.ids],
                wmWindows: ww
            }
        }

        case desktop.ActionTypes.SET_WINDOW_POSITION: {
            const {id, pos} = action.payload;
            let ww = newWw();
            ww.get(id).top = pos.top;
            ww.get(id).left = pos.left;
            ww.get(id).translateX = pos.translateX;
            ww.get(id).translateY = pos.translateY;
            return {
                ids: [...state.ids],
                wmWindows: ww
            }
        }

        case desktop.ActionTypes.CONFIGURE_WINDOW: {
            const {id, conf, addFlags, removeFlags} = action.payload;
            let w = Object.assign({}, state.wmWindows.get(id), conf);
            if (addFlags) {
                Object.keys(addFlags).forEach(where => {
                    w[where] = [...w[where], addFlags[where]];
                });
            }
            if (removeFlags) {
                Object.keys(removeFlags).forEach(where => {
                    w[where] = w[where].filter(x => removeFlags[where].indexOf(x) == -1);
                });
            }
            let ww = newWw();
            ww.set(id, w);
            return {
                ids: [...state.ids],
                wmWindows: ww
            }
        }

        default: {
            return state;
        }
    }
}



export const getWmWindows = (state: State) => state.wmWindows;
// cannot return values() directly: ngFor has problems with it (iterator of iterator instead of list)
export const getWmWindowList = (state: State) => [...state.wmWindows.values()];
export const getIds = (state: State) => state.ids;
