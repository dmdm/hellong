import {addEventListener} from "../utils";


export type ActionPhase =
    'init'
    | 'performing'
    | 'ended'


export class Action {
    winman;
    preventDefault:boolean;
    stopPropagation:boolean;
    wmWindow;
    startEvent;
    startPointer;
    elem;
    endEvent;
    phase:ActionPhase = 'init';
    onEnd;

    constructor(winman, wmWindow, startEvent, startPointer, preventDefault:boolean=true, stopPropagation:boolean=true) {
        if (this.preventDefault) { startEvent.preventDefault(); }
        if (this.stopPropagation) { startEvent.stopPropagation(); }
        this.winman = winman;
        this.preventDefault = preventDefault;
        this.stopPropagation = stopPropagation;
        this.wmWindow = wmWindow;
        this.startEvent = startEvent;
        this.startPointer = startPointer;
        this.elem = startEvent.target;
        this.elem.setPointerCapture(startEvent.pointerId);
    }

    public end(event) {
        if (event) {
            if (this.preventDefault) { event.preventDefault(); }
            if (this.stopPropagation) { event.stopPropagation(); }
        }
        else {
            console.warn('Ended action without event');
        }
        this.phase = 'ended';
        this.endEvent = event;
        this.elem.releasePointerCapture(this.startEvent.pointerId);
        this.winman.onEndAction(this);
        if (this.onEnd) {
            this.onEnd();
        }
    }
}



export class ActionWithMovement extends Action {
    listenerRemovers:Map<string, Function> = new Map();
    performEvent;
    dx:number;
    dy:number;

    constructor(winman, wmWindow, startEvent, startPointer, preventDefault:boolean=true, stopPropagation:boolean=true) {
        super(winman, wmWindow, startEvent, startPointer, preventDefault, stopPropagation);

        this.listenerRemovers.set('pointermove', addEventListener(
            this.elem, 'pointermove', event => this.perform(event), {capture: true}));

        addEventListener(this.elem, 'pointercancel', event => this.end(event), {once: true, capture: true});
        addEventListener(this.elem, 'pointerup', event => this.end(event), {once: true, capture: true});
    }

    public perform(event) {
        if (this.preventDefault) { event.preventDefault(); }
        if (this.stopPropagation) { event.stopPropagation(); }
        if (this.phase == 'init') {
            this.phase = 'performing';
            this.performEvent = this.startEvent;
        }
        if (this.phase == 'performing') {
            this.dx = event.screenX - this.performEvent.screenX;
            this.dy = event.screenY - this.performEvent.screenY;
            this.performEvent = event;
        }
    }

    public end(event) {
        super.end(event);
        this.listenerRemovers.forEach(f => f());
        this.listenerRemovers.clear();
        this.winman.setWindowPosition(this.wmWindow.id);
    }
}


export class MoveAction extends ActionWithMovement {

    perform(event) {
        super.perform(event);
        if (this.phase == 'performing') {
            this.winman.moveBy(this.wmWindow.id, this.dx, this.dy);
        }
    }

}


export class ResizeAction extends ActionWithMovement {

    perform(event) {
        super.perform(event);
        if (this.phase == 'performing') {
            this.winman.resizeBy(this.wmWindow.id, this.startPointer.direction, this.dx, this.dy);
        }
    }
}
