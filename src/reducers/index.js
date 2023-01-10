/*
* Import and export the combine reducers of auth and ui
*/
import {combineReducers} from 'redux';
import auth from './auth';
import ui from './ui';

export default combineReducers({auth, ui});
