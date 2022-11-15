/* eslint-disable max-len */
/* eslint-disable react/no-did-update-set-state */
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

const StyledBox = styled(Box)`
    width: 100%;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
`;

const StyledIcon = styled.img`
    max-height: 100%;
    cursor: pointer;
    margin-left: 10px;
    padding: 5px;
`;

const ButtonsDiv = styled.div`
    height: 100%;
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
`;

const StyledButtonIcon = styled.img.attrs((props) => ({src: props.icon}))`
    position: relative;
`;

const StyledText = styled(Text)`
    color: #16335B;
    font-size: 16px;
    text-align: center;
    font-weight: 550;
`;

const ButtonWithText = ({text, info, icon, iconWhite, handler, changeHeader}) => (
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

export class AppHeader extends React.Component {
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

    static getDerivedStateFromProps(props) {
        return {
            isAuthenticated: props.isAuthenticated,
            path: props.location.pathname
        };
    }

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

export const mapState = (state) => ({isAuthenticated: checkIsAuthenticated(state), user: state.auth.user});

export const mapDispatch = (dispatch) => ({
    clearAuth: () => {
        dispatch(actions.auth.clear());
    }
});

export default withRouter(connect(
    mapState,
    mapDispatch
)(AppHeader));
