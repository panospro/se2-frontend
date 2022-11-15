import * as Yup from 'yup';
import {password, confirm} from '../../lib/form-validations';
import {changePassword} from '../../api/users';
import {ToasterBottom} from '../../lib/toaster';

export const validationSchema = Yup.object(({
    password,
    confirm
}));

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
