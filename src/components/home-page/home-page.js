import React from 'react';
import {Box} from 'rebass';
import styled from 'styled-components';
import {connect} from 'react-redux';
import {Button} from '@blueprintjs/core';
// eslint-disable-next-line camelcase
import jwt_decode from 'jwt-decode';
import {ToasterBottom} from '../../lib/toaster';
import actions from '../../actions';
import sourcesOrangeIcon from '../../assets/sourceOrange.png';
import dashboardOrangeIcon from '../../assets/dashboardOrange.png';
import profileOrangeIcon from '../../assets/profileOrange.png';
import sourcesWhiteIcon from '../../assets/sourceWhite.png';
import dashboardWhiteIcon from '../../assets/dashboardWhite.png';
import profileWhiteIcon from '../../assets/profileWhite.png';
import contactIcon from '../../assets/contact.png';
import contactHoverIcon from '../../assets/contactHover.png';
import bugIcon from '../../assets/bug.png';
import bugHoverIcon from '../../assets/bugHover.png';

const StyledBox = styled(Box)`
    height: 100%;
    width: 100%;
    display: block;
    align-items: center;
    justify-content: center;
    overflow: auto;
    position: relative;
`;

const StyledArea = styled(Box)`
    height: 100%;
    width: 750px;
    min-height: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px;
    padding-top: 30px;
    padding-bottom: 30px;
    margin: auto!important;
`;

const StyledHeader = styled.h2`
    text-align: center;
    color: white;
    margin: 0px;
    font-size: 65px;
    font-weight: 300;
    letter-spacing: 5px;
`;

const StyledSubHeader = styled.h2`
    width: 100%;
    text-align: center;
    color: #FF9D66;
    margin: 0px;
    margin-bottom: 20px;
    font-size: 35px;
    font-weight: normal;
    letter-spacing: 2px;
`;

const ButtonsArea = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin-top: 20px;
`;

const StyledIcon = styled.img`
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
    flex-direction: column;
`;

const StyledText = styled.div`
    color: white;
    text-align: center;
    font-weight: 550;
    font-size: 22px;
`;

const MenuButton = styled(Button)`
    border: 2px solid transparent;
    :hover {
        border: 2px solid #FF9D66;
        background: none!important;
        animation: blink2 0.2s linear;
    }
    :active {
        top: 2px;
        position: relative;
    }
`;

const ContactDiv = styled.div`
    width: 30px; 
    height: 30px; 
    position: absolute; 
    bottom: 10px; 
    left: 10px;
    display: flex; 
    align-items: center;
    justify-content: center;
    cursor: pointer;
    :active {
        bottom: 9px;
    }
`;

const BugDiv = styled.div`
    width: 30px; 
    height: 30px; 
    position: absolute; 
    bottom: 10px; 
    left: 50px;
    display: flex; 
    align-items: center;
    justify-content: center;
    cursor: pointer;
    :active {
        bottom: 9px;
    }
`;

// eslint-disable-next-line no-unused-vars
const ButtonWithText = ({text, iconWhite, iconOrange, handler}) => (
    <MenuButton 
        minimal 
        onClick={handler} 
        onMouseOver={() => { document.getElementById(`img_${text}`).src = iconOrange; document.getElementById(`button_${text}`).style.color = '#FF9D66'; }}
        onFocus={() => { document.getElementById(`img_${text}`).src = iconOrange; document.getElementById(`button_${text}`).style.color = '#FF9D66'; }}
        onMouseOut={() => { document.getElementById(`img_${text}`).src = iconWhite; document.getElementById(`button_${text}`).style.color = 'white'; }}
        onBlur={() => { document.getElementById(`img_${text}`).src = iconWhite; document.getElementById(`button_${text}`).style.color = 'white'; }}
        style={{textAlign: 'center', width: '210px', height: '185px', padding: '20px'}}
    >
        <StyledIcon id={`img_${text}`} src={iconWhite} />
        <StyledText id={`button_${text}`}>{text}</StyledText>
    </MenuButton>
);

export class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.user = props.user;
        this.token = props.token;
        this.clearAuth = props.clearAuth;
        this.pushHistory = props.history.push;
    }

    componentDidMount() {
        if (jwt_decode(this.token).exp < Date.now() / 1000) {
            this.clearAuth();
            ToasterBottom.show({
                intent: 'danger',
                message: 'Connection session has expired. Please login again.'
            });
        }
    }

    render() {
        const buttons = [
            {text: 'My Sources', handler: () => this.pushHistory('/sources'), iconWhite: sourcesWhiteIcon, iconOrange: sourcesOrangeIcon},
            {text: 'My Dashboards', handler: () => this.pushHistory('/dashboards'), iconWhite: dashboardWhiteIcon, iconOrange: dashboardOrangeIcon},
            {text: 'My Profile', handler: () => this.pushHistory('/profile'), iconWhite: profileWhiteIcon, iconOrange: profileOrangeIcon}
        ];
        
        return (
            <StyledBox>
                <StyledArea>
                    <StyledHeader>
                        {`HELLO ${this.user.username}`}
                    </StyledHeader>
                    <StyledSubHeader>
                        what do you want to do?
                    </StyledSubHeader>
                    <ButtonsArea>
                        {buttons.map((button) => (
                            <ButtonWithText
                                key={button.text}
                                iconWhite={button.iconWhite}
                                iconOrange={button.iconOrange}
                                text={button.text}
                                handler={button.handler}
                            />
                        ))}
                    </ButtonsArea>
                </StyledArea>
                <ContactDiv
                    onMouseOver={() => { document.getElementById('contactImg').src = contactHoverIcon; }}
                    onFocus={() => { document.getElementById('contactImg').src = contactHoverIcon; }}
                    onMouseOut={() => { document.getElementById('contactImg').src = contactIcon; }}
                    onBlur={() => { document.getElementById('contactImg').src = contactIcon; }}
                    onClick={() => { window.location = 'mailto:karanikio@auth.gr'; }}
                >
                    <img id="contactImg" src={contactIcon} alt="" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                </ContactDiv>
                <BugDiv
                    onMouseOver={() => { document.getElementById('bugImg').src = bugHoverIcon; }}
                    onFocus={() => { document.getElementById('bugImg').src = bugHoverIcon; }}
                    onMouseOut={() => { document.getElementById('bugImg').src = bugIcon; }}
                    onBlur={() => { document.getElementById('bugImg').src = bugIcon; }}
                    onClick={() => window.open('https://github.com/robotics-4-all/codin-issues/issues', '_blank')}
                >
                    <img id="bugImg" src={bugIcon} alt="" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                </BugDiv>
            </StyledBox>
        );
    }
}

export const mapState = (state) => ({user: state.auth.user, token: state.auth.token});

export const mapDispatch = (dispatch) => ({
    clearAuth: () => {
        dispatch(actions.auth.clear());
    }
});

export default connect(
    mapState,
    mapDispatch
)(HomePage);
