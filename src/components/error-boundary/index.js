/*
* Importing the necessary modules
*/
import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {path} from 'ramda';
import {ToasterBottom} from '../../lib/toaster';
import actions from '../../actions';

// Compares the length of t.getToasts() and errors passed, returns true if the errors passed is greater than the toasts length.
const haveNewError = (t, errors) => t.getToasts().length < errors.length;

// Checks if there are new errors and if there is it display them as toasts and call removeError callback when dismissed
export const Component = ({errors, children, removeError}) => {
    useEffect(() => {
        if (errors && haveNewError(ToasterBottom, errors)) {
            const error = errors[errors.length - 1];
            if (error) {
                ToasterBottom.show({
                    intent: 'danger',
                    message: error.message || 'An error has occured!',
                    onDismiss: () => {
                        removeError(error.id);
                    }
                });
            }
        }
    }, [errors]);
    return <>{children}</>;
};

// Sets the default value for errors prop
Component.defaultProps = {errors: []};

// Extracts errors from the store by returning an object with errors key set to the value of state.ui.errors
export const mapState = (state) => ({errors: path(['ui', 'errors'], state)});

// Creates an object with removeError key, which is a function that dispatches the removeError action with error id.
export const mapDispatch = (dispatch) => ({
    removeError: (id) => {
        dispatch(actions.ui.removeError(id));
    }
});

// Connects the react component to the store, making errors available to the component.
export default connect(
    mapState,
    mapDispatch
)(Component);
