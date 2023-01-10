/*
* Importing the necessary modules
*/ 
import {
    allPass,
    isNil,
    path,
    isEmpty,
} from 'ramda';

// Export the error form field
export const getFormErrorsField = (field, errors, touched) =>
    errors[field] && touched[field] && errors[field];

// Export if the token given is authenticated
export const checkIsAuthenticated = allPass([
    (state) => !isNil(path(['auth', 'token'], state)),
    (state) => !isEmpty(path(['auth', 'user'], state))
]);
