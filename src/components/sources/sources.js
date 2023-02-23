/* eslint-disable max-len */
import React from 'react';
import {Box} from 'rebass';
import styled from 'styled-components';
import {
    Alert, Button, Menu, MenuItem, Popover, Text
} from '@blueprintjs/core';
import {map} from 'rxjs/operators';
import {Formik} from 'formik';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {connect} from 'react-redux';
// eslint-disable-next-line camelcase
import jwt_decode from 'jwt-decode';
import {ToasterBottom} from '../../lib/toaster';
import actions from '../../actions';
import createNewIcon from '../../assets/createNew.png';
import {
    getSources, changeSource, createSource, deleteSource
} from '../../api/sources';
import {CustomSpinner, OverflowOverlay} from '../../lib/overlays';
import TextInput from '../../lib/text-input';
import {validationSchema, handleSubmit} from './form-handler';
import {BlueButton, BlueBorderButton} from '../../lib/buttons';
import sourceIcon from '../../assets/sourceBlue.png';

const mqtt = require('mqtt');

const StyledBox = styled(Box)`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
`;

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

const SourcesArea = styled.div`
    width: 100%;
    grid-template-columns: repeat(auto-fill, 150px);
    align-items: center;
    margin-top: 20px;
    flex-wrap: wrap;
`;

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

const StyledIcon = styled.img.attrs((props) => ({src: props.icon}))`
    width: 60px;
    height: 60px;
    margin-bottom: 10px;
    flex-direction: column;
`;

const StyledText = styled(Text)`
    color: white;
    text-align: center;
    font-weight: 550;
    font-size: 16px;
`;

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

const StyledForm = styled.form`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const sourceTypes = {
    stomp: 'Web-Stomp',
    mqtt: 'MQTT'
};

const sourceDefaults = {
    stomp: 'ws://<DOMAIN>:<WEB_STOMP_PORT>/ws',
    mqtt: 'mqtt://<DOMAIN>:<MQTT_PORT>'
};

export class SourcesPage extends React.Component {
    constructor(props) {
        super(props);

        this.user = props.user;
        this.token = props.token;
        this.clearAuth = props.clearAuth;
        this.pushHistory = props.history.push;

        this.state = {
            spinnerOpen: false,
            sources: [],
            formInfo: {
                name: '',
                type: 'stomp',
                url: sourceDefaults.stomp,
                login: '',
                passcode: '',
                vhost: ''
            },
            oldSourceId: null,
            formPopupOpen: false,
            deleteSourcePopupOpen: false
        };
        this.deleteSourceId = null;
        this.deleteSourceName = '';
        this.timeouts = {};

        this.fetchSources = this.fetchSources.bind(this);
        this.checkConnectivity = this.checkConnectivity.bind(this);
        this.checkStompConnectivity = this.checkStompConnectivity.bind(this);
        this.checkMQTTConnectivity = this.checkMQTTConnectivity.bind(this);
        this.setActive = this.setActive.bind(this);
        this.changeSpinner = this.changeSpinner.bind(this);
        this.newSource = this.newSource.bind(this);
        this.editSource = this.editSource.bind(this);
        this.closeFormPopup = this.closeFormPopup.bind(this);
        this.saveFormPopup = this.saveFormPopup.bind(this);
        this.openDeletePopup = this.openDeletePopup.bind(this);
        this.closeDeletePopup = this.closeDeletePopup.bind(this);
        this.removeSource = this.removeSource.bind(this);
        this.changeSourceType = this.changeSourceType.bind(this);
    }

    componentDidMount() {
        if (jwt_decode(this.token).exp < Date.now() / 1000) {
            this.clearAuth();
            ToasterBottom.show({
                intent: 'danger',
                message: 'Connection session has expired. Please login again.'
            });
        } else {
            this.fetchSources();
        }
    }

    setActive(ind) {
        const {sources} = this.state;
        sources[ind].active = true;
        this.setState({sources});
    }

    async fetchSources() {
        this.changeSpinner(true);
        const response = await getSources();
        if (response.success) {
            this.setState({sources: response.sources}, this.checkConnectivity);
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was a problem trying to fetch the sources'
            });
        }

        this.changeSpinner(false);
    }

    checkConnectivity() {
        const {sources} = this.state;
        sources.forEach((s, ind) => {
            try {
                if (s.type === 'stomp') {
                    this.checkStompConnectivity(s, ind);
                } else {
                    this.checkMQTTConnectivity(s, ind);
                }
            } catch {}
        });
    }

    checkMQTTConnectivity(s, ind) {
        try {
            const config = {
                username: s.login,
                password: s.passcode,
            };
            const client = mqtt.connect(`${s.url}`, config);
            client.on('connect', () => {
                client.subscribe('/topic/heartbeat', (err) => {
                    if (!err) {
                        client.publish('/topic/heartbeat', JSON.stringify({heartbeat: true}));
                    }
                });
            });
                
            client.on('message', () => {
                this.setActive(ind);
                client.end();
                try {
                    clearTimeout(this.timeouts[s.name]);
                } catch {}
            });   
            this.timeouts[s.name] = setTimeout(() => {
                client.end();
            }, 5000);
        } catch {}
    }

    checkStompConnectivity(s, ind) {
        try {
            const stompConfig = {
                connectHeaders: {
                    login: s.login,
                    passcode: s.passcode,
                    host: s.vhost
                },
                brokerURL: s.url,
            };
            // eslint-disable-next-line no-undef
            const rxStomp = new RxStomp.RxStomp();
            rxStomp.configure(stompConfig);
            rxStomp.activate();
            const receiptId = s.name;
            rxStomp.watch('/topic/heartbeat', {receipt: receiptId}).pipe(map((message) => (JSON.parse(message.body)))).subscribe(() => {
                this.setActive(ind);
                rxStomp.deactivate();
                try {
                    clearTimeout(this.timeouts[s.name]);
                } catch {}
            });
            rxStomp.watchForReceipt(receiptId, () => {
                rxStomp.publish({destination: '/topic/heartbeat', body: JSON.stringify({heartbeat: true})});
            });
            this.timeouts[s.name] = setTimeout(() => {
                rxStomp.deactivate();
            }, 5000);
        } catch {}
    }

    changeSpinner(value) {
        this.setState({spinnerOpen: value});
    }

    newSource() {
        this.setState({
            formInfo: {
                name: '',
                type: 'stomp',
                url: sourceDefaults.stomp,
                login: '',
                passcode: '',
                vhost: ''
            },
            oldSourceId: null,
            formPopupOpen: true
        });
    }

    editSource(ind) {
        const {sources} = this.state;
        this.setState({
            formInfo: {
                name: sources[ind].name,
                type: sources[ind].type,
                url: sources[ind].url,
                login: sources[ind].login,
                passcode: sources[ind].passcode,
                vhost: sources[ind].vhost
            },
            oldSourceId: sources[ind].id,
            formPopupOpen: true
        });
    }

    closeFormPopup() {
        this.setState({
            formInfo: {
                name: '',
                type: 'stomp',
                url: sourceDefaults.stomp,
                login: '',
                passcode: '',
                vhost: ''
            },
            oldSourceId: null,
            formPopupOpen: false
        });
    }

    async saveFormPopup(formInfo) {
        this.changeSpinner(true);
        const {oldSourceId} = this.state;
        const response = (oldSourceId === null) ? await createSource(formInfo) : await changeSource(formInfo, oldSourceId);
        if (response.success) {
            ToasterBottom.show({
                intent: 'success',
                message: (oldSourceId === null) ? 'Source created successfully' : 'Source saved successfully'
            });
            this.setState({
                formInfo: {
                    name: '',
                    type: 'stomp',
                    url: sourceDefaults.stomp,
                    login: '',
                    passcode: '',
                    vhost: ''
                },
                oldSourceId: null,
                formPopupOpen: false
            });
            this.fetchSources();
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was an error trying to save the source'
            });
        }
        this.changeSpinner(false);
    }

    openDeletePopup(ind) {
        const {sources} = this.state;
        this.deleteSourceId = sources[ind].id;
        this.deleteSourceName = sources[ind].name;
        this.setState({deleteSourcePopupOpen: true});
    }

    closeDeletePopup() {
        this.deleteSourceId = null;
        this.deleteSourceName = '';
        this.setState({deleteSourcePopupOpen: false});
    }

    async removeSource() {
        const response = await deleteSource(this.deleteSourceId);
        if (response.success) {
            ToasterBottom.show({
                intent: 'success',
                message: 'Source deleted successfully'
            });
            this.fetchSources();
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was a problem trying to delete the source'
            });
        }
        this.closeDeletePopup();
    }

    // eslint-disable-next-line class-methods-use-this
    changeSourceType(formikProps, type) {
        const {url} = formikProps.values;

        if (url === sourceDefaults.stomp || url === sourceDefaults.mqtt) {
            formikProps.setFieldValue('url', sourceDefaults[type]);
        }
    }

    render() {    
        const {spinnerOpen, sources, formInfo, formPopupOpen, deleteSourcePopupOpen} = this.state;

        return ([
            <StyledBox>
                <StyledArea>
                    <StyledHeader>
                        SOURCES
                    </StyledHeader>
                    <StyledSubHeader>
                        Manage your Sources
                    </StyledSubHeader>
                    <SourcesArea style={{display: (sources.length < 4) ? 'flex' : 'grid', justifyContent: (sources.length < 4) ? 'space-evenly' : 'space-around'}}>
                        {sources.map((s, ind) => (
                            <div 
                                key={`Source_${ind}`}
                                style={{
                                    width: '150px', minHeight: '160px', background: (s.active) ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)', padding: '10px', marginTop: '20px', borderRadius: '10px'
                                }}
                            >
                                <div style={{width: '100%', height: '20px', display: 'flex', alignItems: 'center'}}>
                                    <div style={{width: '20px', height: '20px', borderRadius: '20px', background: (s.active) ? '#7ABF43' : '#DE162F'}} />
                                    <div 
                                        style={{
                                            width: '45px', height: '20px', marginLeft: 'auto', display: 'flex', justifyContent: 'space-between'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faEdit} style={{color: '#16335B', fontSize: '18px', cursor: 'pointer'}} onClick={() => this.editSource(ind)} />
                                        <FontAwesomeIcon icon={faTrashAlt} style={{color: '#DE162F', fontSize: '18px', cursor: 'pointer'}} onClick={() => this.openDeletePopup(ind)} />
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
                                    <img src={sourceIcon} alt="Source" style={{width: '60px', height: '60px'}} />
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
                                    {s.name}
                                </div>
                            </div>
                        ))}
                        <div 
                            style={{
                                width: '150px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px'
                            }}
                        >
                            <NewButton minimal onClick={this.newSource} style={{textAlign: 'center'}}>
                                <StyledIcon icon={createNewIcon} />
                                <StyledText>Add New Source</StyledText>
                            </NewButton>
                        </div>
                    </SourcesArea>
                </StyledArea>
            </StyledBox>,
            <OverflowOverlay key="form" id="form" isOpen={formPopupOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    Source Info
                </FormHeader>
                <Formik
                    initialValues={{
                        name: formInfo.name, type: formInfo.type, url: formInfo.url, login: formInfo.login, passcode: formInfo.passcode, vhost: formInfo.vhost
                    }}
                    validationSchema={validationSchema}
                    validateOnChange={false}
                    validateOnBlur={false}
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
                            <Popover popoverClassName="pagination-popover">
                                <BlueBorderButton width="300px" rightIcon="caret-down" type="button" marginBottom="10px">
                                    {sourceTypes[formikProps.values.type]}
                                </BlueBorderButton>
                                <Menu>
                                    {Object.keys(sourceTypes).map((sType) => (
                                        <MenuItem key={`sourceType_${sType}`} text={sourceTypes[sType]} onClick={() => { formikProps.setFieldValue('type', sType); this.changeSourceType(formikProps, sType); }} />
                                    ))}
                                </Menu>
                            </Popover>
                            <TextInput
                                name="url"
                                type="text"
                                leftIcon="link"
                                placeholder="Url/Port"
                                formikProps={{...formikProps}}
                                width="300px"
                                fill
                            />
                            <TextInput
                                name="login"
                                type="text"
                                leftIcon="person"
                                placeholder="Login"
                                formikProps={{...formikProps}}
                                width="300px"
                                fill
                            />
                            <TextInput
                                name="passcode"
                                type="text"
                                leftIcon="lock"
                                placeholder="Passcode"
                                formikProps={{...formikProps}}
                                width="300px"
                                fill
                            />
                            {formikProps.values.type === 'stomp'
                            && (
                                <TextInput
                                    name="vhost"
                                    type="text"
                                    leftIcon="wrench"
                                    placeholder="Vhost"
                                    formikProps={{...formikProps}}
                                    width="300px"
                                    fill
                                />
                            )}
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
            <Alert key="delete-source-alert" style={{background: 'white', color: 'black'}} usePortal={false} cancelButtonText="Cancel" confirmButtonText="Delete" icon="trash" intent="danger" isOpen={deleteSourcePopupOpen} onCancel={this.closeDeletePopup} onConfirm={this.removeSource}>
                <p>
                    Are you sure you want to delete the source
                    <b style={{marginLeft: '5px'}}>{this.deleteSourceName}</b>
                    ?
                </p>
            </Alert>,
            <CustomSpinner key="spinner" isOpen={spinnerOpen} />
        ]);
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
)(SourcesPage);
