/**
 * See also:
 * xcb
 * https://xcb.freedesktop.org/tutorial/basicwindowsanddrawing/
 */

import {Action} from '@ngrx/store';
import {type, Rect} from '../utils';
import {WmWindow, WM_WINDOW_TYPE, WM_ALLOWED_ACTIONS, FRAME_EXTENTS, WM_STATE} from "./models";


export const ActionTypes = {
    CREATE_WINDOW: type('[Winman] CREATE_WINDOW'),
    DESTROY_WINDOW: type('[Winman] DESTROY_WINDOW'),
    MAXIMIZE_WINDOW: type('[Winman] MAXIMIZE_WINDOW'),
    UNMAXIMIZE_WINDOW: type('[Winman] UNMAXIMIZE_WINDOW'),
    FOCUS_WINDOW: type('[Winman] FOCUS_WINDOW'),
    MOVE_WINDOW: type('[Winman] MOVE_WINDOW'),
    RESIZE_WINDOW: type('[Winman] RESIZE_WINDOW'),
    SET_WINDOW_POSITION: type('[Winman] SET_WINDOW_POSITION'),
    CONFIGURE_WINDOW: type('[Winman] CONFIGURE_WINDOW'),
};


export class CreateWindowAction implements Action {
    type = ActionTypes.CREATE_WINDOW;

    constructor(public payload: WmWindow) {
    }
}


export class DestroyWindowAction implements Action {
    type = ActionTypes.DESTROY_WINDOW;

    constructor(public payload: string) {
    }
}


export class MaximizeWindowAction implements Action {
    type = ActionTypes.MAXIMIZE_WINDOW;

    constructor(public payload: {id: string, rect: Rect, prevRect: Rect}) {
    }
}


export class UnMaximizeWindowAction implements Action {
    type = ActionTypes.UNMAXIMIZE_WINDOW;

    constructor(public payload: {id: string, rect: Rect, prevRect: Rect}) {
    }
}


export class FocusWindowAction implements Action {
    type = ActionTypes.FOCUS_WINDOW;

    constructor(public payload: {focusedWindow: string, stack: Map<string, number>}) {
    }
}


export class MoveWindowAction implements Action {
    type = ActionTypes.MOVE_WINDOW;

    constructor(public payload: {id: string, dx: number, dy: number}) {
    }
}


export class ResizeWindowAction implements Action {
    type = ActionTypes.RESIZE_WINDOW;

    constructor(public payload: {id: string, dx: number, dy: number}) {
    }
}


export class SetWindowPositionAction implements Action {
    type = ActionTypes.SET_WINDOW_POSITION;

    constructor(public payload: {id: string, pos: {left: number, top: number, translateX: number, translateY: number}}) {
    }
}


export class ConfigureWindowAction implements Action {
    type = ActionTypes.CONFIGURE_WINDOW;

    constructor(public payload: {
        id: string,
        conf: {
            wmWindowType?: Array<WM_WINDOW_TYPE>,
            wmAllowedActions?: Array<WM_ALLOWED_ACTIONS>,
            frameExtents?: FRAME_EXTENTS
            scaleX?:number,
            scaleY?:number
            wmState?: Array<WM_STATE>,
        },
        addFlags?: {[index:string]: Array<any>},
        removeFlags?: {[index:string]: Array<any>}
    })
    { }
}


export type Actions
    = CreateWindowAction
    | DestroyWindowAction
    | MaximizeWindowAction
    | UnMaximizeWindowAction
    | FocusWindowAction
    | MoveWindowAction
    | ResizeWindowAction
    | SetWindowPositionAction
    | ConfigureWindowAction;
