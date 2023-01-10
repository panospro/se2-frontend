/* eslint-disable max-len */
/* eslint-disable react/react-in-jsx-scope */

/*
* Importing the necessary modules
*/ 
import {
    Classes, Overlay, Spinner
} from '@blueprintjs/core';
import styled from 'styled-components';
import classNames from 'classnames';

// Style WholeScreen
const WholeScreen = styled.div`
    width: 100%;
    height: 100%;
    overflow-x: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

// Style WholeOverflowScreen
const WholeOverflowScreen = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
`;

// Style MainBox
const MainBox = styled.div`
    background: radial-gradient(#313132, #030305);
    padding: 20px;
    box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.25);
    border-radius: 10px;
    color: white;
`;

// Stores the names of the class
const classes = classNames(
    Classes.OVERLAY_SCROLL_CONTAINER
);

// Exports an overflow overlay. It receives several props as arguments. Returns a JSX that renders
// WholeOverflowScreen with passed props and inline styles and other properties of the button. 
export const OverflowOverlay = ({
    children,
    id,
    width,
    height,
    isOpen,
    ...props
}) => (
    <Overlay key={id} className={classes} isOpen={isOpen} usePortal={false} transitionDuration={0} canEscapeKeyClose={false} canOutsideClickClose={false}>
        <WholeOverflowScreen>
            <MainBox style={{
                width: width || '500px',
                height: height || '250px',
                margin: 'auto',
                ...props
            }}
            >
                {children}
            </MainBox>
        </WholeOverflowScreen>
    </Overlay>
);

// Exports a portal overflow overlay. It receives several props as arguments. Returns a JSX that renders
// WholeOverflowScreen with passed props and inline styles and other properties of the button. 
export const PortalOverflowOverlay = ({
    children,
    id,
    width,
    height,
    isOpen,
    ...props
}) => (
    <Overlay key={id} className={classes} isOpen={isOpen} usePortal transitionDuration={0} canEscapeKeyClose={false} canOutsideClickClose={false}>
        <WholeOverflowScreen onMouseDown={(e) => e.stopPropagation()}>
            <MainBox style={{
                width: width || '500px',
                height: height || '250px',
                margin: 'auto',
                ...props
            }}
            >
                {children}
            </MainBox>
        </WholeOverflowScreen>
    </Overlay>
);

// Exports a custom spinner. It receives several props as arguments. Returns a JSX that renders
// WholeScreen with passed props and inline styles and other properties of the button. 
export const CustomSpinner = ({isOpen}) => (
    <Overlay key="spinnerOverlay" className={classes} isOpen={isOpen} usePortal transitionDuration={0} canEscapeKeyClose={false} canOutsideClickClose={false}>
        <WholeScreen>
            <Spinner intent="primary" size={100} />
        </WholeScreen>
    </Overlay>
);
