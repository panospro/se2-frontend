import {compose} from 'ramda';
import initializeStore from './initialize-store';

const loadPlugins = compose(initializeStore);

export default loadPlugins;
