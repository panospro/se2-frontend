/*
*
* Importing the necessary modules
* e.g. React, modules from our code,
* external modules and etc.
*
*/ 
import * as Yup from 'yup';
import {validationErrors} from '../../lib/form-validations';

const {name, url, login, passcode, type} = validationErrors;

// Export a validation object with name, type, url, login and passcode
export const validationSchema = Yup.object(({
    name: Yup
        .string()
        .required(name.required),
    type: Yup
        .string()
        .required(type.required),
    url: Yup
        .string()
        .required(url.required),
    login: Yup
        .string()
        .required(login.required),
    passcode: Yup
        .string()
        .required(passcode.required)
}));

// Export the handle of submits.
export const handleSubmit = async (values, {setSubmitting}, {saveFormPopup}) => {
    try {
        setSubmitting(true);
        saveFormPopup(values);
    } catch (error) {
        setSubmitting(false);
    }
};
