import React from 'react';
import styled from 'styled-components';
import {withRouter} from 'react-router';
import AppHeader from '../app-header';
import backgroundImage from '../../assets/background.png';

// Style the container element with a specific width, height and background image etc.
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
    // Destructure the following variables
    const {children, location} = props;
    // Set to true if the current location is a dashboard view  (i.e., the path starts with /dashboards/) 
    // but not an edit view (i.e., the path does not start with /dashboards/edit/).
    const changeHeader = (location.pathname.startsWith('/dashboards/') && !(location.pathname.startsWith('/dashboards/edit/')));
    
    // Style the component. The height of the element is controlled by changeHeader.  The visibility of the header is
    //  controlled by the changeHeader variable,
    // which is set to true if the current location is a dashboard view (i.e., the path starts with /dashboards/) but not 
    // an edit view (i.e., the path does not start with /dashboards/edit/).
    return (
        <>
            <AppHeader />
            <AppContainerDiv style={{height: (changeHeader) ? 'calc(100vh - 30px)' : 'calc(100vh - 80px)'}}>
                {children}
            </AppContainerDiv>
        </>
    );
};

/*
*
* Default export
*
*/
// The export constant is: 
// of withRouter with AppContainer as argument
export default withRouter(AppContainer);
