import * as Yup from 'yup';
import {validationErrors} from '../../lib/form-validations';
import {forgotPassword} from '../../api/users';
import {ToasterBottom} from '../../lib/toaster';

const {username} = validationErrors;

export const validationSchema = Yup.object(({
    username: Yup
        .string()
        .required(username.required)
}));

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
