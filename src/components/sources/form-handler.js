import * as Yup from 'yup';
import {validationErrors} from '../../lib/form-validations';

const {name, url, login, passcode, type} = validationErrors;

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

export const handleSubmit = async (values, {setSubmitting}, {saveFormPopup}) => {
    try {
        setSubmitting(true);
        saveFormPopup(values);
    } catch (error) {
        setSubmitting(false);
    }
};
