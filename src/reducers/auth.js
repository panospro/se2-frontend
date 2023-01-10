/*
* Import the necessary modules
*/
import {T, cond} from 'ramda';
import {persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import {reducer} from '../lib/redux-helpers';

const storageKey = 'codin-auth';

// Exports the initial state of user and token (empty and null) 
export const initialState = {user: {}, token: null};

// Sets the value of the user and token to the received payload.
const set = reducer('AUTH.SET', (state, {payload}) => ({
    ...state,
    user: payload.user,
    token: payload.token
}));

// Sets the value of the user and token to empty and null.
const clear = reducer('AUTH.CLEAR', (state) => ({
    ...state,
    user: {},
    token: null
}));

// Sets the value of the user to the received payload.
const setUser = reducer('AUTH.SETUSER', (state, {payload}) => ({
    ...state,
    user: payload
}));

// Assigns a default case to a variable that sets the state to a default value if it is not already set.
const defaultCase = [T, (state) => state || initialState];

// Creates a persisted reducer using the given key and storage, and the reducer is based on the given conditions.
const persistedReducer = persistReducer(
    {key: storageKey, storage},
    cond([set, clear, setUser, defaultCase])
);

// Default export persisterReducer
export default persistedReducer;
