/* eslint-disable max-len */
/* eslint-disable react/react-in-jsx-scope */
import {
    Classes, Overlay, Spinner
} from '@blueprintjs/core';
import styled from 'styled-components';
import classNames from 'classnames';

const WholeScreen = styled.div`
    width: 100%;
    height: 100%;
    overflow-x: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

const WholeOverflowScreen = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
`;

const MainBox = styled.div`
    background: radial-gradient(#313132, #030305);
    padding: 20px;
    box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.25);
    border-radius: 10px;
    color: white;
`;

const classes = classNames(
    Classes.OVERLAY_SCROLL_CONTAINER
);

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

export const CustomSpinner = ({isOpen}) => (
    <Overlay key="spinnerOverlay" className={classes} isOpen={isOpen} usePortal transitionDuration={0} canEscapeKeyClose={false} canOutsideClickClose={false}>
        <WholeScreen>
            <Spinner intent="primary" size={100} />
        </WholeScreen>
    </Overlay>
);
