import {
    allPass,
    isNil,
    path,
    isEmpty,
} from 'ramda';

export const getFormErrorsField = (field, errors, touched) =>
    errors[field] && touched[field] && errors[field];

export const checkIsAuthenticated = allPass([
    (state) => !isNil(path(['auth', 'token'], state)),
    (state) => !isEmpty(path(['auth', 'user'], state))
]);
