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
    Alert, EditableText, InputGroup, NumericInput, Tooltip
} from '@blueprintjs/core';
import {
    faClone, faCog, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {PortalOverflowOverlay} from '../../../lib/overlays';
import {BlueBorderButton, BlueButton} from '../../../lib/buttons';

// Defines a styled div element with specific styling properties such as font size,
// font weight and color. It also includes layout properties to center the element and give it a margin.
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

// Creates a styled div element with a width of 100%
// and sets the flex-direction to column and align-items to center.
const SettingsDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

// Takes status as an argument and returns a hexadecimal color code depending on the number.
// The color codes vary depending on the first digit of the status number.
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

class Rest extends React.Component {
    // The constructor of the class. It defines the props,
    // state and functions of the component and binds the functions to the component's context.
    // It also sets the initial values for the props and state variables. Finally, it defines which 
    // functions can be called on the component.
    constructor(props) {
        super(props);

        this.type = props.type;
        this.updateItem = props.updateItem;
        this.deleteItem = props.deleteItem;
        this.cloneComponent = props.cloneComponent;

        this.state = {
            id: props.id,
            name: props.initialState.name || 'Rest Status',
            url: props.initialState.url || '',
            interval: props.initialState.interval || 5000,
            popoverOpen: false,
            deletePopupOpen: false,
            tempUrl: '',
            tempInterval: 5000,
            activeText: true,
            smallIcon: false,
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
        this.changeInterval = this.changeInterval.bind(this);
        this.resize = this.resize.bind(this);
        this.clone = this.clone.bind(this);
    }

    // Returns an object containing values that should be added to the component's state based on the new props. 
    // In this case, the returned object contains the values of the id, name and url props, with default values used
    // if the props are not defined.
    static getDerivedStateFromProps(props) {
        return {
            id: props.id,
            name: props.initialState.name || 'Rest Status',
            url: props.initialState.url || '',
            interval: props.initialState.interval || 5000
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

    // Opens the pop up and sets values to popoverOpen and tempUrl etc.
    openPopup() {
        const {url, interval} = this.state;
        this.setState({
            popoverOpen: true,
            tempUrl: url,
            tempInterval: interval
        });
    }

    // Closes the pop up and sets values to popoverOpen and tempUrl etc.
    closePopup() {
        this.setState({
            popoverOpen: false,
            tempUrl: '',
            tempInterval: 5000
        });
    }

    // Update the url state variable based on the value of the tempUrl state variable and set the popoverOpen state variable to false etc.
    closeConfirmPopup() {
        const {tempUrl, tempInterval} = this.state;
        this.sendUpdate('url', tempUrl);
        this.sendUpdate('interval', tempInterval);
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

    // Change the state by setting the value of tempUrl to the value
    changeUrl(event) {
        event.stopPropagation();
        this.setState({tempUrl: event.target.value});
    }

    // Updates the value of the tempHeaders  in the component's state with the value of an event target
    changeInterval(value) {
        this.setState({tempInterval: value});
    }

    // Updates the value of the activeText and fontSize properties in the component's state based on the width and height of the component
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
            smallIcon: (height < 40 || width < 40),
            fontSize
        });
    }

    // Closes the popup and calls the cloneComponent function, passing in the value of the id  in the component's state as an argument
    clone() {
        const {id} = this.state;
        this.closePopup();
        this.cloneComponent(id);
    }

    // Render the rest. First by getting some values from this.state, which is an object that contains several pieces of state for the component.
    // These values are then used in the JSX element that is returned, which is a div element with several nested elements inside it. Some of 
    // these elements are custom or external components and style it. The timeSpan, minint, meanint and maxint states are used to render a Tooltip 
    // component, which is a custom or external component that displays additional information when hovered over. 
    render() {
        const {id, name, popoverOpen, deletePopupOpen, tempUrl, tempInterval, activeText, smallIcon, fontSize} = this.state;

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
                            id={`restDiv_${id}`}
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
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        maxWidth: '200px',
                                        maxHeight: '50px',
                                        color: formatStatusColor(200),
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
                                    {activeText && '200'}
                                </div>
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

// Takes the arguments id, type, initialState etc and pass them to Rest. The values are determined by the values 
// of the properties in the object passed to createRest.
const createRest = ({id, type, initialState, updateItem, deleteItem, cloneComponent}) => (
    <Rest
        id={id}
        type={type}
        initialState={initialState}
        updateItem={updateItem}
        deleteItem={deleteItem}
        cloneComponent={cloneComponent}
    />
);

/*
*
* Default export
*
*/
// The export constant is: 
// createRest
export default createRest;
