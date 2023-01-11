/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */

/*
*
* Importing the necessary modules
* e.g. React, modules from our code,
* external modules and etc.
*
*/ 
import React from 'react';
import styled from 'styled-components';
import {
    Alert, EditableText, InputGroup, Menu, MenuItem, Popover, Tooltip
} from '@blueprintjs/core';
import {
    faCog, faTrashAlt, faClone
} from '@fortawesome/free-solid-svg-icons';
/* eslint-disable import/no-unresolved */
import ReactJson from 'react-json-view';
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

class Json extends React.Component {
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
            name: props.initialState.name || 'Json Viewer',
            source: props.initialState.source || 'Select source',
            topic: props.initialState.topic || '',
            variable: props.initialState.variable || '',
            popoverOpen: false,
            deletePopupOpen: false,
            tempSource: 'Select source',
            tempTopic: '',
            tempVariable: '',
            fontSize: 14
        };
        this.value = {
            string: 'this is a test ...',
            integer: 42,
            array: [1, 2, 3, 'test'],
            float: 3.14159,
            undefined,
            object: {
                'first-child': true,
                'second-child': false,
                'last-child': null
            },
            string_number: '1234',
            date: 'Wed, Mar 17, 2021, 02:59 PM'
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
        this.clone = this.clone.bind(this);
        this.resize = this.resize.bind(this);
    }

    // Returns an object containing values that should be added to the component's state based on the new props. 
    // In this case, the returned object contains the values of the id, name and url props, with default values used
    // if the props are not defined.
    static getDerivedStateFromProps(props) {
        return {
            id: props.id,
            availableSources: props.availableSources,
            name: props.initialState.name || 'Json Viewer',
            source: props.initialState.source || 'Select source',
            topic: props.initialState.topic || '',
            variable: props.initialState.variable || ''
        };
    }

    // Appears to take in a key and a value argument and call the updateItem function with the
    // component's id state variable, the key and the value as arguments.
    sendUpdate(key, value) {
        const {id} = this.state;
        this.updateItem(id, key, value);
    }

    // Sets the deletePopupOpen state variable to false and then calls the deleteItem function with the component's 
    // id state variable as an argument.
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
        const {source, topic, variable} = this.state;
        this.setState({
            popoverOpen: true,
            tempSource: source,
            tempTopic: topic,
            tempVariable: variable
        });
    }

    // Closes the pop up and sets values to popoverOpen and tempUrl 
    closePopup() {
        this.setState({
            popoverOpen: false,
            tempSource: 'Select source',
            tempTopic: '',
            tempVariable: ''
        });
    }

    // Update the url state variable based on the value of the tempUrl state variable and set the popoverOpen state variable to false.
    closeConfirmPopup() {
        const {tempSource, tempTopic, tempVariable} = this.state;
        this.sendUpdate('source', tempSource);
        this.sendUpdate('topic', tempTopic);
        this.sendUpdate('variable', tempVariable);
        this.setState({popoverOpen: false});
    }

    // Sets the deletePopupOpen state variable to true.
    openDelete() {
        this.setState({deletePopupOpen: true});
    }

    // Sets the deletePopupOpen state variable to false
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

    // Close a "popup" and call the cloneComponent function with the value of the id state variable as an argument.
    clone() {
        const {id} = this.state;
        this.closePopup();
        this.cloneComponent(id);
    }

    // Resizes the fontSize according to width
    resize(width, height) {
        let fontSize = 14;
        if (width < 300) {
            fontSize = 12;
            if (height < 200) {
                fontSize = 10;
            }
        } else if (height < 200) {
            fontSize = 12;
        }
        this.setState({fontSize});
    }

    // Returning a description of what the user interface (UI) of the component should look like. More specifically it returns a div element with some nested elements that
    // include an EditableText component and an iframe element. The div element has several inline styles applied to it and the iframe element's src attribute is set to the
    // value of the url  in the component's state, after some formatting is applied to it. The render function is called every time the component's state or props change
    // and the UI is updated to reflect the current state.
    render() {
        const {id, availableSources, name, popoverOpen, deletePopupOpen, tempSource, tempTopic, tempVariable, fontSize} = this.state;

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
                            id={`jsonDiv_${id}`}
                            style={{
                                width: '100%',
                                height: 'calc(100% - 35px)',
                                marginTop: '10px',
                                overflowY: 'auto',
                                fontSize: `${fontSize}px`
                            }}
                        >
                            <ReactJson
                                src={this.value}
                                theme="google"
                                style={{width: '100%', height: '100%'}}
                                iconStyle="triangle"
                                enableClipboard
                                displayObjectSize={false}
                                displayDataTypes={false}
                                quotesOnKeys={false}
                                displayArrayKey={false}
                            />
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

// Takes the arguments id, type and initialState and pass them to Json. The values are determined by the values 
// of the properties in the object passed to Json.
const createJson = ({id, type, initialState, updateItem, deleteItem, cloneComponent, sources}) => (
    <Json
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
// createJson
export default createJson;
