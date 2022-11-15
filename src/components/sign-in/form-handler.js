import * as Yup from 'yup';
import {validationConstants, validationErrors} from '../../lib/form-validations';
import {authenticateUser} from '../../api/users';

const {passwordMinLength: min} = validationConstants;
const {username, password} = validationErrors;

export const validationSchema = Yup.object(({
    username: Yup
        .string()
        .required(username.required),
    password: Yup
        .string()
        .min(min, password.minLength(min))
        .required(password.required)
}));

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
