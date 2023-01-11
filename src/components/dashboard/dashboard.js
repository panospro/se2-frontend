/* eslint-disable max-len */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

/*
* Importing the necessary modules
*/ 
import React from 'react';
import {Box} from 'rebass';
import styled from 'styled-components';
import {connect} from 'react-redux';
/* eslint-disable import/no-unresolved */
import GridLayout from 'react-grid-layout';
import {
    InputGroup, Tooltip, Button, Switch
} from '@blueprintjs/core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClipboard} from '@fortawesome/free-solid-svg-icons';
import {
    BlueBorderButton, BlueButton, OrangeButton
} from '../../lib/buttons';
import {ToasterBottom} from '../../lib/toaster';
import {
    checkDashboardPasswordNeeded, checkDashboardPassword, selectShareDashboard, submitPassword
} from '../../api/dashboards';
import {CustomSpinner, PortalOverflowOverlay} from '../../lib/overlays';
import components from './components';
import backgroundImage from '../../assets/backgroundDark.png';
import editWhiteIcon from '../../assets/editWhite.png';
import shareWhiteIcon from '../../assets/shareWhite.png';

/* eslint-disable import/no-unresolved */
import '../../../node_modules/react-grid-layout/css/styles.css';
/* eslint-disable import/no-unresolved */
import '../../../node_modules/react-resizable/css/styles.css';

// Style FormHeader
const FormHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    font-size: 24px;
    font-weight: bold;
    color: #16335B;
`;

// Style SettingsDiv
const SettingsDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

// Style StyledBox
const StyledBox = styled(Box)`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    position: relative;
`;

// Style StyledButtonIcon
const StyledButtonIcon = styled.img.attrs((props) => ({src: props.icon}))`
    position: relative;
`;

// Displays a button with an icon and a tooltip. When the button is clicked, it calls the handler function.
// The component displays a tooltip with info as its content when hovered over, but only if info is not nuli. 
// The component also displays an icon specified by the iconWhite prop. 
const ButtonWithText = ({text, info, iconWhite, handler}) => (
    <Tooltip
        key={`tooltip_${text}`}
        popoverClassName="item-info-tooltip"
        disabled={info === null}
        content={info}
        interactionKind="hover"
    >
        <Button key={`button_${text}`} className="header-buttons" minimal onClick={handler} style={{textAlign: 'center'}}>
            <StyledButtonIcon key={`icon_${text}`} style={{width: '20px', height: '20px'}} icon={iconWhite} />
        </Button>
    </Tooltip>
);

export class DashboardPage extends React.Component {
    // The constructor of the class, that initializes type,state and resize etc.
    constructor(props) {
        super(props);

        this.pushHistory = props.history.push;
        this.dashboardId = props.match.params.dashboardId;

        this.nCols = 24;
        this.state = {
            user: props.user,
            owner: '',
            shared: false,
            spinnerOpen: false,
            mapWidth: 100,
            name: '',
            currentLayout: [],
            items: {},
            passwordPopupOpen: false,
            tempPassword: '',
            shareDashboardPopupOpen: false
        };

        this.checkPassword = this.checkPassword.bind(this);
        this.closePassword = this.closePassword.bind(this);
        this.confirmPassword = this.confirmPassword.bind(this);
        this.changePassword = this.changePassword.bind(this);
        // this.fetchDashboard = this.fetchDashboard.bind(this);
        this.changeSpinner = this.changeSpinner.bind(this);
        this.changeMapDimensions = this.changeMapDimensions.bind(this);
        this.openSharePopup = this.openSharePopup.bind(this);
        this.closeSharePopup = this.closeSharePopup.bind(this);
        this.shareDashboard = this.shareDashboard.bind(this);
        this.changeSharePassword = this.changeSharePassword.bind(this);
        this.submitSharePassword = this.submitSharePassword.bind(this);
        this.copyClipboard = this.copyClipboard.bind(this);
    }

    // Called immediately after the component is mounted and is used to trigger an action or dispatch an event.
    componentDidMount() {
        this.checkPassword();
        this.changeMapDimensions();
        window.addEventListener('resize', this.changeMapDimensions);
    }

    // It is called immediately before the component is unmounted (removed from the DOM) and is used
    // to perform any necessary cleanup before the component is destroyed.
    componentDidUpdate(__, prevState) {
        const {user} = this.state;
        if (user !== prevState.user) {
            this.checkPassword();
        }
    }

    // It is called immediately before the component is unmounted (removed from the DOM) and is used to perform
    // any necessary cleanup before the component is destroyed.
    componentWillUnmount() {
        window.removeEventListener('resize', this.changeMapDimensions);
    }

    // Return the user
    static getDerivedStateFromProps(props) {
        return {user: props.user};
    }

    // Takes value as argument and is called when the component needs to show or hide a loading spinner and the spinnerOpen is used to determine whether the spinner 
    // should be shown or hidden. When the value of spinnerOpen is true, the spinner is shown and when it is false, the spinner is hidden.
    changeSpinner(value) {
        this.setState({spinnerOpen: value});
    }

    // Checks if the password is correct. First checks if the response is success then if the owner is self, if they are, then sets state with some parameters, if they are not shares but success
    // is true, then a message shows up ('You are not allowed to view this dashboard'), if password is incorrect the set state with different parameters, else set passwordPopupOpen to true.
    // If success is not true, then show a message again ("There was a problem trying to fetch dashboard information")  
    async checkPassword() {
        this.changeSpinner(true);
        const {user} = this.state;
        const response = await checkDashboardPasswordNeeded(user, this.dashboardId);
        if (response.success) {
            if (response.owner === 'self') {
                this.setState({
                    owner: 'self', 
                    shared: response.shared,
                    name: response.dashboard.name,
                    currentLayout: response.dashboard.layout,
                    items: response.dashboard.items
                });
            } else if (!(response.shared)) {
                ToasterBottom.show({
                    intent: 'danger',
                    message: 'You are not allowed to view this dashboard'
                });
                this.pushHistory('/');
            } else if (!(response.passwordNeeded)) {
                this.setState({
                    owner: response.owner, 
                    name: response.dashboard.name,
                    currentLayout: response.dashboard.layout,
                    items: response.dashboard.items
                });
            } else {
                this.setState({passwordPopupOpen: true});
            }
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was a problem trying to fetch dashboard information'
            });
        }
        this.changeSpinner(false);
    }

    // Set passwordPopupOpen to false to hide the password
    closePassword() {
        this.setState({passwordPopupOpen: false});
        this.pushHistory('/');
    }

    // Checks if a provided password matches the password for a dashboard. If the password is correct, the method updates the component's state with the 
    // owner, name, layout and items of the dashboard. If the password is incorrect or the request is unsuccessful, the method displays a toaster notification 
    //with an error message.
    async confirmPassword() {
        const {tempPassword} = this.state;
        if (tempPassword !== '') {
            this.changeSpinner(true);
            const response = await checkDashboardPassword(this.dashboardId, tempPassword);
            if (response.success) { 
                if (response.correctPassword) {
                    this.setState({
                        owner: response.owner, 
                        name: response.dashboard.name,
                        currentLayout: response.dashboard.layout,
                        items: response.dashboard.items,
                        passwordPopupOpen: false
                    });
                } else {
                    ToasterBottom.show({
                        intent: 'danger',
                        message: 'Wrong password'
                    });
                }
            } else {
                ToasterBottom.show({
                    intent: 'danger',
                    message: response.message || 'There was a problem trying to check the dashboard password'
                });
            }
            this.changeSpinner(false);
        }
    }

    // Change the state tempPassword to event.target.value
    changePassword(event) {
        this.setState({tempPassword: event.target.value});
    }

    // async fetchDashboard() {
    //     this.changeSpinner(true);
    //     const response = await getDashboard(this.dashboardId);
    //     if (response.success) {
    //         this.setState({
    //             name: response.dashboard.name,
    //             currentLayout: response.dashboard.layout,
    //             items: response.dashboard.items
    //         });
    //     } else {
    //         ToasterBottom.show({
    //             intent: 'danger',
    //             message: response.message || 'There was a problem trying to fetch the dashboard'
    //         });
    //     }

    //     this.changeSpinner(false);
    // }

    // Changes the map dimensions by setting the value of state to mapwidth, which is the mainmap element id width
    changeMapDimensions() {
        const mapWidth = document.getElementById('mainmap').offsetWidth;
        this.setState({mapWidth});
    }

    // Set shareDashboardPopupOpen to true to open the share pop up
    openSharePopup() {
        this.setState({shareDashboardPopupOpen: true, tempSharePassword: ''});
    }

    // Set shareDashboardPopupOpen to false to close the share pop up
    closeSharePopup() {
        this.setState({shareDashboardPopupOpen: false});
    }

    // Sends a request to a server to update the share information for a dashboard. If the request is successful, the method updates the shared state. 
    // If the request is unsuccessful, the method displays a toaster notification with an error message
    async shareDashboard() {
        const response = await selectShareDashboard(this.dashboardId);
        if (response.success) {
            this.setState({shared: response.shared});
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was a problem trying to edit share information'
            });
        }
    }

    // Change the shared password 
    changeSharePassword(event) {
        this.setState({tempSharePassword: event.target.value});
    }
    
    // Sends a request to a server to change the password for a dashboard to a provided password. If the request is successful, the method clears 
    // the temporary password state and displays a toaster notification with a success message. If the request is unsuccessful, the method displays 
    // a toaster notification with an error message
    async submitSharePassword() {
        const {tempSharePassword} = this.state;
        if (tempSharePassword !== '') {
            const response = await submitPassword(this.dashboardId, tempSharePassword);
            if (response.success) {
                this.setState({tempSharePassword: ''});
                ToasterBottom.show({
                    intent: 'success',
                    message: 'Password changed!'
                });
            } else {
                ToasterBottom.show({
                    intent: 'danger',
                    message: response.message || 'There was a problem trying to change the password'
                });
            }
        }
    }

    // Creates a new textarea element, sets its value to a string containing the current platform's URL appended with the dashboardId of the current object,
    // appends the textarea to the body of the document, selects the textarea's contents, copies the selected text to the clipboard and removes the textarea 
    // from the document. It then displays a success message using the ToasterBottom component.
    copyClipboard() {
        const el = document.createElement('textarea');
        el.value = `${process.env.REACT_APP_PLATFORM_URL}/dashboards/${this.dashboardId}`;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        ToasterBottom.show({
            intent: 'success',
            message: 'Copied to clipboard'
        });
    }

    // Render dashboard. The render method returns a JSX element, which will be rendered to the page.
    render() {    
        const {user, owner, shared, spinnerOpen, mapWidth, name, currentLayout, items, passwordPopupOpen, tempPassword, shareDashboardPopupOpen, tempSharePassword} = this.state;

        const objects = [];
        currentLayout.forEach((it) => {
            objects.push(
                <div 
                    key={it.i} 
                    data-grid={{
                        x: it.x, y: it.y, w: it.w, h: it.h, minW: it.minW, maxW: it.maxW, minH: it.minH, maxH: it.maxH
                    }}   
                    style={{width: '100%', height: '100%'}}
                >
                    {components[items[it.i].type].component({
                        id: it.i, 
                        type: items[it.i].type,
                        initialState: items[it.i],
                        user,
                        owner
                    })}
                </div>
            );
        });

        const changeHeaderButtons = [
            {iconWhite: editWhiteIcon, info: 'Edit dashboard', handler: () => this.pushHistory(`/dashboards/edit/${this.dashboardId}`)},
            {iconWhite: shareWhiteIcon, info: 'Share dashboard', handler: this.openSharePopup}
        ];
        
        return ([
            <StyledBox key="mainarea">
                <div 
                    key="mainmap" 
                    id="mainmap" 
                    style={{
                        width: '100%', 
                        height: '100%', 
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        display: 'flex', 
                        flexWrap: 'wrap',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}
                >
                    <GridLayout 
                        className="layout" 
                        cols={this.nCols}
                        width={mapWidth}
                        compactType={null}
                        rowHeight={(mapWidth / this.nCols) - 10}
                        preventCollision
                        style={{width: '100%', height: '100%', overflowY: 'auto'}}
                        isDraggable={false}
                        isResizable={false}
                    >
                        {objects}
                    </GridLayout>
                </div>
                <div 
                    style={{
                        height: '30px', 
                        position: 'fixed', 
                        top: '0px', 
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1, 
                        color: '#FF9D66',
                        fontWeight: 'bold',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center'
                    }} 
                >
                    {name}
                </div>
                {owner === 'self'
                && (
                    <div 
                        style={{
                            height: '30px', 
                            position: 'fixed', 
                            top: '0px', 
                            left: '42px', 
                            zIndex: 1
                        }}
                    >
                        <div key="extra-buttons" style={{height: '100%', padding: '10px', display: 'flex', alignItems: 'center'}}>
                            {changeHeaderButtons.map((button) => (
                                <ButtonWithText 
                                    key={button.info}
                                    text={button.info} 
                                    iconWhite={button.iconWhite}
                                    info={button.info}
                                    handler={button.handler}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </StyledBox>,
            <CustomSpinner key="spinner" isOpen={spinnerOpen} />,
            <PortalOverflowOverlay key="password" id="password" isOpen={passwordPopupOpen} width="350px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    Dashboard Password
                </FormHeader>
                <SettingsDiv>
                    <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
                        <InputGroup
                            leftIcon="lock"
                            placeholder="Password"
                            onChange={this.changePassword}
                            value={tempPassword}
                            type="password"
                            fill
                            large
                        />
                    </div>
                    <div 
                        style={{
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <BlueBorderButton
                            id="cancel"
                            type="button"
                            onClick={this.closePassword}
                        >
                            Cancel
                        </BlueBorderButton>
                        <BlueButton
                            id="save"
                            type="button"
                            onClick={this.confirmPassword}
                        >
                            Submit
                        </BlueButton>
                    </div>
                </SettingsDiv>
            </PortalOverflowOverlay>,
            <PortalOverflowOverlay key="share" id="share" isOpen={shareDashboardPopupOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    Share Dashboard
                </FormHeader>
                <SettingsDiv>
                    <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
                        <div 
                            style={{
                                width: '50%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '18px'
                            }}
                        >
                            Dashboard Shared:
                        </div>
                        <div 
                            style={{
                                width: '50%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Switch 
                                className="custom-switch" 
                                large 
                                checked={shared} 
                                onChange={this.shareDashboard} 
                            />
                        </div> 
                    </div>
                    {shared
                    && (
                        <div 
                            style={{
                                width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}
                        >
                            <InputGroup fill style={{cursor: 'text'}} defaultValue={`${process.env.REACT_APP_PLATFORM_URL}/dashboards/${this.dashboardId}`} disabled />
                            <Tooltip content="Copy to clipboard">
                                <Button minimal style={{width: '40px', height: '30px', background: '#16335B'}} onClick={this.copyClipboard}><FontAwesomeIcon icon={faClipboard} style={{color: 'white', fontSize: '16px'}} /></Button>
                            </Tooltip>
                        </div>
                    )}
                    <div 
                        style={{
                            width: '100%', height: '100%', display: 'flex', alignItems: 'center', marginTop: '10px'
                        }}
                    >
                        <div style={{width: 'calc(100% - 160px)', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <InputGroup
                                leftIcon="lock"
                                disabled={!shared}
                                placeholder="Password"
                                onChange={this.changeSharePassword}
                                value={tempSharePassword}
                                type="password"
                                fill
                                large
                            />
                        </div>
                        <div 
                            style={{
                                width: '155px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '5px'
                            }}
                        >
                            <OrangeButton
                                id="add"
                                type="button"
                                disabled={!shared}
                                width="155px"
                                onClick={this.submitSharePassword}
                            >
                                Change Password
                            </OrangeButton>
                        </div> 
                    </div>
                    {/* <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
                        <InputGroup
                            leftIcon="lock"
                            placeholder="Password"
                            onChange={this.changePassword}
                            value={tempPassword}
                            type="password"
                            fill
                            large
                        />
                    </div> */}
                    <div 
                        style={{
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <BlueBorderButton
                            id="cancel"
                            type="button"
                            onClick={this.closeSharePopup}
                        >
                            Close
                        </BlueBorderButton>
                    </div>
                </SettingsDiv>
            </PortalOverflowOverlay>
        ]);
    }
}

// Export mapState, which is taking the user from the auth in the global state and passing it as a prop to the DashboardPage component
export const mapState = (state) => ({user: state.auth.user});

// Default export the connected mapState and DashboardPage
export default connect(
    mapState
)(DashboardPage);
