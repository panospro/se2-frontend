import * as Yup from 'yup';
import {validationErrors} from '../../lib/form-validations';

const {name} = validationErrors;

export const validationSchema = Yup.object(({
    name: Yup
        .string()
        .required(name.required)
}));

export const handleSubmit = async (values, {setSubmitting}, {saveFormPopup}) => {
    try {
        setSubmitting(true);
        saveFormPopup(values);
    } catch (error) {
        setSubmitting(false);
    }
};
