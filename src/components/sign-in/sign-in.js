/* eslint-disable max-len */
import React from 'react';
import {Box} from 'rebass';
import styled from 'styled-components';
import {connect} from 'react-redux';
import {Formik} from 'formik';
import {Divider, Text} from '@blueprintjs/core';
import actions from '../../actions';
import TextInput from '../../lib/text-input';
import {OrangeButton} from '../../lib/buttons';
import {handleSubmit, validationSchema} from './form-handler';
import {ToasterBottom} from '../../lib/toaster';
import {getStatistics} from '../../api/general';
import infographicIcon from '../../assets/infographic.png';
import contactIcon from '../../assets/contact.png';
import contactHoverIcon from '../../assets/contactHover.png';

const StyledBox = styled(Box)`
    height: 100%;
    width: 50%;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px;
    justify-content: center;
    position: relative;
`;

const StyledHeader = styled.h2`
    text-align: left;
    color: white;
    margin: 0px;
    font-size: 50px;
    font-weight: 300;
    letter-spacing: 2px;
`;

const StyledSubHeader = styled.h2`
    width: 100%;
    text-align: left;
    color: #FF9D66;
    margin: 0px;
    margin-bottom: 20px;
    font-size: 33px;
    font-weight: normal;
    letter-spacing: 2px;
`;

const StyledForm = styled.form`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const StyledText = styled(Text)`
    font-size: 16px;
`;

const ForgotPasswordText = styled(StyledText)`
    color: white;
    margin-top: 20px;
    text-align: center;
`;

const SignUpText = styled(StyledText)`
    color: white;
    text-align: center;
`;

const StyledLink = styled.a`
    :hover {
        text-decoration: none;
    }
`;

const OrangeLink = styled(StyledLink)`
    color: #FFC4A3;
    :hover {
        color: #ffae80;
    }
`;

const StyledDivider = styled(Divider)`
    width: 100%;
    border-bottom: 1px solid #7296A7;
    border-right: 1px solid #7296A7;
    margin: 0px;
    margin-top: 5px;
    margin-bottom: 5px;
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

export class SignInPage extends React.Component {
    constructor(props) {
        super(props);

        this.setAuth = props.setAuth;
        this.pushHistory = props.history.push;

        this.state = {
            users: null,
            dashboards: null,
            views: null,
            sources: null,
            top: 100,
            left: 100,
            width: 100,
            height: 100
        };

        this.resize = this.resize.bind(this);
        this.fetchStatistics = this.fetchStatistics.bind(this);
    }

    componentDidMount() {
        this.fetchStatistics();
        setTimeout(this.resize, 200);
        window.addEventListener('resize', this.resize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    resize() {
        const img = document.getElementById('infographics');
        const infoDiv = document.getElementById('infographicDiv');
        this.setState({
            top: (infoDiv.offsetHeight - img.offsetHeight) / 2,
            left: (infoDiv.offsetWidth - img.offsetWidth) / 2,
            width: img.offsetWidth,
            height: img.offsetHeight
        });
    }

    async fetchStatistics() {
        const response = await getStatistics();
        if (response.success) {
            this.setState({
                users: response.users,
                dashboards: response.dashboards,
                views: response.views,
                sources: response.sources
            });
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was a problem trying to fetch the statistics'
            });
        }
    }

    render() {
        const {users, dashboards, views, sources, top, left, width, height} = this.state;
        return (
            <div 
                style={{
                    width: '100%', height: '100%', margin: '0px', padding: '0px', display: 'flex'
                }}
            >
                <StyledBox>
                    <div style={{width: '300px', display: 'flex', flexDirection: 'column'}}>
                        <StyledHeader>
                            WELCOME
                        </StyledHeader>
                        <StyledSubHeader>
                            to Codin Platform
                        </StyledSubHeader>
                        <Formik
                            initialValues={{username: '', password: ''}}
                            validationSchema={validationSchema}
                            onSubmit={(...formikArgs) => handleSubmit(...formikArgs, {setAuth: this.setAuth, pushHistory: this.pushHistory})}
                        >
                            {(formikProps) => (
                                <StyledForm onSubmit={formikProps.handleSubmit} id="signInForm">
                                    <TextInput
                                        id="test-username"
                                        name="username"
                                        type="text"
                                        leftIcon="person"
                                        placeholder="Username"
                                        formikProps={{...formikProps}}
                                        width="300px"
                                        fill
                                    />
                                    <TextInput
                                        id="test-password"
                                        name="password"
                                        type="password"
                                        leftIcon="lock"
                                        placeholder="Password"
                                        formikProps={{...formikProps}}
                                        width="300px"
                                        fill
                                    />
                                    <OrangeButton
                                        id="signin"
                                        type="submit"
                                        disabled={formikProps.isSubmitting}
                                        loading={formikProps.isSubmitting}
                                    >
                                        Sign in
                                    </OrangeButton>
                                </StyledForm>
                            )}
                        </Formik>
                        <ForgotPasswordText>
                            Forgot Password?
                            {' '}
                            <OrangeLink href="/forgot-password">
                                Click Here
                            </OrangeLink>
                        </ForgotPasswordText>
                        <StyledDivider />
                        <SignUpText>
                            Don&apos;t have an account?
                            {' '}
                            <OrangeLink href="/sign-up">
                                Sign Up Here
                            </OrangeLink>
                        </SignUpText>
                    </div>
                    <ContactDiv
                        onMouseOver={() => { document.getElementById('contactImg').src = contactHoverIcon; }}
                        onFocus={() => { document.getElementById('contactImg').src = contactHoverIcon; }}
                        onMouseOut={() => { document.getElementById('contactImg').src = contactIcon; }}
                        onBlur={() => { document.getElementById('contactImg').src = contactIcon; }}
                        onClick={() => { window.location = 'mailto:karanikio@auth.gr'; }}
                    >
                        <img id="contactImg" src={contactIcon} alt="" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                    </ContactDiv>
                </StyledBox>
                <StyledBox>
                    <div 
                        id="infographicDiv"
                        style={{
                            width: '100%', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative', justifyContent: 'center'
                        }}
                    >
                        {/* <div className="graphic-container">
                            <div className="center-circles-container">
                                <div className="single">
                                    <div className="circle one">
                                        <div className="dot" />
                                        <div className="icon">
                                            <i className="far fa-building">225</i>
                                        </div>
                                        <div className="content-container">
                                            <div className="line" />
                                            <h2>Codin Users</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="double">
                                    <div className="circle two">
                                        <div className="icon" />
                                    </div>
                                    <div className="circle three">
                                        <div className="icon">
                                            <i className="far fa-building">3</i>
                                        </div>
                                        <div className="content-container">
                                            <div className="line" />
                                            <h2>3 Location</h2>
                                            <div className="content">
                                                <h3>option infographic</h3>
                                                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Error similique unde eius magnam, aliquam ducimus!</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="double">
                                    <div className="circle four">
                                        <div className="dot" />
                                        <div className="icon" />
                                    </div>
                                    <div className="circle five">
                                        <div className="icon">
                                            <i className="far fa-building">5</i>
                                        </div>
                                        <div className="content-container">
                                            <div className="line" />
                                            <h2>5 Location</h2>
                                            <div className="content">
                                                <h3>option infographic</h3>
                                                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Error similique unde eius magnam, aliquam ducimus!</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="single">
                                    <div className="circle six">
                                        <div className="dot" />
                                        <div className="icon">
                                            <i className="far fa-building">6</i>
                                        </div>
                                        <div className="content-container">
                                            <div className="line" />
                                            <h2>6 Location</h2>
                                            <div className="content">
                                                <h3>option infographic</h3>
                                                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Error similique unde eius magnam, aliquam ducimus!</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            
                            </div>
                        
                        </div> */}
                        <img id="infographics" src={infographicIcon} alt="" style={{maxWidth: '100%', maxHeight: '100%'}} />
                        <div 
                            style={{
                                width: `${width * 0.164}px`, 
                                height: `${width * 0.164}px`, 
                                borderRadius: `${width * 0.164}px`, 
                                position: 'absolute', 
                                top: `${(height * 0.37) + top}px`, 
                                left: `${(width * 0.07) + left}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: `${(width * 0.164) / 4}px`
                            }}
                        >
                            {views}
                        </div>
                        <div 
                            style={{
                                width: `${width * 0.28}px`, 
                                borderRadius: `${width * 0.164}px`, 
                                position: 'absolute', 
                                top: `${(height * 0.95) + top}px`, 
                                left: `${(width * 0.03) + left}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: `${((width * 0.164) + 20) / 7}px`,
                                textAlign: 'center'
                            }}
                        >
                            Dashboards Views
                        </div>
                        <div 
                            style={{
                                width: `${width * 0.164}px`, 
                                height: `${width * 0.164}px`, 
                                borderRadius: `${width * 0.164}px`, 
                                position: 'absolute', 
                                top: `${(height * 0.37) + top}px`, 
                                left: `${(width * 0.302) + left}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: `${(width * 0.164) / 4}px`
                            }}
                        >
                            {dashboards}
                        </div>
                        <div 
                            style={{
                                width: `${width * 0.28}px`, 
                                borderRadius: `${width * 0.164}px`, 
                                position: 'absolute', 
                                top: (width < 547) ? `${(height * -0.07) + top}px` : `${(height * 0.001) + top}px`, 
                                left: `${(width * 0.24) + left}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: `${((width * 0.164) + 20) / 7}px`,
                                textAlign: 'center'
                            }}
                        >
                            Dashboards Created
                        </div>
                        <div 
                            style={{
                                width: `${width * 0.164}px`, 
                                height: `${width * 0.164}px`, 
                                borderRadius: `${width * 0.164}px`, 
                                position: 'absolute', 
                                top: `${(height * 0.37) + top}px`, 
                                left: `${(width * 0.534) + left}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: `${(width * 0.164) / 4}px`
                            }}
                        >
                            {users}
                        </div>
                        <div 
                            style={{
                                width: `${width * 0.28}px`, 
                                borderRadius: `${width * 0.164}px`, 
                                position: 'absolute', 
                                top: `${(height * 0.95) + top}px`, 
                                left: `${(width * 0.49) + left}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: `${((width * 0.164) + 20) / 7}px`,
                                textAlign: 'center'
                            }}
                        >
                            Codin Users
                        </div>
                        <div 
                            style={{
                                width: `${width * 0.164}px`, 
                                height: `${width * 0.164}px`, 
                                borderRadius: `${width * 0.164}px`, 
                                position: 'absolute', 
                                top: `${(height * 0.37) + top}px`, 
                                left: `${(width * 0.766) + left}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: `${(width * 0.164) / 4}px`
                            }}
                        >
                            {sources}
                        </div>
                        <div 
                            style={{
                                width: `${width * 0.28}px`, 
                                borderRadius: `${width * 0.164}px`, 
                                position: 'absolute', 
                                top: (width < 547) ? `${(height * -0.07) + top}px` : `${(height * 0.001) + top}px`, 
                                left: `${(width * 0.70) + left}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: `${((width * 0.164) + 20) / 7}px`,
                                textAlign: 'center'
                            }}
                        >
                            Sources Connected
                        </div>
                    </div>
                </StyledBox>
            </div>
        );
    }
}

export const mapDispatch = (dispatch) => ({
    setAuth: (data) => {
        dispatch(actions.auth.set(data));
    }
});

export default connect(
    null,
    mapDispatch
)(SignInPage);
