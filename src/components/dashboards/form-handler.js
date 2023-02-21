/*
*
* Importing the necessary modules
*
*/ 
import * as Yup from 'yup';
import {validationErrors} from '../../lib/form-validations';

const {name} = validationErrors;

// Defines an object with a single , name, which is a string. The string is required and must be present, as
// indicated. The code also uses a Yup object to define a validation schema.
// This schema ensures that the name  is a required string. The code may be used to validate form input values to ensure that they
// meet certain requirements before being submitted.
export const validationSchema = Yup.object(({
    name: Yup
        .string()
        .required(name.required)
}));

// Defines a function that will be called when a form is submitted. It sets the form's submitting 
// state to true and calls the saveFormPopup function with the values passed to the form. If an error occurs, it sets the form's submitting state to false
export const handleSubmit = async (values, {setSubmitting}, {saveFormPopup}) => {
    try {
        setSubmitting(true);
        saveFormPopup(values);
    } catch (error) {
        setSubmitting(false);
    }
};
