/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable max-len */

/*
* Importing the necessary modules
*/ 
import React from 'react';
import {Box} from 'rebass';
import styled from 'styled-components';
import {
    Alert, Button, Text
} from '@blueprintjs/core';
import {Formik} from 'formik';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faClone, faEdit, faEye, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import {connect} from 'react-redux';
// eslint-disable-next-line camelcase
import jwt_decode from 'jwt-decode';
import {ToasterBottom} from '../../lib/toaster';
import actions from '../../actions';
import createNewIcon from '../../assets/createNew.png';
import {
    getDashboards, createDashboard, deleteDashboard, cloneDashboard
} from '../../api/dashboards';
import {CustomSpinner, OverflowOverlay} from '../../lib/overlays';
import TextInput from '../../lib/text-input';
import {validationSchema, handleSubmit} from './form-handler';
import {
    BlueButton, BlueBorderButton, OrangeButton
} from '../../lib/buttons';
import dashboardIcon from '../../assets/dashboardBlue.png';

// Style StyledBox
const StyledBox = styled(Box)`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
`;

// Style StyledArea
const StyledArea = styled(Box)`
    width: 750px;
    min-height: 500px;
    display: block;
    flex-direction: column;
    justify-content: center;
    padding: 20px;
    padding-top: 30px;
    padding-bottom: 30px;
    margin: auto!important;
`;

// Style StyledHeader
const StyledHeader = styled.h2`
    text-align: center;
    color: white;
    margin: 0px;
    font-size: 65px;
    font-weight: 300;
    letter-spacing: 5px;
`;

// Style StyledSubHeader
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

// Style DashboardsArea
const DashboardsArea = styled.div`
    width: 100%;
    grid-template-columns: repeat(auto-fill, 150px);
    align-items: center;
    margin-top: 20px;
    flex-wrap: wrap;
`;

// Style NewButton
const NewButton = styled(Button)`
    border: 2px solid transparent;
    :hover {
        border: 2px solid #FF9D66;
        background: none!important;
    }
    :active {
        top: 2px;
        position: relative;
    }
`;

// Style StyledIcon
const StyledIcon = styled.img.attrs((props) => ({src: props.icon}))`
    width: 60px;
    height: 60px;
    margin-bottom: 10px;
    flex-direction: column;
`;

// Style StyledText
const StyledText = styled(Text)`
    color: white;
    text-align: center;
    font-weight: 550;
    font-size: 16px;
`;

/*
* Style FormHeader
*/
const FormHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: bold;
    color: #16335B;
`;

// Style StyledForm
const StyledForm = styled.form`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export class DashboardsPage extends React.Component {
    // The constructor of the class that initializes user, token, clearAuth etc.
    constructor(props) {
        super(props);

        this.user = props.user;
        this.token = props.token;
        this.clearAuth = props.clearAuth;
        this.pushHistory = props.history.push;

        this.state = {
            spinnerOpen: false,
            dashboards: [],
            formInfo: {name: ''},
            formPopupOpen: false,
            deleteDashboardPopupOpen: false,
            cloneNamePopupOpen: false
        };
        this.deleteDashboardId = null;
        this.deleteDashboardName = '';
        this.cloneName = '';
        this.cloneId = '';

        this.fetchDashboards = this.fetchDashboards.bind(this);
        this.changeSpinner = this.changeSpinner.bind(this);
        this.newDashboard = this.newDashboard.bind(this);
        this.closeFormPopup = this.closeFormPopup.bind(this);
        this.saveFormPopup = this.saveFormPopup.bind(this);
        this.openClonePopup = this.openClonePopup.bind(this);
        this.openDeletePopup = this.openDeletePopup.bind(this);
        this.closeDeletePopup = this.closeDeletePopup.bind(this);
        this.removeDashboard = this.removeDashboard.bind(this);
        this.openEditDashboard = this.openEditDashboard.bind(this);
        this.saveCloneDashboard = this.saveCloneDashboard.bind(this);
        this.closeClonePopup = this.closeClonePopup.bind(this);
    }

    // Called immediately after the component is mounted and is used to trigger an action or dispatch an event.
    componentDidMount() {
        if (jwt_decode(this.token).exp < Date.now() / 1000) {
            this.clearAuth();
            ToasterBottom.show({
                intent: 'danger',
                message: 'Connection session has expired. Please login again.'
            });
        } else {
            this.fetchDashboards();
        }
    }

    // Retrieve the dashboards from the server and updating the component's state with the result. It displays a spinner
    // while the request is being made and displays a toast message if there is an error. If the request is successful,
    // it updates the component's state with the retrieved dashboards.
    async fetchDashboards() {
        this.changeSpinner(true);
        const response = await getDashboards();
        if (response.success) {
            this.setState({dashboards: response.dashboards});
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was a problem trying to fetch the dashboards'
            });
        }

        this.changeSpinner(false);
    }

    // Changes the value of the spinnerOpen state to the
    // given value. It is used to open or close the spinner. 
    changeSpinner(value) {
        this.setState({spinnerOpen: value});
    }

    // Create a new dashboard and set the state's forminfo to the name of the one given ad formpopup to true so it pops up.
    newDashboard() {
        this.setState({
            formInfo: {name: ''},
            formPopupOpen: true
        });
    }

    // Closes the popup form
    closeFormPopup() {
        this.setState({
            formInfo: {name: ''},
            formPopupOpen: false
        });
    }


    // Sends a request to create a new dashboard with the specified formInfo. If the request is successful, a success message is displayed 
    // and the form pop-up is closed. The fetchDashboards function is then called to update the list of dashboards. If the request is unsuccessful,
    // an error message is displayed.
    async saveFormPopup(formInfo) {
        this.changeSpinner(true);
        const response = await createDashboard(formInfo);
        if (response.success) {
            ToasterBottom.show({
                intent: 'success',
                message: 'Dashboard created successfully'
            });
            this.setState({
                formInfo: {name: ''},
                formPopupOpen: false
            });
            this.fetchDashboards();
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was an error trying to save the dashboard'
            });
        }
        this.changeSpinner(false);
    }

    // Opens a popup to prompt the user to enter a name for a cloned dashboard. It also saves the name and ID of the dashboard to be 
    // cloned in the component's state.
    openClonePopup(event, ind) {
        event.stopPropagation();
        const {dashboards} = this.state;
        this.cloneName = dashboards[ind].name;
        this.cloneId = dashboards[ind].id;
        this.setState({cloneNamePopupOpen: true});
    }

    // Opens a deleted popup to prompt the user to enter a name for a cloned dashboard. It also saves the name and ID of the dashboard to be 
    // cloned in the component's state.
    openDeletePopup(event, ind) {
        event.stopPropagation();
        const {dashboards} = this.state;
        this.deleteDashboardId = dashboards[ind].id;
        this.deleteDashboardName = dashboards[ind].name;
        this.setState({deleteDashboardPopupOpen: true});
    }

    // Closes the deleted a popup to prompt the user to enter a name for a cloned dashboard. It also saves the name and ID of the dashboard to be 
    // cloned in the component's state.
    closeDeletePopup() {
        this.deleteDashboardId = null;
        this.deleteDashboardName = '';
        this.setState({deleteDashboardPopupOpen: false});
    }

    // Sends a request to delete a dashboard with a given ID and displays a success or error message based on the response. 
    // If the request is successful, it fetches a list of dashboards and closes the delete dashboard popup. If the request is unsuccessful, 
    // it displays an error message and leaves the delete dashboard popup open
    async removeDashboard() {
        const response = await deleteDashboard(this.deleteDashboardId);
        if (response.success) {
            ToasterBottom.show({
                intent: 'success',
                message: 'Dashboard deleted successfully'
            });
            this.fetchDashboards();
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was a problem trying to delete the dashboard'
            });
        }
        this.closeDeletePopup();
    }

    // Navigate to the edit page for the dashboard at index "ind" in the "dashboards" array. It does so by using the "pushHistory" function 
    // from the "history" prop to update the URL to include the ID of the dashboard being edited. The event is stopped from propagating to prevent
    // any other click events from being triggered.
    openEditDashboard(event, ind) {
        const {dashboards} = this.state;
        event.stopPropagation();
        this.pushHistory(`/dashboards/edit/${dashboards[ind].id}`);
    }

    // Fetching a list of dashboards from a server, creating a new dashboard, deleting a dashboard, cloning a dashboard and navigating to the edit page 
    // for a dashboard. Some of the functions also handle displaying and hiding popups and displaying Toast messages in response to the results of the
    // actions they perform.
    async saveCloneDashboard(values) {
        this.changeSpinner(true);
        const response = await cloneDashboard(this.cloneId, values.name);
        if (response.success) {
            ToasterBottom.show({
                intent: 'success',
                message: 'Dashboard cloned successfully'
            });
            this.closeClonePopup();
            this.fetchDashboards();
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was a problem trying to clone the dashboard'
            });
        }
        this.changeSpinner(false);
    }

    // Closes the pop up clone
    closeClonePopup() {
        this.cloneName = '';
        this.cloneId = '';
        this.setState({cloneNamePopupOpen: false});
    }

    // Render dasboards. The render method returns a JSX element, which will be rendered to the page.
    render() {    
        const {spinnerOpen, dashboards, formInfo, formPopupOpen, deleteDashboardPopupOpen, cloneNamePopupOpen} = this.state;

        return ([
            <StyledBox>
                <StyledArea>
                    <StyledHeader>
                        DASHBOARDS
                    </StyledHeader>
                    <StyledSubHeader>
                        Manage your Dashboards
                    </StyledSubHeader>
                    <DashboardsArea style={{display: (dashboards.length < 4) ? 'flex' : 'grid', justifyContent: (dashboards.length < 4) ? 'space-evenly' : 'space-around'}}>
                        {dashboards.map((d, ind) => (
                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                <div 
                                    key={`Dashboard_${ind}`}
                                    style={{
                                        width: '150px', minHeight: '160px', background: 'rgba(255, 255, 255, 0.8)', padding: '10px', marginTop: '20px', borderRadius: '10px'
                                    }}
                                    // onClick={(event) => this.openEditDashboard(event, ind)}
                                    role="button"
                                    tabIndex={ind}
                                >
                                    <div style={{width: '100%', height: '20px', display: 'flex', alignItems: 'center'}}>
                                        <div 
                                            style={{
                                                height: '20px', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '13px'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faEye} style={{color: '#16335B', fontSize: '14px', marginRight: '5px'}} />
                                            {d.views}
                                        </div>
                                        <div 
                                            style={{
                                                width: '70px', height: '20px', marginLeft: 'auto', display: 'flex', justifyContent: 'space-between'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faEdit} style={{color: '#16335B', fontSize: '18px', cursor: 'pointer'}} onClick={(event) => this.openEditDashboard(event, ind)} />
                                            <FontAwesomeIcon icon={faClone} style={{color: '#73859D', fontSize: '18px', cursor: 'pointer'}} onClick={(event) => this.openClonePopup(event, ind)} />
                                            <FontAwesomeIcon icon={faTrashAlt} style={{color: '#DE162F', fontSize: '18px', cursor: 'pointer'}} onClick={(event) => this.openDeletePopup(event, ind)} />
                                        </div>
                                    </div>
                                    <div 
                                        style={{
                                            width: '100%', 
                                            height: '60px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontSize: '60px', 
                                            fontWeight: 'bolder', 
                                            color: '#16335B',
                                            marginTop: '10px'
                                        }}
                                    >
                                        <img src={dashboardIcon} alt="Dashboard" style={{width: '60px', height: '60px'}} />
                                    </div>
                                    <div 
                                        style={{
                                            width: '100%', 
                                            minHeight: '40px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontSize: '20px', 
                                            fontWeight: 'bold', 
                                            color: '#16335B',
                                            marginTop: '10px',
                                            textAlign: 'center',
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {d.name}
                                    </div>
                                </div>
                                <div style={{width: '150px', height: '40px', padding: '5px 0px 5px 0px'}}>
                                    <OrangeButton width="150px" height="30px" icon="eye-open" fontSize="14px" onClick={() => this.pushHistory(`/dashboards/${dashboards[ind].id}`)}>
                                        View Dashboard
                                    </OrangeButton>
                                </div>
                            </div>
                        ))}
                        <div 
                            style={{
                                width: '150px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px'
                            }}
                        >
                            <NewButton minimal onClick={this.newDashboard} style={{textAlign: 'center'}}>
                                <StyledIcon icon={createNewIcon} />
                                <StyledText>Add New Dashboard</StyledText>
                            </NewButton>
                        </div>
                    </DashboardsArea>
                </StyledArea>
            </StyledBox>,
            <OverflowOverlay key="form" id="form" isOpen={formPopupOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    Dashboard Info
                </FormHeader>
                <Formik
                    initialValues={{name: formInfo.name}}
                    validationSchema={validationSchema}
                    onSubmit={(...formikArgs) => handleSubmit(...formikArgs, {saveFormPopup: this.saveFormPopup})}
                >
                    {(formikProps) => (
                        <StyledForm onSubmit={formikProps.handleSubmit} id="signInForm">
                            <TextInput
                                name="name"
                                type="text"
                                leftIcon="tag"
                                placeholder="Name"
                                formikProps={{...formikProps}}
                                width="300px"
                                fill
                            />
                            <div style={{width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
                                <BlueBorderButton
                                    id="cancel"
                                    type="button"
                                    onClick={this.closeFormPopup}
                                >
                                    Cancel
                                </BlueBorderButton>
                                <BlueButton
                                    id="signin"
                                    type="submit"
                                    disabled={formikProps.isSubmitting}
                                    loading={formikProps.isSubmitting}
                                >
                                    Save
                                </BlueButton>
                            </div>
                        </StyledForm>
                    )}
                </Formik>
            </OverflowOverlay>,
            <Alert key="delete-dashboard-alert" style={{background: 'white', color: 'black'}} usePortal={false} cancelButtonText="Cancel" confirmButtonText="Delete" icon="trash" intent="danger" isOpen={deleteDashboardPopupOpen} onCancel={this.closeDeletePopup} onConfirm={this.removeDashboard}>
                <p>
                    Are you sure you want to delete the dashboard
                    <b style={{marginLeft: '5px'}}>{this.deleteDashboardName}</b>
                    ?
                </p>
            </Alert>,
            <CustomSpinner key="spinner" isOpen={spinnerOpen} />,
            <OverflowOverlay key="clone" id="clone" isOpen={cloneNamePopupOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    Clone Dashboard
                </FormHeader>
                <Formik
                    initialValues={{name: this.cloneName}}
                    validationSchema={validationSchema}
                    onSubmit={(...formikArgs) => handleSubmit(...formikArgs, {saveFormPopup: this.saveCloneDashboard})}
                >
                    {(formikProps) => (
                        <StyledForm onSubmit={formikProps.handleSubmit} id="signInForm">
                            <TextInput
                                name="name"
                                type="text"
                                leftIcon="tag"
                                placeholder="Cloned Dashboard Name"
                                formikProps={{...formikProps}}
                                width="300px"
                                fill
                            />
                            <div style={{width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
                                <BlueBorderButton
                                    id="cancel"
                                    type="button"
                                    onClick={this.closeClonePopup}
                                >
                                    Cancel
                                </BlueBorderButton>
                                <BlueButton
                                    id="signin"
                                    type="submit"
                                    disabled={formikProps.isSubmitting}
                                    loading={formikProps.isSubmitting}
                                >
                                    Save
                                </BlueButton>
                            </div>
                        </StyledForm>
                    )}
                </Formik>
            </OverflowOverlay>
        ]);
    }
}

// Export mapState, which is taking the user from the auth in the global state and passing it as a prop to the DashboardPage component
export const mapState = (state) => ({user: state.auth.user, token: state.auth.token});

// Export mapDispatch, takes an argument and returns an object, which is a function that dispatches an "auth.clear" action when called. 
// This action will clear the auth state in the Redux store.
export const mapDispatch = (dispatch) => ({
    clearAuth: () => {
        dispatch(actions.auth.clear());
    }
});

/*
*
* Default export
*
*/
// The export constant is: 
// the connected mapState, mapDispatch  and DashboardPage
export default connect(
    mapState,
    mapDispatch
)(DashboardsPage);
