/**
 * See also:
 * Extended Window Manager Hints
 * https://specifications.freedesktop.org/wm-spec/wm-spec-latest.html
 */

export enum WM_WINDOW_TYPE {
    DESKTOP,
    DOCK,
    TOOLBAR,
    MENU,
    UTILITY,
    SPLASH,
    DIALOG,
    DROPDOWN_MENU,
    POPUP_MENU,
    TOOLTIP,
    NOTIFICATION,
    COMBO,
    DND,
    NORMAL
}


export enum WM_STATE {
    MODAL,
    STICKY,
    MAXIMIZED_VERT,
    MAXIMIZED_HORZ,
    SHADED,
    SKIP_TASKBAR,
    SKIP_PAGER,
    HIDDEN,
    FULLSCREEN,
    ABOVE,
    BELOW,
    DEMANDS_ATTENTION,
    FOCUSED
}


export enum WM_ALLOWED_ACTIONS {
    MOVE,
    RESIZE,
    MINIMIZE,
    SHADE,
    STICK,
    MAXIMIZE_HORZ,
    MAXIMIZE_VERT,
    FULLSCREEN,
    CHANGE_DESKTOP,
    CLOSE,
    ABOVE,
    BELOW
}


export interface FRAME_EXTENTS {
    left: number;
    top: number;
    right: number;
    bottom: number;
}


export interface WmWindow {
    // base
    id: string,
    wmWindowType: Array<WM_WINDOW_TYPE>,
    wmAllowedActions: Array<WM_ALLOWED_ACTIONS>,
    frameExtents: FRAME_EXTENTS
    // dimensions
    left: number,
    top: number,
    width: number,
    height: number,
    zIndex: number,
    translateX:number,
    translateY:number,
    scaleX:number,
    scaleY:number,
    prevRect: {left:number, top:number, width:number, height:number},
    // state
    wmState: Array<WM_STATE>,
}
