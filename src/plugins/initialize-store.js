/*
* Import the necessery modules
*/
import {compose, createStore} from 'redux';
import {persistStore} from 'redux-persist';
import rootReducer from '../reducers';

// Checks to see if the window object has an extension on it that allows for the use.
// If it does, then it uses the Redux DevTools extension, otherwise it uses the compose function.
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Creates a store and a persistor and returns them as an object.
const create = (reducer, initialState) => {
    const store = createStore(reducer, initialState, composeEnhancers());
    const persistor = persistStore(store);

    return {store, persistor};
};

// Sets the initial state of auth
const {store, persistor} = create(rootReducer, {
    auth: {
        user: {},
        token: null
    }
});

// Initializes a store object with the given configuration and then passes it to the next function.
const initializeStore = (next) => (configuration) => next({...configuration, store, persistor});

// Export store and persistor as one object and default export initializeStore
export {store, persistor};
export default initializeStore;
