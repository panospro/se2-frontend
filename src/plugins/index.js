/*
* Import ramda and initialize-store and export a compose version of initializeStore.
*/
import {compose} from 'ramda';
import initializeStore from './initialize-store';

const loadPlugins = compose(initializeStore);

export default loadPlugins;
