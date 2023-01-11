/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */

/*
* Importing the necessary modules
*/ 
import React from 'react';
import styled from 'styled-components';
import {
    Alert, EditableText, InputGroup, Menu, MenuItem, NumericInput, Popover, Tooltip
} from '@blueprintjs/core';
import {
    faClone, faCog, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {PortalOverflowOverlay} from '../../../lib/overlays';
import {BlueBorderButton, BlueButton} from '../../../lib/buttons';

/*
* Style FormHeader
*/
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

/*
* Style SettingsDiv
*/
const SettingsDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

// Takes in a date object and returns a formatted string representation of that date. First gets the day, month and year values from the date object and stores them
// in separate variables. It then gets the hour, minute and second values and stores them in separate variables as well.
// Then checks the length of each of these values and if the length is 1, it adds a leading zero to the value. For example, if the month is 9, the value will be changed to 09.
// Finally, the function returns a string that is formatted as "dd/mm/yyyy, hh:mm:ss", using the day, month, year, hour, minute and second values that were extracted from the date object.
const formatDate = (date) => {
    const day = ((String(date.getDate())).length === 1) ? `0${String(date.getDate())}` : String(date.getDate());
    const month = ((String(date.getMonth() + 1)).length === 1) ? `0${String(date.getMonth() + 1)}` : String(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = ((String(date.getHours())).length === 1) ? `0${String(date.getHours())}` : String(date.getHours());
    const minutes = ((String(date.getMinutes())).length === 1) ? `0${String(date.getMinutes())}` : String(date.getMinutes());
    const seconds = ((String(date.getSeconds())).length === 1) ? `0${String(date.getSeconds())}` : String(date.getSeconds());

    return (`${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`);
};

class Alive extends React.Component {
    // The constructor of the class that initializes the variables.
    // It takes in props as an argument and utilizes the props to
    // set up the initial state of the component. It also sets up the type,
    // updateItem, deleteItem and cloneComponent props which are used to update,
    // delete, or clone components. It then sets up the properties of the state,
    // such as the id, available sources, name, source, topic, timeout, popoverOpen,
    // deletePopupOpen, tempSource, tempTopic, tempTimeout, lastSend, activeText,
    // smallIcon, fontSize and fontSize2. 
    constructor(props) {
        super(props);

        this.type = props.type;
        this.updateItem = props.updateItem;
        this.deleteItem = props.deleteItem;
        this.cloneComponent = props.cloneComponent;

        this.state = {
            id: props.id,
            availableSources: props.availableSources,
            name: props.initialState.name || 'Alive',
            source: props.initialState.source || 'Select source',
            topic: props.initialState.topic || '',
            timeout: props.initialState.timeout || 1000,
            popoverOpen: false,
            deletePopupOpen: false,
            tempSource: 'Select source',
            tempTopic: '',
            tempTimeout: 1000,
            lastSend: true,
            activeText: true,
            smallIcon: false,
            fontSize: 16,
            fontSize2: 16
        };

        this.sendUpdate = this.sendUpdate.bind(this);
        this.delete = this.delete.bind(this);
        this.changeName = this.changeName.bind(this);
        this.openPopup = this.openPopup.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.closeConfirmPopup = this.closeConfirmPopup.bind(this);
        this.openDelete = this.openDelete.bind(this);
        this.closeDelete = this.closeDelete.bind(this);
        this.changeSource = this.changeSource.bind(this);
        this.changeTopic = this.changeTopic.bind(this);
        this.changeTimeout = this.changeTimeout.bind(this);
        this.resize = this.resize.bind(this);
        this.clone = this.clone.bind(this);
    }

    //  Receives the props passed to a component as an argument and 
    // returns an object to update the state and
    // is updated with values from the props, with default values
    // specified for certain properties if they are not present in the props.
    static getDerivedStateFromProps(props) {
        return {
            id: props.id,
            availableSources: props.availableSources,
            name: props.initialState.name || 'Alive',
            source: props.initialState.source || 'Select source',
            topic: props.initialState.topic || '',
            timeout: props.initialState.timeout || 1000
        };
    }

    // Update the value of an item in the state and send the update to the
    // server. It takes in two arguments: key, which is the name
    // being updated and value, which is the new value.
    sendUpdate(key, value) {
        const {id} = this.state;
        this.updateItem(id, key, value);
    }

    // Closes a deletePopup and then calls deleteItem with the component's id 
    // state as an argument.
    delete() {
        const {id} = this.state;
        this.setState({deletePopupOpen: false});
        this.deleteItem(id);
    }

    // Update the name
    changeName(value) {
        this.sendUpdate('name', value);
    }

    // Sets the component's popoverOpen state to true and sets tempSource, tempTopic and tempTimeout to 
    // the current values of source, topic and timeout in the component's state.
    openPopup() {
        const {source, topic, timeout} = this.state;
        this.setState({
            popoverOpen: true,
            tempSource: source,
            tempTopic: topic,
            tempTimeout: timeout
        });
    }

    // Closes the popover
    closePopup() {
        this.setState({
            popoverOpen: false,
            tempSource: 'Select source',
            tempTopic: '',
            tempTimeout: 1000
        });
    }

    // Sends an update to the server with the new source, topic and timeout
    // values and closes the popover
    closeConfirmPopup() {
        const {tempSource, tempTopic, tempTimeout} = this.state;
        this.sendUpdate('source', tempSource);
        this.sendUpdate('topic', tempTopic);
        this.sendUpdate('timeout', tempTimeout);
        this.setState({popoverOpen: false});
    }

    // Opens a popup to confirm the deletion of the component
    openDelete() {
        this.setState({deletePopupOpen: true});
    }

    // Closes the delete popup
    closeDelete() {
        this.setState({deletePopupOpen: false});
    }

    // Updates the component's source in the local state
    changeSource(value) {
        this.setState({tempSource: value});
    }

    // Updates the component's topic in the local state
    changeTopic(event) {
        event.stopPropagation();
        this.setState({tempTopic: event.target.value});
    }

    // Sets the component's tempTimeout state to the provided value
    changeTimeout(value) {
        this.setState({tempTimeout: value});
    }

    // Sets font sizes and other boolean states based on the provided width and height
    resize(width, height) {
        let fontSize = 16;
        let fontSize2 = 16;
        if (width < 200) {
            fontSize = 14;
            fontSize2 = 13;
        }
        if (width > 300) {
            fontSize = 24;
            fontSize2 = 16;
        }
        this.setState({
            lastSend: (height > 135 && width > 100),
            activeText: (height > 40 && width > 90),
            smallIcon: (height < 40 || width < 40),
            fontSize,
            fontSize2
        });
    }

    // Closes the popover and calls the cloneComponent method with the component's id
    clone() {
        const {id} = this.state;
        this.closePopup();
        this.cloneComponent(id);
    }

    // Render alive and a div containing the name of the component,
    // a cog icon which when clicked opens a popup containing settings 
    // for the component, a trash can icon which when clicked opens 
    // an alert asking the user to confirm deleting the component 
    // and the content of the component which is an animated circle with 
    // the text ACTIVE inside it and the last message sent underneath it. 
    // It also detects the resize of the component. The style of the divs 
    // and icons is set within the function.
    render() {
        const {id, availableSources, name, popoverOpen, deletePopupOpen, tempSource, tempTopic, tempTimeout, lastSend, activeText, smallIcon, fontSize, fontSize2} = this.state;

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
                            id={`aliveDiv_${id}`}
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
                                    height: (lastSend) ? '50%' : '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderBottom: (lastSend) ? '2px solid #D0D6DE' : ''
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        maxWidth: '200px',
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
                                    <div
                                        style={{
                                            width: `${(smallIcon) ? fontSize : fontSize + 10}px`,
                                            height: `${(smallIcon) ? fontSize : fontSize + 10}px`,
                                            borderRadius: `${fontSize + 10}px`,
                                            background: '#7ABF43',
                                            marginRight: (activeText) ? '10px' : '0px',
                                            filter: 'blur(2px)',
                                            animation: 'blink 2s linear infinite'
                                        }}
                                    />
                                    {activeText && 'ACTIVE'}
                                </div>
                            </div>
                            {lastSend
                            && (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '50%',
                                        maxHeight: '100px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderBottom: '2px solid #D0D6DE',
                                        padding: '10px',
                                        flexWrap: 'wrap',
                                        fontSize: fontSize2
                                    }}
                                >
                                    <div
                                        style={{
                                            color: '#16335B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '10px'
                                        }}
                                    >
                                        Last sent message:
                                    </div>
                                    <div
                                        style={{
                                            color: '#FF9D66',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {formatDate(new Date())}
                                    </div>
                                </div>
                            )}
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
                            {tempSource}
                        </BlueBorderButton>
                        <Menu>
                            {availableSources.map((s) => (
                                <MenuItem text={s} onClick={() => this.changeSource(s)} />
                            ))}
                        </Menu>
                    </Popover>
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <InputGroup
                            leftIcon="tag"
                            placeholder="Topic"
                            onChange={this.changeTopic}
                            value={tempTopic}
                            fill
                            large
                        />
                    </div>
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
                            Timeout (ms):
                        </div>
                        <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <NumericInput
                                className="numeric-input"
                                clampValueOnBlur
                                minorStepSize={10}
                                onValueChange={this.changeTimeout}
                                placeholder="Timeout"
                                stepSize={100}
                                majorStepSize={1000}
                                defaultValue={+tempTimeout.toFixed(0)}
                                fill
                            />
                        </div>
                    </div>
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

// Returns a JSX element representing an instance of a component. The function takes an object as an argument and uses the properties 
// of the object as props for the returned component.
const createAlive = ({id, type, initialState, updateItem, deleteItem, cloneComponent, sources}) => (
    <Alive
        id={id}
        type={type}
        initialState={initialState}
        updateItem={updateItem}
        deleteItem={deleteItem}
        cloneComponent={cloneComponent}
        availableSources={sources}
    />
);

/*
*
* Default export
*
*/
// The export constant is: 
// createAlive
export default createAlive;
