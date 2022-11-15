/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */
import React from 'react';
import styled from 'styled-components';
import {
    Alert, EditableText, InputGroup, Menu, MenuItem, NumericInput, Popover, TextArea, Tooltip
} from '@blueprintjs/core';
import {
    faClone, faCog, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {PortalOverflowOverlay} from '../../../lib/overlays';
import {BlueBorderButton, BlueButton} from '../../../lib/buttons';

const FormHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    font-size: 24px;
    font-weight: bold;
    color: #16335B;
    position: relative;
`;

const SettingsDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const availableTypes = ['GET', 'POST', 'PUT'];

const availableFires = {
    once: 'Fire Once',
    interval: 'Fire Periodically',
};

const formatStatusColor = (status) => {
    const statusString = status.toString()[0];
    switch (statusString) {
    case '1':
        return '#d0d5de';
    case '2':
        return '#57ae13';
    case '3':
        return '#1e3e60';
    case '4':
        return '#de152e';
    case '5':
        return '#a71022';
    default:
        return '#FF9D66';
    }
};

class RestRequest extends React.Component {
    constructor(props) {
        super(props);

        this.type = props.type;
        this.updateItem = props.updateItem;
        this.deleteItem = props.deleteItem;
        this.cloneComponent = props.cloneComponent;

        this.state = {
            id: props.id,
            name: props.initialState.name || 'Rest Request',
            url: props.initialState.url || '',
            requestType: props.initialState.requestType || 'GET',
            fire: props.initialState.fire || 'once',
            interval: props.initialState.interval || 5000,
            headers: props.initialState.headers || '',
            body: props.initialState.body || '',
            params: props.initialState.params || '',
            popoverOpen: false,
            deletePopupOpen: false,
            tempUrl: '',
            tempRequestType: 'GET',
            tempFire: 'once',
            tempInterval: 5000,
            tempHeaders: '',
            tempBody: '',
            tempParams: '',
            activeText: true,
            fontSize: 18,
        };

        this.sendUpdate = this.sendUpdate.bind(this);
        this.delete = this.delete.bind(this);
        this.changeName = this.changeName.bind(this);
        this.openPopup = this.openPopup.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.closeConfirmPopup = this.closeConfirmPopup.bind(this);
        this.openDelete = this.openDelete.bind(this);
        this.closeDelete = this.closeDelete.bind(this);
        this.changeUrl = this.changeUrl.bind(this);
        this.changeRequestType = this.changeRequestType.bind(this);
        this.changeFire = this.changeFire.bind(this);
        this.changeInterval = this.changeInterval.bind(this);
        this.changeHeaders = this.changeHeaders.bind(this);
        this.changeBody = this.changeBody.bind(this);
        this.changeParams = this.changeParams.bind(this);
        this.resize = this.resize.bind(this);
        this.clone = this.clone.bind(this);
    }

    static getDerivedStateFromProps(props) {
        return {
            id: props.id,
            name: props.initialState.name || 'Rest Request',
            url: props.initialState.url || '',
            requestType: props.initialState.requestType || 'GET',
            fire: props.initialState.fire || 'once',
            interval: props.initialState.interval || 5000,
            headers: props.initialState.headers || '',
            body: props.initialState.body || '',
            params: props.initialState.params || ''
        };
    }

    sendUpdate(key, value) {
        const {id} = this.state;
        this.updateItem(id, key, value);
    }

    delete() {
        const {id} = this.state;
        this.setState({deletePopupOpen: false});
        this.deleteItem(id);
    }

    changeName(value) {
        this.sendUpdate('name', value);
    }

    openPopup() {
        const {url, requestType, fire, interval, headers, body, params} = this.state;
        this.setState({
            popoverOpen: true,
            tempUrl: url,
            tempRequestType: requestType,
            tempFire: fire,
            tempInterval: interval,
            tempHeaders: headers,
            tempBody: body,
            tempParams: params
        });
    }

    closePopup() {
        this.setState({
            popoverOpen: false,
            tempUrl: '',
            tempRequestType: 'GET',
            tempFire: 'once',
            tempInterval: 5000,
            tempHeaders: '',
            tempBody: '',
            tempParams: ''
        });
    }

    closeConfirmPopup() {
        const {tempUrl, tempRequestType, tempFire, tempInterval, tempHeaders, tempBody, tempParams} = this.state;
        this.sendUpdate('url', tempUrl);
        this.sendUpdate('requestType', tempRequestType);
        this.sendUpdate('fire', tempFire);
        this.sendUpdate('interval', tempInterval);
        this.sendUpdate('headers', tempHeaders);
        this.sendUpdate('body', tempBody);
        this.sendUpdate('params', tempParams);
        this.setState({popoverOpen: false});
    }

    openDelete() {
        this.setState({deletePopupOpen: true});
    }

    closeDelete() {
        this.setState({deletePopupOpen: false});
    }

    changeUrl(event) {
        event.stopPropagation();
        this.setState({tempUrl: event.target.value});
    }

    changeRequestType(value) {
        this.setState({tempRequestType: value});
    }

    changeFire(value) {
        this.setState({tempFire: value});
    }

    changeInterval(value) {
        this.setState({tempInterval: value});
    }

    changeHeaders(event) {
        event.stopPropagation();
        this.setState({tempHeaders: event.target.value});
    }

    changeBody(event) {
        event.stopPropagation();
        this.setState({tempBody: event.target.value});
    }

    changeParams(event) {
        event.stopPropagation();
        this.setState({tempParams: event.target.value});
    }

    resize(width, height) {
        let fontSize = 18;
        if (width < 200) {
            fontSize = 16;
        }
        if (width > 300) {
            fontSize = 26;
        }
        this.setState({
            activeText: (height > 40 && width > 90),
            fontSize
        });
    }

    clone() {
        const {id} = this.state;
        this.closePopup();
        this.cloneComponent(id);
    }

    render() {
        const {id, name, popoverOpen, deletePopupOpen, tempUrl, tempRequestType, tempFire, tempInterval, tempHeaders, tempBody, tempParams, activeText, fontSize} = this.state;

        return ([
            <div
                style={{
                    width: '100%', height: '100%', background: 'white', padding: '1%', display: 'flex', flexDirection: 'column', borderRadius: '10px', fontSize: '16px'
                }}
            >
                <div
                    style={{
                        width: '100%',
                        height: '25px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        background: '#16335B',
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                        position: 'relative',
                        fontSize: '13px'
                    }}
                >
                    <div onMouseDown={(e) => e.stopPropagation()}>
                        <EditableText className="name-edit" onChange={this.changeName} onMouseDown={(e) => e.stopPropagation()} placeholder="Component Name" value={name} />
                    </div>
                    <div
                        style={{
                            height: '100%',
                            position: 'absolute',
                            top: '0px',
                            right: '2%',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{paddingRight: '5px'}}>
                            <Tooltip content="Clone component" popoverClassName="item-info-tooltip">
                                <FontAwesomeIcon icon={faClone} style={{color: 'white', fontSize: '13px', cursor: 'pointer'}} onClick={this.clone} />
                            </Tooltip>
                        </div>
                        <FontAwesomeIcon icon={faCog} style={{color: 'white', cursor: 'pointer'}} onClick={this.openPopup} />

                    </div>
                    <div
                        style={{
                            height: '100%',
                            position: 'absolute',
                            top: '0px',
                            left: '2%',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <FontAwesomeIcon icon={faTrashAlt} style={{color: '#DE162F', cursor: 'pointer'}} onClick={this.openDelete} />
                    </div>
                </div>
                <ReactResizeDetector onResize={this.resize}>
                    {() => (
                        <div
                            id={`restRequestDiv_${id}`}
                            style={{
                                width: '100%',
                                height: 'calc(100% - 35px)',
                                maxHeight: '100%',
                                marginTop: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        maxWidth: '250px',
                                        maxHeight: '50px',
                                        color: '#16335B',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '10px',
                                        fontSize,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {activeText
                                    && (
                                        'Status code: '
                                    )}
                                    <p style={{color: formatStatusColor(200), margin: 0, marginLeft: 5}}>200</p>
                                </div>
                                {activeText
                                    && (
                                        <TextArea
                                            id="response"
                                            style={{
                                                background: 'white',
                                                height: '70px',
                                                resize: 'none',
                                                fontSize: '13px',
                                                fontFamily: 'Roboto,sans-serif',
                                                borderRadius: '5px',
                                                border: '2px solid #16335B',
                                                color: 'black'
                                            }}
                                            disabled
                                            fill
                                            growVertically={false}
                                            placeholder="Request Response"
                                            defaultValue="Request Response"
                                        />
                                    )}
                            </div>
                        </div>
                    )}
                </ReactResizeDetector>
            </div>,
            <PortalOverflowOverlay key="settings" id="settings" isOpen={popoverOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    {`${name} Settings`}
                </FormHeader>
                <SettingsDiv>
                    <Popover popoverClassName="custom-popover">
                        <BlueBorderButton type="button" width="410px" rightIcon="caret-down">
                            {tempRequestType}
                        </BlueBorderButton>
                        <Menu>
                            {availableTypes.map((s) => (
                                <MenuItem text={s} onClick={() => this.changeRequestType(s)} />
                            ))}
                        </Menu>
                    </Popover>
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <InputGroup
                            leftIcon="globe-network"
                            placeholder="Url"
                            onChange={this.changeUrl}
                            value={tempUrl}
                            fill
                            large
                        />
                    </div>
                    <Popover popoverClassName="custom-popover">
                        <BlueBorderButton type="button" width="410px" marginTop="10px" rightIcon="caret-down">
                            {availableFires[tempFire]}
                        </BlueBorderButton>
                        <Menu>
                            {Object.keys(availableFires).map((s) => (
                                <MenuItem text={availableFires[s]} onClick={() => this.changeFire(s)} />
                            ))}
                        </Menu>
                    </Popover>
                    {tempFire === 'interval'
                    && (
                        <div
                            style={{
                                width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                            }}
                        >
                            <div
                                style={{
                                    width: '50%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                                }}
                            >
                                Interval (ms):
                            </div>
                            <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                                <NumericInput
                                    className="numeric-input"
                                    clampValueOnBlur
                                    minorStepSize={10}
                                    onValueChange={this.changeInterval}
                                    placeholder="Interval"
                                    stepSize={100}
                                    majorStepSize={1000}
                                    defaultValue={+tempInterval.toFixed(0)}
                                    fill
                                />
                            </div>
                        </div>
                    )}
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <TextArea
                            id="headers"
                            style={{
                                background: 'white', height: '70px', resize: 'none', fontSize: '13px', fontFamily: 'Roboto, sans-serif', borderRadius: '5px'
                            }}
                            fill
                            growVertically={false}
                            onChange={this.changeHeaders}
                            placeholder="Headers"
                            defaultValue={tempHeaders}
                        />
                    </div>
                    {(tempRequestType === 'POST' || tempRequestType === 'PUT')
                    && (
                        <div
                            style={{
                                width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                            }}
                        >
                            <TextArea
                                id="body"
                                style={{
                                    background: 'white', height: '70px', resize: 'none', fontSize: '13px', fontFamily: 'Roboto, sans-serif', borderRadius: '5px'
                                }}
                                fill
                                growVertically={false}
                                onChange={this.changeBody}
                                placeholder="Body"
                                defaultValue={tempBody}
                            />
                        </div>
                    )}
                    {tempRequestType === 'GET'
                    && (
                        <div
                            style={{
                                width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                            }}
                        >
                            <TextArea
                                id="params"
                                style={{
                                    background: 'white', height: '70px', resize: 'none', fontSize: '13px', fontFamily: 'Roboto, sans-serif', borderRadius: '5px'
                                }}
                                fill
                                growVertically={false}
                                onChange={this.changeParams}
                                placeholder="Params"
                                defaultValue={tempParams}
                            />
                        </div>
                    )}
                    <div
                        style={{
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <BlueBorderButton
                            id="cancel"
                            type="button"
                            onClick={this.closePopup}
                        >
                            Cancel
                        </BlueBorderButton>
                        <BlueButton
                            id="save"
                            type="button"
                            onClick={this.closeConfirmPopup}
                        >
                            Save
                        </BlueButton>
                    </div>
                </SettingsDiv>
            </PortalOverflowOverlay>,
            <Alert key="delete-alert" style={{background: 'white', color: 'black'}} usePortal cancelButtonText="Cancel" confirmButtonText="Delete" icon="trash" intent="danger" isOpen={deletePopupOpen} onCancel={this.closeDelete} onConfirm={this.delete}>
                <p>
                    Are you sure you want to delete the component
                    <b style={{marginLeft: '5px'}}>{name}</b>
                    ?
                </p>
            </Alert>
        ]);
    }
}

const createRestRequest = ({id, type, initialState, updateItem, deleteItem, cloneComponent}) => (
    <RestRequest
        id={id}
        type={type}
        initialState={initialState}
        updateItem={updateItem}
        deleteItem={deleteItem}
        cloneComponent={cloneComponent}
    />
);

export default createRestRequest;
