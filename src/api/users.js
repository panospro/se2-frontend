/* eslint-disable max-len */
import {api, prefixUrl} from '../lib/api-adapter';

const usersApi = api.extend({prefixUrl: prefixUrl('users')});

export const authenticateUser = (data) => usersApi.post('authenticate', {json: data}).json();

export const forgotPassword = (data) => usersApi.post('resetpassword', {json: data}).json();

export const changePassword = (data, token) => usersApi.post('changepassword', {
    json: data,
    headers: {Authorization: `Bearer ${token}`}
}).json();

export const createUser = (data) => usersApi.post('create', {json: data}).json();
