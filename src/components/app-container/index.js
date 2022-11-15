import React from 'react';
import styled from 'styled-components';
import {withRouter} from 'react-router';
import AppHeader from '../app-header';
import backgroundImage from '../../assets/background.png';

const AppContainerDiv = styled.div`
    width: 100%;
    height: 100%;
    min-height: 600px;
    margin: 0px;
    padding: 0px;
    background-image: ${`url(${backgroundImage})`};
    background-size: cover;
    display: block;
    justify-content: center;
    align-items: center;
`;

export const AppContainer = (props) => {
    const {children, location} = props;

    const changeHeader = (location.pathname.startsWith('/dashboards/') && !(location.pathname.startsWith('/dashboards/edit/')));
    return (
        <>
            <AppHeader />
            <AppContainerDiv style={{height: (changeHeader) ? 'calc(100vh - 30px)' : 'calc(100vh - 80px)'}}>
                {children}
            </AppContainerDiv>
        </>
    );
};

export default withRouter(AppContainer);
