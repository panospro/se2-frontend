/* eslint-disable max-len */
// import {api, prefixUrl} from '../lib/api-adapter';

// const usersApi = api.extend({prefixUrl: prefixUrl('users')});

// // Sends a POST request to authenticate, with a JSON body containing data for the user, to authenticate a user.
// export const authenticateUser = (data) => usersApi.post('authenticate', {json: data}).json();

// // Sends a POST request to resetpassword, with a JSON body containing data for the user, to reset a user's password.
// export const forgotPassword = (data) => usersApi.post('resetpassword', {json: data}).json();

// // Sends a POST request to changepassword, with a JSON body containing data for the user and an Authorization header containing a token, to change a user's password.
// export const changePassword = (data, token) => usersApi.post('changepassword', {
//     json: data,
//     headers: {Authorization: `Bearer ${token}`}
// }).json();

// // Sends a POST request to create, with a JSON body containing data for the new user, to create a new user. 
// export const createUser = (data) => usersApi.post('create', {json: data}).json();

/* eslint-disable max-len */
import {api, prefixUrl} from '../lib/api-adapter';

const usersApi = api.extend({prefixUrl: prefixUrl('users')});

/**
 * Authenticates a user with the provided data.
 * 
 * @param {Object} userData - The data to be sent as JSON in the request body.
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
 */
export const authenticateUser = (userData) =>
  usersApi.post('authenticate', {json: userData}).json();

/**
 * Resets the password for the user with the provided email.
 * 
 * @param {Object} userData - The data to be sent as JSON in the request body.
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
 */
export const forgotPassword = (userData) =>
  usersApi.post('resetpassword', {json: userData}).json();

/**
 * Changes the password for the user with the provided token.
 * 
 * @param {Object} userData - The data to be sent as JSON in the request body.
 * @param {string} token - The token to be sent as a bearer token in the request headers.
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
 */
export const changePassword = (userData, token) =>
  usersApi.post('changepassword', {
    json: userData,
    headers: {Authorization: `Bearer ${token}`}
  }).json();

/**
 * Creates a new user with the provided data.
 * 
 * @param {Object} userData - The data to be sent as JSON in the request body.
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
 */
export const createUser = (userData) =>
  usersApi.post('create', {json: userData}).json();
