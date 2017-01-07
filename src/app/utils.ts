import {Response} from "@angular/http";
import {Observable} from "rxjs";


/**
 * This function coerces a string into a string literal type.
 * Using tagged union types in TypeScript 2.0, this enables
 * powerful typechecking of our reducers.
 *
 * Since every action label passes through this function it
 * is a good place to ensure all of our action labels
 * are unique.
 *
 * Source: https://github.com/ngrx/example-app/blob/master/src/app/util.ts
 */

let typeCache: {[label: string]: boolean} = {};
export function type<T>(label: T | ''): T {
    if (typeCache[<string>label]) {
        throw new Error(`Action type "${label}" is not unique"`);
    }

    typeCache[<string>label] = true;

    return <T>label;
}


export function httpErrorToText(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
        let body;
        try {
            body = error.json() || '';
        }
        catch (e) {
            body = error;
        }
        const err = body.error || JSON.stringify(body);
        errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
        errMsg = error.message ? error.message : error.toString();
    }
    return errMsg;
}


export function handleHttpError(error: Response | any) {
    let errMsg = httpErrorToText(error);
    console.error('HTTP Error: ' + errMsg);
    return Observable.throw(error);
}


export class Offset {
    x: number;
    y: number;
}


export class Point {
    x: number;
    y: number;
}


export class Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}


export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | null;


export function isSet(v: any, acceptEmptyString: boolean = false): boolean {
    let b = v !== undefined && v !== null;
    if (!acceptEmptyString) {
        b = b && v !== '';
    }
    return b;
}


export function addEventListener(elem, type: string, listener?: EventListenerOrEventListenerObject, options?: boolean|{}): Function {
    elem.addEventListener(type, listener, options);
    return () => elem.removeEventListener(type, listener, options);
}


export function resizeCursor(d: Direction) {
    let cr;
    switch (d) {
        case 'N':
        case 'S':
            cr = 'ns-resize';
            break;
        case 'NE':
        case 'SW':
            cr = 'nesw-resize';
            break;
        case 'E':
        case 'W':
            cr = 'ew-resize';
            break;
        case 'NW':
        case 'SE':
            cr = 'nwse-resize';
            break;
        default:
            cr = 'auto';
    }
    return cr;
}


export function numSort(a, b) {
    return a -b;
}
