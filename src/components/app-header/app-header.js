/* eslint-disable max-len */
/* eslint-disable react/no-did-update-set-state */

/*
* Import several modules
*/
import React from 'react';
import {Box} from 'rebass';
import styled from 'styled-components';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {
    Button, Text, Tooltip
} from '@blueprintjs/core';
import {checkIsAuthenticated} from '../../lib/utilities';
import actions from '../../actions';
import logo from '../../assets/logo.png';
import logoWhite from '../../assets/logoWhite.png';
// import sourcesIcon from '../../assets/sourceBlue.png';
// import dashboardIcon from '../../assets/dashboardBlue.png';
import logoutIcon from '../../assets/logout.png';
import homeIcon from '../../assets/home.png';
// import sourcesWhiteIcon from '../../assets/sourceWhite.png';
// import dashboardWhiteIcon from '../../assets/dashboardWhite.png';
import logoutWhiteIcon from '../../assets/logoutWhite.png';
import homeWhiteIcon from '../../assets/homeWhite.png';

// Style the StyledBox
const StyledBox = styled(Box)`
    width: 100%;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
`;

// Style the StyledIcon
const StyledIcon = styled.img`
    max-height: 100%;
    cursor: pointer;
    margin-left: 10px;
    padding: 5px;
`;

// Style the ButtonsDiv
const ButtonsDiv = styled.div`
    height: 100%;
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
`;

// Style the StyledButtonIcon
const StyledButtonIcon = styled.img.attrs((props) => ({src: props.icon}))`
    position: relative;
`;

// Style the StyledText
const StyledText = styled(Text)`
    color: #16335B;
    font-size: 16px;
    text-align: center;
    font-weight: 550;
`;

// Function that returns JSX. Takes six properties: text, info, icon, iconWhite, handler and changeHeader.
const ButtonWithText = ({text, info, icon, iconWhite, handler, changeHeader}) => (
    // Tooltip is wrapped around a Button and is styled to the Button. These styles will set textAlign to center and the width and height of StyledButtonIcon 
    // to either 20px or 40px depending on the value of changeHeader. Then the also renders some JSX based on the value of changeHeader. 
    // If the value is true, the will not render the StyledText. If the value of changeHeader is false, 
    // the will render the StyledText with the text passed to it as the content.
    <Tooltip
        key={`tooltip_${text}`}
        popoverClassName="item-info-tooltip"
        disabled={(info === null) || !changeHeader}
        content={info}
        interactionKind="hover"
    >
        <Button key={`button_${text}`} className={(changeHeader) ? 'header-buttons' : ''} minimal onClick={handler} style={{textAlign: 'center'}}>
            <StyledButtonIcon key={`icon_${text}`} style={{width: (changeHeader) ? '20px' : '40px', height: (changeHeader) ? '20px' : '40px'}} icon={(changeHeader) ? iconWhite : icon} />
            {!changeHeader && (<StyledText key={`text_${text}`}>{text}</StyledText>)}
        </Button>
    </Tooltip>
);

// Class that represents a header in a React app.
export class AppHeader extends React.Component {
    // A constructor that sets up the's state and binds the pushHistory, clearAuth, goBack to the instance 
    // and lastly the state based on the values of isAuthenticated and pathname properties of props object.
    constructor(props) {
        super(props);
        this.pushHistory = props.history.push;
        this.clearAuth = props.clearAuth;
        this.goBack = props.history.goBack;
        
        this.state = {
            isAuthenticated: props.isAuthenticated,
            path: props.location.pathname
        };
    }

    // Updates and returns the values of an object. The values are props.isAuthenticated and props.location.pathname
    static getDerivedStateFromProps(props) {
        return {
            isAuthenticated: props.isAuthenticated,
            path: props.location.pathname
        };
    }

    // Returns JSX that represents the visual structure of header. The JSX includes a logo, a series of buttons and a divider. 
    // The content and behavior of buttons depend on the value of isAuthenticated state . 
    // If the value of isAuthenticated is true, the buttons will be rendered. If the value of isAuthenticated is false, the buttons will not be rendered.
    // Then Style height and background of StyledBox based on the value of changeHeader. The changeHeader is set based on the value of path state  and whether 
    // it starts with the string /dashboards/ and does not start with the string /dashboards/edit/.
    // It also uses the ButtonWithText, which is passed several props, including icon, iconWhite, text, info, handler and changeHeader.
    render() {
        const {isAuthenticated, path} = this.state;
        const changeHeader = (path.startsWith('/dashboards/') && !(path.startsWith('/dashboards/edit/')));
        
        const buttons = [
            {
                icon: homeIcon, iconWhite: homeWhiteIcon, text: 'Home', info: 'Home', handler: () => this.pushHistory('/home')
            },
            // {
            //     icon: sourcesIcon, iconWhite: sourcesWhiteIcon, text: 'Sources', info: 'Sources', handler: () => this.pushHistory('/sources')
            // },
            // {
            //     icon: dashboardIcon, iconWhite: dashboardWhiteIcon, text: 'Dashboards', info: 'Dashboards', handler: () => this.pushHistory('/dashboards')
            // },
            {
                icon: logoutIcon, iconWhite: logoutWhiteIcon, text: 'Logout', info: 'Logout', handler: this.clearAuth
            },
        ];

        return (
            <StyledBox style={{height: (changeHeader) ? '30px' : '80px', background: (changeHeader) ? '#16335B' : 'white'}}>
                <StyledIcon src={(changeHeader) ? logoWhite : logo} alt="" onClick={() => { this.pushHistory('/home'); }} />
                {changeHeader && <div key="divider" style={{width: '2px', height: '80%', marginLeft: '10px', background: 'white'}} />}
                {isAuthenticated
                && (
                    <ButtonsDiv key="buttons-div">
                        {buttons.map((button) => (
                            <ButtonWithText 
                                key={button.text} 
                                icon={button.icon}
                                iconWhite={button.iconWhite}
                                text={button.text}
                                info={button.info}
                                handler={button.handler}
                                changeHeader={changeHeader}
                            />
                        ))}
                    </ButtonsDiv>
                )}
            </StyledBox>
        );
    }
}

// Takes in a state argument and returns an object with a isAuthenticated, which checks if the user is authenticated and a user.
export const mapState = (state) => ({isAuthenticated: checkIsAuthenticated(state), user: state.auth.user});

// Returns an object with a clearAuth. The value of clearAuth  is a function that dispatches the clear action from the actions.auth object when it is called.
export const mapDispatch = (dispatch) => ({
    clearAuth: () => {
        dispatch(actions.auth.clear());
    }
});

// Function is the result of wrapping the AppHeader with the connect higher-order. In the connect higher-order is passed the mapState and mapDispatch,
// which allows the AppHeader to have access to the values of the isAuthenticated and user properties in the store as well as the clearAuth action.
export default withRouter(connect(
    mapState,
    mapDispatch
)(AppHeader));
