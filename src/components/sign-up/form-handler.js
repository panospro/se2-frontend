/*
* Importing the necessary modules
*/
import * as Yup from 'yup';
import {
    username, password, confirm, email
} from '../../lib/form-validations';
import {createUser} from '../../api/users';
import {ToasterBottom} from '../../lib/toaster';

// Export a validation object with username, password, confirm and email
export const validationSchema = Yup.object(({
    username,
    password,
    confirm,
    email
}));

// Export the handle of submits.
export const handleSubmit = async (values, {setSubmitting}, {pushHistory}) => {
    try {
        const castValues = {...validationSchema.cast(values)};
        await createUser(castValues);
        ToasterBottom.show({
            intent: 'success',
            message: 'New user was created successfully'
        });
        pushHistory('/');
    } catch (error) {
        setSubmitting(false);
    }
};
