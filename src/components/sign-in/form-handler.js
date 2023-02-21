/*
*
* Importing the necessary modules
* e.g. React, modules from our code,
* external modules and etc.
*
*/ 
import * as Yup from 'yup';
import {validationConstants, validationErrors} from '../../lib/form-validations';
import {authenticateUser} from '../../api/users';

const {passwordMinLength: min} = validationConstants;
const {username, password} = validationErrors;

// Export a validation object with username as string and required and password as string, with minimum length and required
export const validationSchema = Yup.object(({
    username: Yup
        .string()
        .required(username.required),
    password: Yup
        .string()
        .min(min, password.minLength(min))
        .required(password.required)
}));

// Export the handle of submits, which sets to auth the data and pushhistory to /home
export const handleSubmit = async (values, {setSubmitting}, {setAuth, pushHistory}) => {
    try {
        setSubmitting(true);
        const data = await authenticateUser(values);
        setAuth(data);
        pushHistory('/home');
    } catch (error) {
        setSubmitting(false);
    }
};
