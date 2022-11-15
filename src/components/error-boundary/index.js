import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {path} from 'ramda';
import {ToasterBottom} from '../../lib/toaster';
import actions from '../../actions';

const haveNewError = (t, errors) => t.getToasts().length < errors.length;

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

Component.defaultProps = {errors: []};

export const mapState = (state) => ({errors: path(['ui', 'errors'], state)});

export const mapDispatch = (dispatch) => ({
    removeError: (id) => {
        dispatch(actions.ui.removeError(id));
    }
});

export default connect(
    mapState,
    mapDispatch
)(Component);
