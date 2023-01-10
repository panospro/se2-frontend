/* eslint-disable max-len */

/*
* Importing the necessary modules
*/
import React from 'react';
import {Box} from 'rebass';
import styled from 'styled-components';
import {Divider, Text} from '@blueprintjs/core';
import {connect} from 'react-redux';
import {Formik} from 'formik';
import {
    path, pipe, ifElse, startsWith, isNil, slice
} from 'ramda';
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
    letter-spacing: 1px;
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
const SignUpText = styled(StyledText)`
    color: white;
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
* Sets color and hover color
*/
const OrangeLink = styled(StyledLink)`
    color: #FFC4A3;
    :hover {
        color: #ffae80;
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
    margin-bottom: 10px;
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

export class ResetPasswordPage extends React.Component {
    // The constructor of the class, that sets initial values for the state
    // of the component, such as history push, token and a few other state values.
    // It also binds the resize and fetchStatistics functions to the component.
    constructor(props) {
        super(props);

        this.pushHistory = props.history.push;
        this.token = pipe(
            (h) => path(['location', 'search'], h),
            ifElse(
                (s) => !isNil(s) && startsWith('?token=', s),
                (t) => slice(7, t.length, t).trimLeft(),
                () => null
            )
        )(props.history);

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

    // Resizes an image within 'infographicDiv'. Retrieves the image
    // and the div by their ID's and then sets the top, left, width
    // and height of the image based on the measurements of the div and the image.
    // Then, sets the state of the object with the calculated measurements.
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

    // Retrieves data from getStatistics(). If the response is successful, 
    // the data is stored in the state object. If not, an error message is
    // displayed using ToasterBottom.show().
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

    // Renders a form for changing a password using Formik and TextInput components. Also it renders an
    // infographic with data from the state, such as users, dashboards, views and sources. Then, 
    // has some links to sign in on Codin. It is styled using StyledBox, StyledHeader, StyledSubHeader,
    // OrangeLink, OrangeButton, ContactDiv and SignUpText.
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
                            Change your password
                        </StyledHeader>
                        <StyledSubHeader>
                            to Codin Platform
                        </StyledSubHeader>
                        <Formik
                            initialValues={{password: '', confirm: ''}}
                            validationSchema={validationSchema}
                            onSubmit={(...formikArgs) => handleSubmit(...formikArgs, this.token, {pushHistory: this.pushHistory})}
                        >
                            {(formikProps) => (
                                <StyledForm onSubmit={formikProps.handleSubmit} id="signInForm">
                                    <TextInput
                                        name="password"
                                        type="password"
                                        leftIcon="lock"
                                        placeholder="Password"
                                        width="300px"
                                        formikProps={{...formikProps}}
                                        fill
                                    />
                                    <TextInput
                                        name="confirm"
                                        type="password"
                                        leftIcon="confirm"
                                        placeholder="Confirm Password"
                                        width="300px"
                                        formikProps={{...formikProps}}
                                        fill
                                    />
                                    <OrangeButton
                                        id="signin"
                                        type="submit"
                                        disabled={formikProps.isSubmitting}
                                        loading={formikProps.isSubmitting}
                                        width="160px"
                                    >
                                        Change Password
                                    </OrangeButton>
                                </StyledForm>
                            )}
                        </Formik>
                        <StyledDivider />
                        <SignUpText>
                            Otherwise
                            {' '}
                            <OrangeLink href="/">
                                sign in here
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


// Default export the connected ResetPasswordPage
export default connect(
    null,
    null
)(ResetPasswordPage);
