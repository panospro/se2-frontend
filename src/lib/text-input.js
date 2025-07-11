/*
*
* Importing the necessary modules
*
*/ 
import React from 'react';
import {concat} from 'ramda';
import {InputGroup, FormGroup} from '@blueprintjs/core';
import {getFormErrorsField} from './utilities';

const flexClassName = (flex) => `flex-${String(flex).replace('.', '_')}`;

// Exports a text input field. It receives several props as arguments.
// Returns a JSX that renders FormGroup with passed props
// and inline styles and other properties of the text.
export const TextInput = ({
    formikProps: {errors, touched, handleChange, handleBlur, values},
    id,
    name,
    type,
    leftIcon,
    placeholder,
    rightElement,
    label,
    inline,
    labelFlex,
    contentFlex,
    intent,
    fill,
    className,
    contentClassName,
    inputGroupClassName,
    disabled,
    width
}) => (
    <FormGroup
        className={concat(className, labelFlex ? ` ${flexClassName(labelFlex)}` : '')}
        contentClassName={concat(
            contentClassName,
            contentFlex ? ` ${flexClassName(contentFlex)}` : ''
        )}
        label={label}
        inline={inline}
        intent={getFormErrorsField(name, errors, touched) ? 'danger' : intent}
        helperText={getFormErrorsField(name, errors, touched)}
        style={{width}}
    >
        <InputGroup
            id={id}
            className={inputGroupClassName}
            type={type}
            name={name}
            leftIcon={leftIcon}
            placeholder={placeholder}
            rightElement={rightElement}
            intent={getFormErrorsField(name, errors, touched) ? 'danger' : intent}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values[name]}
            fill={fill}
            large
            disabled={disabled}
        />
    </FormGroup>
);

// Set the text input default props
TextInput.defaultProps = {
    type: 'text',
    placeholder: '',
    leftIcon: false,
    label: null,
    inline: false,
    labelFlex: null,
    contentFlex: null,
    intent: 'none',
    className: '',
    contentClassName: '',
    fill: false
};

/*
*
* Default export
*
*/
// The export constant is: 
// TextInput
export default TextInput;
