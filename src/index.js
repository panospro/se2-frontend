import React from 'react';
import ReactDOM from 'react-dom';
import {FocusStyleManager} from '@blueprintjs/core';
import App from './components/app';
import '@blueprintjs/core/lib/css/blueprint.css';
import './index.css';

FocusStyleManager.onlyShowFocusOnTabs();

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
