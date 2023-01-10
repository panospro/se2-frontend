/* eslint-disable max-len */

/*
* Importing the necessary modules
*/ 
import * as Yup from 'yup';

export const validationConstants = {passwordMinLength: 5};

// An object that contains the error messages for different
// parts that are used in the application.
export const validationErrors = {
    username: {required: 'Username is required'},
    password: {
        required: 'Password is required',
        minLength: (min) => `Password should contain at least ${min} characters`
    },
    type: {required: 'Broker type is required'},
    name: {required: 'Name is required'},
    url: {required: 'Url is required'},
    login: {required: 'Login is required'},
    passcode: {required: 'Passcode is required'},
    vhost: {required: 'Vhost is required'}
};

// Yup password, it requires a string of minimum length and is required.
export const password = Yup
    .string()
    .trim()
    .min(validationConstants.passwordMinLength, `Password should contain at least ${validationConstants.passwordMinLength} characters`)
    .required('Password is required');

// Yup confirm password, it requires the field to match with the password field.
export const confirm = password
    .oneOf([Yup.ref('password')], "Passwords don't match");

// Yup email, it requires a string to be a valid email and is required.
export const email = Yup
    .string()
    .trim()
    .email('Invalid e-mail')
    .required('Email is required');

// Yup username, it requires a string and is required.
export const username = Yup
    .string()
    .trim()
    .required('Username is required');
