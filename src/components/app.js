/*
* Import the necessery modules
*/
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import loadPlugins from '../plugins';
import AppContainer from './app-container';
import AppRoutes from './app-routes';
import ErrorBoundary from './error-boundary';

/*
* The entry point of the application, with two 
* props given (persistor and store).
*/
const App = ({store, persistor}) => (
    <PersistGate loading={null} persistor={persistor}>
        <Router>
            <Provider store={store}>
                <ErrorBoundary>
                    <AppContainer>
                        <AppRoutes />
                    </AppContainer>
                </ErrorBoundary>
            </Provider>
        </Router>
    </PersistGate>
);

// Default export loadPlugins given the App
export default loadPlugins(App);

