import {compose, createStore} from 'redux';
import {persistStore} from 'redux-persist';
import rootReducer from '../reducers';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const create = (reducer, initialState) => {
    const store = createStore(reducer, initialState, composeEnhancers());
    const persistor = persistStore(store);

    return {store, persistor};
};

const {store, persistor} = create(rootReducer, {
    auth: {
        user: {},
        token: null
    }
});

const initializeStore = (next) => (configuration) => next({...configuration, store, persistor});

export {store, persistor};
export default initializeStore;
