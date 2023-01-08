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
    faCheck, faCog, faTimes, faTrashAlt, faClone
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {PortalOverflowOverlay} from '../../../lib/overlays';
import {
    BlueBorderButton, BlueButton, OrangeButton
} from '../../../lib/buttons';
import logsPlaceholder from '../../../assets/logsPlaceholder.png';

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
    position: relative;
`;

// Style FormSubHeader
const FormSubHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    font-size: 18px;
    color: #16335B;
`;

// Style SettingsDiv
const SettingsDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

class Logs extends React.Component {
    // It sets the initial type, state, updateItem etc.
    constructor(props) {
        super(props);

        this.type = props.type;
        this.updateItem = props.updateItem;
        this.deleteItem = props.deleteItem;
        this.cloneComponent = props.cloneComponent;

        this.state = {
            id: props.id,
            availableSources: props.availableSources,
            name: props.initialState.name || 'Logs',
            source: props.initialState.source || 'Select source',
            topic: props.initialState.topic || '',
            variable: props.initialState.variable || '',
            maxMessages: props.initialState.maxMessages || -1,
            colorKeys: props.initialState.colorKeys || [],
            colorValues: props.initialState.colorValues || [],
            popoverOpen: false,
            deletePopupOpen: false,
            keyValuePopupOpen: false,
            tempSource: 'Select source',
            tempTopic: '',
            tempVariable: '',
            tempMaxMessages: -1,
            tempColorKeys: [],
            tempColorValues: [],
            newColorKey: '',
            newColorValue: ''
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
        this.changeVariable = this.changeVariable.bind(this);
        this.changeMaxMessages = this.changeMaxMessages.bind(this);
        this.addColorKey = this.addColorKey.bind(this);
        this.editColorKey = this.editColorKey.bind(this);
        this.editNewColorKey = this.editNewColorKey.bind(this);
        this.removeColorKey = this.removeColorKey.bind(this);
        this.openKeyValuePairs = this.openKeyValuePairs.bind(this);
        this.back = this.back.bind(this);
        this.clone = this.clone.bind(this);
    }

    // Returns an object containing values that should be added to the component's state based on the new props. 
    // In this case, the returned object contains the values of the id, name, and url props, with default values used if the props are not defined.
    static getDerivedStateFromProps(props) {
        return {
            id: props.id,
            availableSources: props.availableSources,
            name: props.initialState.name || 'Logs',
            source: props.initialState.source || 'Select source',
            topic: props.initialState.topic || '',
            variable: props.initialState.variable || '',
            maxMessages: props.initialState.maxMessages || -1,
            colorKeys: props.initialState.colorKeys || [],
            colorValues: props.initialState.colorValues || []
        };
    }

    // Appears to take in a key and a value argument and call the updateItem function with the component's id state variable, the key, and the value as arguments.
    sendUpdate(key, value) {
        const {id} = this.state;
        this.updateItem(id, key, value);
    }

    // Sets the deletePopupOpen state variable to false and then calls the deleteItem function with the component's id state variable as an argument.
    delete() {
        const {id} = this.state;
        this.setState({deletePopupOpen: false});
        this.deleteItem(id);
    }

    // Updates the name
    changeName(value) {
        this.sendUpdate('name', value);
    }

    // Opens the pop up and sets values to popoverOpen and tempUrl 
    openPopup() {
        const {source, topic, variable, maxMessages, colorKeys, colorValues} = this.state;
        this.setState({
            popoverOpen: true,
            tempSource: source,
            tempTopic: topic,
            tempVariable: variable,
            tempMaxMessages: maxMessages,
            tempColorKeys: [...colorKeys],
            tempColorValues: [...colorValues],
            newColorKey: '',
            newColorValue: ''
        });
    }

    // Closes the pop up and sets values to popoverOpen and tempUrl 
    closePopup() {
        this.setState({
            popoverOpen: false,
            keyValuePopupOpen: false,
            tempSource: 'Select source',
            tempTopic: '',
            tempVariable: '',
            tempMaxMessages: -1,
            tempColorKeys: [],
            tempColorValues: [],
            newColorKey: '',
            newColorValue: ''
        });
    }

    // Update the url state variable based on the value of the tempUrl state variable and set the popoverOpen state variable to false.
    closeConfirmPopup() {
        const {tempSource, tempTopic, tempVariable, tempMaxMessages, tempColorKeys, tempColorValues} = this.state;
        this.sendUpdate('source', tempSource);
        this.sendUpdate('topic', tempTopic);
        this.sendUpdate('variable', tempVariable);
        this.sendUpdate('maxMessages', tempMaxMessages);
        this.sendUpdate('colorKeys', tempColorKeys);
        this.sendUpdate('colorValues', tempColorValues);
        this.setState({popoverOpen: false, keyValuePopupOpen: false});
    }

    // Sets the deletePopupOpen state variable to true.
    openDelete() {
        this.setState({deletePopupOpen: true});
    }

    // Sets the deletePopupOpen state variable to false.
    closeDelete() {
        this.setState({deletePopupOpen: false});
    }

    // Change the state by setting the value of tempSource to the value
    changeSource(value) {
        this.setState({tempSource: value});
    }

    // Change the state based on user input.
    changeTopic(event) {
        event.stopPropagation();
        this.setState({tempTopic: event.target.value});
    }

    // Change the state variables based on user input.
    changeVariable(event) {
        event.stopPropagation();
        this.setState({tempVariable: event.target.value});
    }

    // Sets the tempMaxMessages in the component's state
    changeMaxMessages(value) {
        this.setState({tempMaxMessages: value});
    }

    // Adds a new key-value pair to the component's state, if both the key and value are not empty strings
    addColorKey(key, value) {
        if (key !== '' && value !== '') {
            const {tempColorKeys, tempColorValues} = this.state;
            tempColorKeys.push(key);
            tempColorValues.push(value);
            this.setState({
                tempColorKeys,
                tempColorValues,
                newColorKey: '',
                newColorValue: ''
            }, () => {
                const keywordsDiv = document.getElementById('keywordsDiv');
                keywordsDiv.scrollTop = keywordsDiv.scrollHeight;
            });
        }
    }

    // Updates an existing key-value pair at a given index in the component's state
    editColorKey(ind, key, value) {
        const {tempColorKeys, tempColorValues} = this.state;
        tempColorKeys[ind] = key;
        tempColorValues[ind] = value;
        this.setState({tempColorKeys, tempColorValues});
    }

    // Updates the state with new key and value strings that have not yet been added as a key-value pair
    editNewColorKey(key, value) {
        this.setState({
            newColorKey: key,
            newColorValue: value
        });
    }

    // Removes a key-value pair at a given index from the component's state
    removeColorKey(ind) {
        const {tempColorKeys, tempColorValues} = this.state;
        tempColorKeys.splice(ind, 1);
        tempColorValues.splice(ind, 1);
        this.setState({tempColorKeys, tempColorValues});
    }

    // Sets the keyValuePopupOpen of the component's state to true and the popoverOpen to false
    openKeyValuePairs() {
        this.setState({popoverOpen: false, keyValuePopupOpen: true});
    }

    // Sets the popoverOpen of the component's state to true and the keyValuePopupOpen to false
    back() {
        this.setState({popoverOpen: true, keyValuePopupOpen: false});
    }

    // Close a "popup" and call the cloneComponent function with the value of the id state variable as an argument.
    clone() {
        const {id} = this.state;
        this.closePopup();
        this.cloneComponent(id);
    }

    // Render the logs. First by getting some values from this.state, which is an object that contains several pieces of state for the component.
    //  These values are then used in the JSX element that is returned, which is a div element with several nested elements inside it. Some of 
    // these elements are custom or external components and style it. The timeSpan, minint, meanint and maxint states are used to render a Tooltip 
    // component, which is a custom or external component that displays additional information when hovered over. 
    render() {
        const {id, availableSources, name, popoverOpen, deletePopupOpen, keyValuePopupOpen, tempSource, tempTopic, tempVariable, tempMaxMessages, tempColorKeys, tempColorValues, newColorKey, newColorValue} = this.state;

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
                <div
                    id={`logsDiv_${id}`}
                    style={{
                        width: '100%',
                        height: 'calc(100% - 35px)',
                        maxHeight: '100%',
                        marginTop: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <img src={logsPlaceholder} alt="" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                </div>
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
                        <InputGroup
                            leftIcon="variable"
                            placeholder="Variable"
                            onChange={this.changeVariable}
                            value={tempVariable}
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
                            Max number of messages (-1 for no limit):
                        </div>
                        <div
                            style={{
                                width: '30%', height: '100%', marginLeft: 'auto', display: 'flex', alignItems: 'center'
                            }}
                        >
                            <NumericInput
                                className="numeric-input"
                                clampValueOnBlur
                                minorStepSize={1}
                                onValueChange={this.changeMaxMessages}
                                placeholder="Max"
                                stepSize={1}
                                majorStepSize={10}
                                min={-1}
                                defaultValue={+tempMaxMessages.toFixed(0)}
                                fill
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <OrangeButton
                            id="key-value pairs"
                            type="button"
                            width="180px"
                            onClick={this.openKeyValuePairs}
                        >
                            Edit Keywords
                        </OrangeButton>
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
            </Alert>,
            <PortalOverflowOverlay key="key-value-pairs" id="key-value-pairs" isOpen={keyValuePopupOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    {`${name} Settings`}
                </FormHeader>
                <FormSubHeader>
                    Keywords
                </FormSubHeader>
                <SettingsDiv>
                    <div
                        id="keywordsDiv"
                        style={{
                            width: '100%', maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', marginTop: '-5px'
                        }}
                    >
                        {tempColorKeys.map((k, ind) => (
                            <div
                                style={{
                                    width: '100%', height: '50px', padding: '5px', display: 'flex', marginTop: '5px'
                                }}
                            >
                                <div style={{width: '180px', height: '100%', display: 'flex', alignItems: 'center'}}>
                                    <InputGroup
                                        placeholder="Keyword"
                                        onChange={(event) => this.editColorKey(ind, event.target.value, tempColorValues[ind])}
                                        defaultValue={k}
                                        fill
                                        large
                                    />
                                </div>
                                <div
                                    style={{
                                        width: '180px', height: '100%', marginLeft: '10px', display: 'flex', alignItems: 'center'
                                    }}
                                >
                                    <InputGroup
                                        placeholder="Color"
                                        onChange={(event) => this.editColorKey(ind, tempColorKeys[ind], event.target.value)}
                                        defaultValue={tempColorValues[ind]}
                                        fill
                                        large
                                    />
                                </div>
                                <div
                                    style={{
                                        width: '30px', marginLeft: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTimes} style={{color: '#DE162F', cursor: 'pointer', fontSize: '20px'}} onClick={() => this.removeColorKey(ind)} />
                                </div>
                            </div>
                        ))}
                        <div
                            style={{
                                width: '100%', height: '50px', padding: '5px', display: 'flex', marginTop: '5px'
                            }}
                        >
                            <div style={{width: '180px', height: '100%', display: 'flex', alignItems: 'center'}}>
                                <InputGroup
                                    placeholder="Keyword"
                                    onChange={(event) => this.editNewColorKey(event.target.value, newColorValue)}
                                    value={newColorKey}
                                    fill
                                    large
                                />
                            </div>
                            <div
                                style={{
                                    width: '180px', height: '100%', marginLeft: '10px', display: 'flex', alignItems: 'center'
                                }}
                            >
                                <InputGroup
                                    placeholder="Color"
                                    onChange={(event) => this.editNewColorKey(newColorKey, event.target.value)}
                                    value={newColorValue}
                                    fill
                                    large
                                />
                            </div>
                            <div
                                style={{
                                    width: '30px', marginLeft: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <FontAwesomeIcon icon={faCheck} style={{color: '#7ABF43', cursor: 'pointer', fontSize: '20px'}} onClick={() => this.addColorKey(newColorKey, newColorValue)} />
                            </div>
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
                        <BlueBorderButton
                            id="back"
                            type="button"
                            marginLeft="10px"
                            onClick={this.back}
                        >
                            Back
                        </BlueBorderButton>
                        <BlueButton
                            id="save"
                            type="button"
                            marginLeft="10px"
                            onClick={this.closeConfirmPopup}
                        >
                            Save
                        </BlueButton>
                    </div>
                </SettingsDiv>
            </PortalOverflowOverlay>
        ]);
    }
}

// Takes the arguments id, type, initialState etc and pass them to Logs. The values are determined by the values 
// of the properties in the object passed to createLogs.
const createLogs = ({id, type, initialState, updateItem, deleteItem, cloneComponent, sources}) => (
    <Logs
        id={id}
        type={type}
        initialState={initialState}
        updateItem={updateItem}
        deleteItem={deleteItem}
        cloneComponent={cloneComponent}
        availableSources={sources}
    />
);

// Default export createLogs
export default createLogs;
