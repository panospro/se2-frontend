/*
* Import the necessary modules
*/
import React from 'react';
import ReactDOM from 'react-dom';
import {FocusStyleManager} from '@blueprintjs/core';
import App from './components/app';
import '@blueprintjs/core/lib/css/blueprint.css';
import './index.css';

// Sets the FocusStyleManager to only show focus on tabs.
FocusStyleManager.onlyShowFocusOnTabs();

// Renders the App component to the root element in the DOM.
ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
