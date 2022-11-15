/* eslint-disable max-len */
import React from 'react';
import styled from 'styled-components';
import {Button, Icon} from '@blueprintjs/core';

const OrangeButtonStyle = styled(Button)`
    color: white;
    background: #FF9D66!important;
    border: 0px!important;
    box-shadow: none!important;
    border-radius: 5px;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    :hover:enabled& {
        background: #ff7e33!important;
    }
    &:active:enabled {
      position: relative;
      top: 1px;
    }
`;

const OrangeBorderButtonStyle = styled(Button)`
    color: white;
    background: #FF9D66!important;
    border: 2px solid #ff7e33;
    box-shadow: none!important;
    border-radius: 5px;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    :hover& {
        background: #ff7e33!important;
    }
    &:active {
      position: relative;
      top: 1px;
    }
`;

const CustomButtonStyle = styled(Button)`
    color: ${(props) => props.color || 'white'};
    background: ${(props) => props.background || '#FF9D66!important'};
    border: ${(props) => `2px solid ${props.backgroundHover}` || '2px solid #ff7e33'};
    box-shadow: none!important;
    border-radius: 5px;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    :hover& {
        background: ${(props) => props.backgroundHover || '#ff7e33!important'};
    }
    &:active {
      position: relative;
      top: 1px;
    }
`;

const OrangeOnlyBorderButtonStyle = styled(Button)`
    color: #FF9D66!important;
    background: none!important;
    border: 2px solid #FF9D66;
    box-shadow: none!important;
    border-radius: 5px;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    :hover& {
        background: #ff7e33!important;
        border: 0px!important;
        color: white!important;
    }
    &:active {
      position: relative;
      top: 1px;
    }
`;

const RedButtonStyle = styled(Button)`
    color: white;
    background: #DE162F!important;
    border: 0px!important;
    box-shadow: none!important;
    border-radius: 5px;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    :hover& {
        background: #ba1226!important;
    }
    &:active {
      position: relative;
      top: 1px;
    }
`;

const RedBorderButtonStyle = styled(Button)`
    color: #DE162F!important;
    background: none!important;
    border: 2px solid #DE162F!important;
    box-shadow: none!important;
    border-radius: 5px; 
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    :hover& {
        background: #DE162F!important;
        border: 0px solid #DE162F!important;
        color: white!important;
    }
    &:active {
      position: relative;
      top: 1px;
    }
`;

const GreenButtonStyle = styled(Button)`
    color: white;
    background: #7ABF43!important;
    border: 0px!important;
    box-shadow: none!important;
    border-radius: 5px;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    :hover& {
        background: #6dab3b!important;
    }
    &:active {
      position: relative;
      top: 1px;
    }
`;

const BlueButtonStyle = styled(Button)`
    color: white;
    background: #16335B!important;
    border: 0px!important;
    box-shadow: none!important;
    border-radius: 5px;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    :hover& {
        background: #0f223e!important;
    }
    &:active {
      position: relative;
      top: 1px;
    }
`;

const BlueBorderButtonStyle = styled(Button)`
    color: #16335B!important;
    background: white!important;
    border: 2px solid #16335B!important;
    box-shadow: none!important;
    border-radius: 5px;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    :hover& {
        background: #e6e6e6!important;
    }
    &:active {
      position: relative;
      top: 1px;
    }
`;

const CollapseButtonStyle = styled(Button)`
    color: white;
    background: none!important;
    border: none!important;
    box-shadow: none!important;
    border-radius: 5px;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    display: flex;
    justify-content: flex-start;
    cursor: pointer;
    padding: 0px;
    :hover& {
        color: #FF9D66!important;
    }
`;

export const OrangeButton = ({
    children,
    type,
    disabled,
    loading,
    icon,
    form,
    width,
    height,
    onClick,
    ...props
}) => (
    <OrangeButtonStyle
        type={type}
        disabled={disabled}
        form={form}
        onClick={onClick}
        loading={loading}
        icon={icon}
        style={{
            width: width || '120px',
            height: height || '35px',
            cursor: (disabled) ? 'not-allowed' : 'pointer',
            ...props
        }}
        intent="primary"
    >
        {children}
    </OrangeButtonStyle>
);

export const CollapseButton = ({
    id,
    children,
    icon,
    width,
    height,
    onClick,
    ...props
}) => {
    const h = (!height) ? 35 : parseInt(height.split('px')[0], 10);
    return (
        <CollapseButtonStyle
            id={id}
            onClick={onClick}
            className="custom-collapse"
            style={{
                width: width || '120px',
                height: height || '35px',
                ...props
            }}
            intent="primary"
            onMouseOver={() => { document.getElementById(`${id}_icon`).style.color = '#FF9D66'; }}
            onMouseOut={() => { document.getElementById(`${id}_icon`).style.color = 'white'; }}
        >
            <div
                id={`${id}_icon`}
                style={{
                    width: `${h}px`, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                }}
            >
                <Icon icon={icon} iconSize="22" />
            </div>
            <div style={{
                width: `calc(100% - ${h}px)`, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            >
                {children}
            </div>
        </CollapseButtonStyle>
    );
};

export const OrangeBorderButton = ({
    children,
    type,
    disabled,
    loading,
    icon,
    form,
    width,
    height,
    onClick,
    ...props
}) => (
    <OrangeBorderButtonStyle
        type={type}
        disabled={disabled}
        form={form}
        onClick={onClick}
        loading={loading}
        icon={icon}
        style={{
            width: width || '120px',
            height: height || '35px',
            cursor: (disabled) ? 'not-allowed' : 'pointer',
            ...props
        }}
        intent="primary"
    >
        {children}
    </OrangeBorderButtonStyle>
);

export const CustomButton = ({
    children,
    type,
    disabled,
    loading,
    icon,
    form,
    width,
    height,
    onClick,
    color,
    background,
    backgroundHover,
    ...props
}) => (
    <CustomButtonStyle
        type={type}
        disabled={disabled}
        form={form}
        onClick={onClick}
        loading={loading}
        icon={icon}
        style={{
            width: width || '120px',
            height: height || '35px',
            cursor: (disabled) ? 'not-allowed' : 'pointer',
            ...props
        }}
        intent="primary"
        color={color}
        background={background}
        backgroundHover={backgroundHover}
    >
        {children}
    </CustomButtonStyle>
);

export const OrangeOnlyBorderButton = ({
    children,
    type,
    disabled,
    loading,
    icon,
    form,
    width,
    height,
    onClick,
    ...props
}) => (
    <OrangeOnlyBorderButtonStyle
        type={type}
        disabled={disabled}
        form={form}
        onClick={onClick}
        loading={loading}
        icon={icon}
        style={{
            width: width || '120px',
            height: height || '35px',
            cursor: (disabled) ? 'not-allowed' : 'pointer',
            ...props
        }}
        intent="primary"
    >
        {children}
    </OrangeOnlyBorderButtonStyle>
);

export const RedButton = ({
    children,
    type,
    disabled,
    loading,
    form,
    width,
    height,
    onClick,
    ...props
}) => (
    <RedButtonStyle
        type={type}
        disabled={disabled}
        form={form}
        onClick={onClick}
        loading={loading}
        style={{
            width: width || '120px',
            height: height || '35px',
            cursor: (disabled) ? 'not-allowed' : 'pointer',
            ...props
        }}
        intent="primary"
    >
        {children}
    </RedButtonStyle>
);

export const RedBorderButton = ({
    children,
    type,
    disabled,
    loading,
    form,
    width,
    height,
    onClick,
    ...props
}) => (
    <RedBorderButtonStyle
        type={type}
        disabled={disabled}
        form={form}
        onClick={onClick}
        loading={loading}
        style={{
            width: width || '120px',
            height: height || '35px',
            cursor: (disabled) ? 'not-allowed' : 'pointer',
            ...props
        }}
        intent="primary"
    >
        {children}
    </RedBorderButtonStyle>
);

export const GreenButton = ({
    children,
    type,
    disabled,
    loading,
    form,
    width,
    height,
    onClick,
    ...props
}) => (
    <GreenButtonStyle
        type={type}
        disabled={disabled}
        form={form}
        onClick={onClick}
        loading={loading}
        style={{
            width: width || '120px',
            height: height || '35px',
            cursor: (disabled) ? 'not-allowed' : 'pointer',
            ...props
        }}
        intent="primary"
    >
        {children}
    </GreenButtonStyle>
);

export const BlueButton = ({
    children,
    type,
    disabled,
    loading,
    form,
    width,
    height,
    onClick,
    ...props
}) => (
    <BlueButtonStyle
        type={type}
        disabled={disabled}
        form={form}
        onClick={onClick}
        loading={loading}
        style={{
            width: width || '120px',
            height: height || '35px',
            cursor: (disabled) ? 'not-allowed' : 'pointer',
            ...props
        }}
        intent="primary"
    >
        {children}
    </BlueButtonStyle>
);

export const BlueBorderButton = ({
    children,
    type,
    disabled,
    loading,
    form,
    width,
    height,
    onClick,
    rightIcon,
    ...props
}) => (
    <BlueBorderButtonStyle
        type={type}
        disabled={disabled}
        form={form}
        onClick={onClick}
        rightIcon={rightIcon}
        loading={loading}
        style={{
            width: width || '120px',
            height: height || '35px',
            cursor: (disabled) ? 'not-allowed' : 'pointer',
            ...props
        }}
        intent="primary"
    >
        {children}
    </BlueBorderButtonStyle>
);
