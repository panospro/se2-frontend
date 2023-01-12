/* eslint-disable max-len */

/*
*
* Importing the necessary modules
*
*/ 
import ky from 'ky';
import {path} from 'ramda';
import {store} from '../plugins/initialize-store';
import actions from '../actions';
import {checkIsAuthenticated} from './utilities';
import {ToasterBottom} from './toaster';

const serverUrl = process.env.REACT_APP_SERVER_URL;

// Τakes a route and returns a URL that is prefixed with a server URL and the route.
export const prefixUrl = (route) => `${serverUrl}/${route}`;

// Creates an API client and sets a timeout of 20 seconds, it also attaches two hooks beforeRequest, afterResponse.
// It provides a common way of handling errors and common behavior that is needed across different requests.
// beforeRequest sets the Authorization for each request with the user's token.
// afterResponse handles the error messages of failed responses, it clears token and redirects to
// the login page in case of token related errors otherwise it adds the error to the store.
export const api = ky.create({
    timeout: 20000,
    hooks: {
        beforeRequest: [
            (req) => {
                const state = store.getState();
                if (checkIsAuthenticated(state)) {
                    req.headers.set('Authorization', `Bearer ${path(['auth', 'token'], state)}`);
                }
            }
        ],
        afterResponse: [
            async (_request, __options, response) => {
                try {
                    if (!response.ok) {
                        const json = await response.json();
                        if (json.status === 401 && (json.message === 'TokenExpiredError' || json.message === 'TokenMissing' || json.message === 'NoVerifyToken')) {
                            store.dispatch(actions.auth.clear());
                            ToasterBottom.show({
                                intent: 'danger',
                                message: 'Token has expired. Please sign in again.'
                            });
                        } else {
                            store.dispatch(actions.ui.addError(json));
                        }
                    }
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error(error);
                }
                return response;
            }
        ]
    }
});
