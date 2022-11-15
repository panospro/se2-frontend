import * as Yup from 'yup';
import {
    username, password, confirm, email
} from '../../lib/form-validations';
import {createUser} from '../../api/users';
import {ToasterBottom} from '../../lib/toaster';

export const validationSchema = Yup.object(({
    username,
    password,
    confirm,
    email
}));

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
