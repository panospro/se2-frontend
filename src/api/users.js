/* eslint-disable max-len */
import {api, prefixUrl} from '../lib/api-adapter';

const usersApi = api.extend({prefixUrl: prefixUrl('users')});

// Sends a POST request to authenticate, with a JSON body containing data for the user, to authenticate a user.
export const authenticateUser = (data) => usersApi.post('authenticate', {json: data}).json();

// Sends a POST request to resetpassword, with a JSON body containing data for the user, to reset a user's password.
export const forgotPassword = (data) => usersApi.post('resetpassword', {json: data}).json();

// Sends a POST request to changepassword, with a JSON body containing data for the user and an Authorization header containing a token, to change a user's password.
export const changePassword = (data, token) => usersApi.post('changepassword', {
    json: data,
    headers: {Authorization: `Bearer ${token}`}
}).json();

// Sends a POST request to create, with a JSON body containing data for the new user, to create a new user. 
export const createUser = (data) => usersApi.post('create', {json: data}).json();
