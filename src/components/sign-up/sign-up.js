/* eslint-disable max-len */

/*
*
* Importing the necessary modules
* e.g. React, modules from our code,
* external modules and etc.
*
*/ 
import React from 'react';
import {Box} from 'rebass';
import styled from 'styled-components';
import {Formik} from 'formik';
import {Divider, Text} from '@blueprintjs/core';
import TextInput from '../../lib/text-input';
import {OrangeButton} from '../../lib/buttons';
import {handleSubmit, validationSchema} from './form-handler';
import {ToasterBottom} from '../../lib/toaster';
import {getStatistics} from '../../api/general';
import infographicIcon from '../../assets/infographic.png';
import contactIcon from '../../assets/contact.png';
import contactHoverIcon from '../../assets/contactHover.png';

/*
* Sets styling properties such as height, width,
* border-radius, display, flex-direction and alignment.
*/
const StyledBox = styled(Box)`
    height: 100%;
    width: 50%;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0px;
    position: relative;
`;

/*
* Sets text-alignment, color, font size,
* font-weight and letter-spacing.
*/
const StyledHeader = styled.h2`
    text-align: left;
    color: white;
    margin: 0px;
    font-size: 50px;
    font-weight: 300;
    letter-spacing: 2px;
`;

/*
* Sets width, text-alignment, color, margin, font size, 
* font-weight and letter-spacing.
*/
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

/*
* Sets width and flex-direction.
*/
const StyledForm = styled.form`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

/*
* Sets font size to 16px
*/
const StyledText = styled(Text)`
    font-size: 16px;
`;

/*
* Sets color and text-alignment.
*/
const ForgotPasswordText = styled(StyledText)`
    color: white;
    margin-top: 10px;
    text-align: center;
`;

/*
* Sets hover text-decoration.
*/
const StyledLink = styled.a`
    :hover {
        text-decoration: none;
    }
`;

/*
* Sets width, border-bottom, border-right and
* margins.
*/
const StyledDivider = styled(Divider)`
    width: 100%;
    border-bottom: 1px solid #7296A7;
    border-right: 1px solid #7296A7;
    margin: 0px;
    margin-top: 10px;
`;

// Style OrangeLink
const OrangeLink = styled(StyledLink)`
    color: #FFC4A3;
    :hover {
        color: #ffae80;
    }
`;

/*
* Sets width, height, position and display
* properties, as well as cursor and active
* bottom properties.
*/
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

export class SignUpPage extends React.Component {
    // The constructor of the class, that sets initial values for the state
    // of the component, such as history push, token and a few other state values.
    // It also binds the resize and fetchStatistics functions to the component.
    constructor(props) {
        super(props);

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

    // Called immediately after the component is mounted and is used to trigger an action or dispatch an event.
    componentDidMount() {
        this.fetchStatistics();
        setTimeout(this.resize, 200);
        window.addEventListener('resize', this.resize);
    }

    // It is called immediately before the component is unmounted (removed from the DOM) and is used to perform
    // any necessary cleanup before the component is destroyed.
    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    // Resize the img
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

    // Fetches the statistics if success is true and give a message if not
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

    // Renders the Sign Up page. It includes a form with inputs for username, password, confirm password, email and
    // a button to submit the form. The view also includes a header and subheader, links to login and contact and
    // an image with a contact link. The data from the state which includes users, dashboards, views, sources, top,
    // left, width, height is used to populate the view.
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
                            Sign Up
                        </StyledHeader>
                        <StyledSubHeader>
                            to Codin Platform
                        </StyledSubHeader>
                        <Formik
                            initialValues={{username: '', password: '', confirm: '', email: ''}}
                            validationSchema={validationSchema}
                            onSubmit={(...formikArgs) => handleSubmit(...formikArgs, {setAuth: this.setAuth, pushHistory: this.pushHistory})}
                        >
                            {(formikProps) => (
                                <StyledForm onSubmit={formikProps.handleSubmit} id="signInForm">
                                    <TextInput
                                        name="username"
                                        type="text"
                                        leftIcon="person"
                                        placeholder="Username"
                                        formikProps={{...formikProps}}
                                        width="300px"
                                        fill
                                    />
                                    <TextInput
                                        name="password"
                                        type="password"
                                        leftIcon="lock"
                                        placeholder="Password"
                                        formikProps={{...formikProps}}
                                        width="300px"
                                        fill
                                    />
                                    <TextInput
                                        name="confirm"
                                        type="password"
                                        leftIcon="confirm"
                                        placeholder="Confirm Password"
                                        formikProps={{...formikProps}}
                                        width="300px"
                                        fill
                                    />
                                    <TextInput
                                        name="email"
                                        type="email"
                                        leftIcon="envelope"
                                        placeholder="E-mail"
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
                                        Sign up
                                    </OrangeButton>
                                </StyledForm>
                            )}
                        </Formik>
                        <StyledDivider />
                        <ForgotPasswordText>
                            Already have an account?
                            {' '}
                            <OrangeLink href="/">
                                Sign in
                            </OrangeLink>
                        </ForgotPasswordText>
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

/*
*
* Default export
*
*/
// The export constant is: 
// SignUpPage
export default SignUpPage;
