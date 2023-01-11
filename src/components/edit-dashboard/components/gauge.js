/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */

/*
* Importing the necessary modules
*/
import React from 'react';
import styled from 'styled-components';
import {
    Alert, EditableText, InputGroup, Menu, MenuItem, NumericInput, Popover, Switch, Tooltip
} from '@blueprintjs/core';
import {
    faCog, faTrashAlt, faClone
} from '@fortawesome/free-solid-svg-icons';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
/* eslint-disable import/no-unresolved */
import GaugeChart from 'react-gauge-chart';
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

class Gauge extends React.Component {
    // The constructor, initializes takes props as an argument and passes it to the parent class's constructor function through the super function.
    // Then, it is binding the component's instance to several functions, such as changeSpinner, messageReceived, connectStompSource, connectMqttSource, connectToTopic and resize.
    // This is done so that these functions can be called with the correct this value when they are used within the component. Then it is setting several instances,
    // such as interval, rxStomp and mqttClient. These properties are not part of the component's state, but are used to store data that needs to be shared
    // between different methods of the component.
    constructor(props) {
        super(props);

        this.type = props.type;
        this.updateItem = props.updateItem;
        this.deleteItem = props.deleteItem;
        this.cloneComponent = props.cloneComponent;

        this.state = {
            id: props.id,
            availableSources: props.availableSources,
            name: props.initialState.name || 'Gauge',
            source: props.initialState.source || 'Select source',
            topic: props.initialState.topic || '',
            variable: props.initialState.variable || '',
            minValue: props.initialState.minValue || 0,
            maxValue: props.initialState.maxValue || 100,
            leftColor: props.initialState.leftColor || '#7ABF43',
            rightColor: props.initialState.rightColor || '#DE162F',
            levels: props.initialState.levels || 20,
            hideText: props.initialState.hideText || false,
            unit: props.initialState.unit || '%',
            popoverOpen: false,
            deletePopupOpen: false,
            tempSource: 'Select source',
            tempTopic: '',
            tempVariable: '',
            tempMinValue: 0,
            tempMaxValue: 100,
            tempLeftColor: '#7ABF43',
            tempRightColor: '#DE162F',
            tempLevels: 20,
            tempHideText: false,
            tempUnit: '%',
            width: 50
        };
        this.value = 0.65;

        this.sendUpdate = this.sendUpdate.bind(this);
        this.delete = this.delete.bind(this);
        this.changeName = this.changeName.bind(this);
        this.openPopup = this.openPopup.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.closeConfirmPopup = this.closeConfirmPopup.bind(this);
        this.openDelete = this.openDelete.bind(this);
        this.closeDelete = this.closeDelete.bind(this);
        this.resize = this.resize.bind(this);
        this.changeSource = this.changeSource.bind(this);
        this.changeTopic = this.changeTopic.bind(this);
        this.changeVariable = this.changeVariable.bind(this);
        this.changeMinValue = this.changeMinValue.bind(this);
        this.changeMaxValue = this.changeMaxValue.bind(this);
        this.changeLeftColor = this.changeLeftColor.bind(this);
        this.changeRightColor = this.changeRightColor.bind(this);
        this.changeLevels = this.changeLevels.bind(this);
        this.changeHideText = this.changeHideText.bind(this);
        this.changeUnit = this.changeUnit.bind(this);
        this.clone = this.clone.bind(this);
    }

    // Receives the props and returns an object with the state updates. This method is called every time the component receives new props.
    // Also it is setting the component's state based on the props it receives.
    static getDerivedStateFromProps(props) {
        return {
            id: props.id,
            availableSources: props.availableSources,
            name: props.initialState.name || 'Gauge',
            source: props.initialState.source || 'Select source',
            topic: props.initialState.topic || '',
            variable: props.initialState.variable || '',
            minValue: props.initialState.minValue || 0,
            maxValue: props.initialState.maxValue || 100,
            leftColor: props.initialState.leftColor || '#7ABF43',
            rightColor: props.initialState.rightColor || '#DE162F',
            levels: props.initialState.levels || 20,
            hideText: props.initialState.hideText || false,
            unit: props.initialState.unit || '%'
        };
    }

    // Updates the item with a given key and value. It appears to be using the updateItem method to do so, 
    // which is not shown in the code you provided.
    sendUpdate(key, value) {
        const {id} = this.state;
        this.updateItem(id, key, value);
    }

    // Sets the deletePopupOpen state to false and calls the deleteItem method with the component's id.
    delete() {
        const {id} = this.state;
        this.setState({deletePopupOpen: false});
        this.deleteItem(id);
    }

    // Updates the item's name by calling sendUpdate with the key 'name' and the value passed to the changeName method.
    changeName(value) {
        this.sendUpdate('name', value);
    }

    // Sets the component's state with the values of several state variables and sets popoverOpen to true.
    openPopup() {
        const {source, topic, variable, minValue, maxValue, leftColor, rightColor, levels, hideText, unit} = this.state;
        this.setState({
            popoverOpen: true,
            tempSource: source,
            tempTopic: topic,
            tempVariable: variable,
            tempMinValue: minValue,
            tempMaxValue: maxValue,
            tempLeftColor: leftColor,
            tempRightColor: rightColor,
            tempLevels: levels,
            tempHideText: hideText,
            tempUnit: unit
        });
    }

    // Closes the pop up by setting some parameters to state
    closePopup() {
        this.setState({
            popoverOpen: false,
            tempSource: 'Select source',
            tempTopic: '',
            tempVariable: '',
            tempMinValue: 0,
            tempMaxValue: 100,
            tempLeftColor: '#7ABF43',
            tempRightColor: '#DE162F',
            tempLevels: 20,
            tempHideText: false,
            tempUnit: '%'
        });
    }

    // Update a number of state variables based on their corresponding temporary variables. 
    // It then sets the popoverOpen state variable to false.
    closeConfirmPopup() {
        const {tempSource, tempTopic, tempVariable, tempMinValue, tempMaxValue, tempLeftColor, tempRightColor, tempLevels, tempHideText, tempUnit} = this.state;
        this.sendUpdate('source', tempSource);
        this.sendUpdate('topic', tempTopic);
        this.sendUpdate('variable', tempVariable);
        this.sendUpdate('minValue', tempMinValue);
        this.sendUpdate('maxValue', tempMaxValue);
        this.sendUpdate('leftColor', tempLeftColor);
        this.sendUpdate('rightColor', tempRightColor);
        this.sendUpdate('levels', tempLevels);
        this.sendUpdate('hideText', tempHideText);
        this.sendUpdate('unit', tempUnit);
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

    // Takes in width and height arguments and appears to update the width state variable based on the ratio of width to height.
    resize(width, height) {
        let newWidth;
        if (width > 2.2225 * height) {
            newWidth = ((2.2225 * height) / width) * 100;
        } else {
            newWidth = 100;
        }
        this.setState({width: newWidth});
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

    // Set state variables based on numeric values
    changeMinValue(value) {
        this.setState({tempMinValue: value});
    }

    // Set state variables based on numeric values
    changeMaxValue(value) {
        this.setState({tempMaxValue: value});
    }

    // Changing the left color based on numeric values
    changeLeftColor(event) {
        event.stopPropagation();
        this.setState({tempLeftColor: event.target.value});
    }

    // Changing the right color based on numeric values
    changeRightColor(event) {
        event.stopPropagation();
        this.setState({tempRightColor: event.target.value});
    }

    
    // Set the tempLevels state variable to the value passed in as an argument.
    changeLevels(value) {
        this.setState({tempLevels: value});
    }

    // Toggles the value of the tempHideText state variable.
    changeHideText() {
        const {tempHideText} = this.state;
        this.setState({tempHideText: !tempHideText});
    }

    // Sets the tempUnit state variable based on the value of the event.target.value .
    changeUnit(event) {
        event.stopPropagation();
        this.setState({tempUnit: event.target.value});
    }

    // Close a "popup" and call the cloneComponent function with the value of the id state variable as an argument.
    clone() {
        const {id} = this.state;
        this.closePopup();
        this.cloneComponent(id);
    }

    // First it is getting some values from this.state, which is an object that contains several pieces of state for the component. These values are then used in the 
    // JSX element that is returned, which is a div element with several nested elements inside it. Some of these elements, like EditableText and ProgressBar,
    // are custom or external components and style it. The timeSpan, minint, meanint and maxint states are used to render a Tooltip component, which is
    // a custom or external component that displays additional information when hovered over. The timeSpanVal, minintVal, meanintVal and maxintVal states 
    // are used to control the values of ProgressBar components, which are also custom or external components
    render() {
        const {id, availableSources, name, leftColor, rightColor, levels, hideText, unit, popoverOpen, deletePopupOpen, width, tempSource, tempTopic, tempVariable, tempMinValue, tempMaxValue, tempLeftColor, tempRightColor, tempLevels, tempHideText, tempUnit} = this.state;

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
                            id={`gaugeDiv_${id}`}
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
                            <GaugeChart
                                id={`gauge_${id}`}
                                nrOfLevels={levels}
                                percent={this.value}
                                textColor="#16335B"
                                colors={[leftColor, rightColor]}
                                style={{width: `${width}%`}}
                                hideText={hideText}
                                formatTextValue={(value) => `${value}${unit}`}
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
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <div
                            style={{
                                width: '50%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            Value range:
                        </div>
                        <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <div style={{width: 'calc(50% - 5px)', height: '100%', display: 'flex', alignItems: 'center'}}>
                                <NumericInput
                                    className="numeric-input"
                                    clampValueOnBlur
                                    minorStepSize={0.1}
                                    onValueChange={this.changeMinValue}
                                    placeholder="Min"
                                    stepSize={1.0}
                                    defaultValue={+tempMinValue.toFixed(2)}
                                    fill
                                />
                            </div>
                            <div
                                style={{
                                    width: '10px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                -
                            </div>
                            <div style={{width: 'calc(50% - 5px)', height: '100%', display: 'flex', alignItems: 'center'}}>
                                <NumericInput
                                    className="numeric-input"
                                    clampValueOnBlur
                                    minorStepSize={0.1}
                                    onValueChange={this.changeMaxValue}
                                    placeholder="Max"
                                    stepSize={1.0}
                                    defaultValue={+tempMaxValue.toFixed(2)}
                                    fill
                                />
                            </div>
                        </div>
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
                            Left color:
                        </div>
                        <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <InputGroup
                                leftIcon="tint"
                                placeholder="Left color"
                                onChange={this.changeLeftColor}
                                value={tempLeftColor}
                                fill
                                large
                            />
                        </div>
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
                            Right color:
                        </div>
                        <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <InputGroup
                                leftIcon="tint"
                                placeholder="Right color"
                                onChange={this.changeRightColor}
                                value={tempRightColor}
                                fill
                                large
                            />
                        </div>
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
                            Levels:
                        </div>
                        <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <NumericInput
                                className="numeric-input"
                                clampValueOnBlur
                                min={2}
                                max={35}
                                minorStepSize={1}
                                onValueChange={this.changeLevels}
                                placeholder="Levels"
                                stepSize={1}
                                defaultValue={+tempLevels.toFixed(0)}
                                fill
                            />
                        </div>
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
                            Hide value:
                        </div>
                        <div
                            style={{
                                width: '50%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Switch
                                className="custom-switch"
                                large
                                checked={tempHideText}
                                onChange={this.changeHideText}
                            />
                        </div>
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
                            Unit:
                        </div>
                        <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <InputGroup
                                leftIcon="numerical"
                                placeholder="Unit"
                                onChange={this.changeUnit}
                                value={tempUnit}
                                fill
                                large
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

// Takes the arguments id, type, initialState, user and owner and pass them to Gauge. The values are determined by the values 
// of the properties in the object passed to createGauge.
const createGauge = ({id, type, initialState, updateItem, deleteItem, cloneComponent, sources}) => (
    <Gauge
        id={id}
        type={type}
        initialState={initialState}
        updateItem={updateItem}
        deleteItem={deleteItem}
        cloneComponent={cloneComponent}
        availableSources={sources}
    />
);

// Default export createGauge
export default createGauge;
