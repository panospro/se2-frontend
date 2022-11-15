import {T, cond} from 'ramda';
import shortid from 'shortid';
import {reducer} from '../lib/redux-helpers';

export const initialState = {errors: []};

const addError = reducer('UI.ADD_ERROR', (state, {payload}) => ({
    ...state,
    errors: state.errors.concat([{...payload, id: shortid.generate()}])
}));

const removeError = reducer('UI.REMOVE_ERROR', (state, {payload: id}) => ({
    ...state,
    errors: state.errors.filter((error) => error.id !== id)
}));

const defaultCase = [T, (state) => state || initialState];

export default cond([addError, removeError, defaultCase]);
