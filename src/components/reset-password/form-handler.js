/*
*
* Importing the necessary modules
*
*/ 
import * as Yup from 'yup';
import {password, confirm} from '../../lib/form-validations';
import {changePassword} from '../../api/users';
import {ToasterBottom} from '../../lib/toaster';

// Export an object with password and the confirmation variable
export const validationSchema = Yup.object(({
    password,
    confirm
}));

// Export a validation of the form values. It shows success toast, navigates to root page and sets the
// submitting state to false, with potential error handling of setting the submitting state to false too.
export const handleSubmit = async (values, {setSubmitting}, token, {pushHistory}) => {
    try {
        const castValues = validationSchema.cast(values);
        await changePassword(castValues, token);
        ToasterBottom.show({
            message: 'Password has changed',
            intent: 'success',
            icon: 'tick',
            timeout: 1500

        });
        pushHistory('/');
        setSubmitting(false);
    } catch (error) { }
    setSubmitting(false);
};
