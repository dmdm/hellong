import {createSelector} from 'reselect';
import {ActionReducer} from '@ngrx/store';
import {environment} from '../../environments/environment';

import {compose} from '@ngrx/core/compose';
import {storeFreeze} from 'ngrx-store-freeze';
import {combineReducers} from '@ngrx/store';


import * as fromAuthUser from '../auth/reducers';
import * as fromDesktop from '../desktop/store.reducers';


export interface State {
    authUser: fromAuthUser.State;
    desktop: fromDesktop.State;
}


const reducers = {
    authUser: fromAuthUser.reducer,
    desktop: fromDesktop.reducer,
};


const developmentReducer: ActionReducer<State> = compose(storeFreeze, combineReducers)(reducers);
const productionReducer: ActionReducer<State> = combineReducers(reducers);


export function reducer(state: any, action: any) {
    if (environment.production) {
        return productionReducer(state, action);
    }
    else {
        return developmentReducer(state, action);
    }
}


export const getAuthUserState = (state: State) => state.authUser;

export const getCredentials = createSelector(getAuthUserState, fromAuthUser.getCredentials);
export const getUsername = createSelector(getAuthUserState, fromAuthUser.getUsername);
export const getJwt = createSelector(getAuthUserState, fromAuthUser.getJwt);
export const getJwtTime = createSelector(getAuthUserState, fromAuthUser.getJwtTime);
export const getGroups = createSelector(getAuthUserState, fromAuthUser.getGroups);


export const getDesktop = (state: State) => state.desktop;
export const getWmWindows = createSelector(getDesktop, fromDesktop.getWmWindows);
export const getWmWindowList = createSelector(getDesktop, fromDesktop.getWmWindowList);
export const getWmWindowIds = createSelector(getDesktop, fromDesktop.getIds);
