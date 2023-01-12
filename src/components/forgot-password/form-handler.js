/*
*
* Importing the necessary modules
* e.g. React, modules from our code,
* external modules and etc.
*
*/ 
import * as Yup from 'yup';
import {validationErrors} from '../../lib/form-validations';
import {forgotPassword} from '../../api/users';
import {ToasterBottom} from '../../lib/toaster';

const {username} = validationErrors;

// Exports an object containing Yup validation to check that
// username field is required.
export const validationSchema = Yup.object(({
    username: Yup
        .string()
        .required(username.required)
}));

// Sets the submitting state to true and calls the forgotPassword(values) function, then checks
// if the request is successful and displays a toast message accordingly, navigates to a new page 
// and sets submitting state to false if there's an error during the request.
export const handleSubmit = async (values, {setSubmitting}, {pushHistory}) => {
    try {
        setSubmitting(true);
        const data = await forgotPassword(values);
        if (data.ok) {
            ToasterBottom.show({
                intent: 'success',
                message: data.message
            });
            pushHistory('/');
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: 'There was an error sending the email'
            });
        }
    } catch (error) {
        setSubmitting(false);
    }
};
