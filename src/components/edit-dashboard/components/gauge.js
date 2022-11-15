/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */
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

class Gauge extends React.Component {
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

    openDelete() {
        this.setState({deletePopupOpen: true});
    }

    closeDelete() {
        this.setState({deletePopupOpen: false});
    }

    resize(width, height) {
        let newWidth;
        if (width > 2.2225 * height) {
            newWidth = ((2.2225 * height) / width) * 100;
        } else {
            newWidth = 100;
        }
        this.setState({width: newWidth});
    }

    changeSource(value) {
        this.setState({tempSource: value});
    }

    changeTopic(event) {
        event.stopPropagation();
        this.setState({tempTopic: event.target.value});
    }

    changeVariable(event) {
        event.stopPropagation();
        this.setState({tempVariable: event.target.value});
    }

    changeMinValue(value) {
        this.setState({tempMinValue: value});
    }

    changeMaxValue(value) {
        this.setState({tempMaxValue: value});
    }

    changeLeftColor(event) {
        event.stopPropagation();
        this.setState({tempLeftColor: event.target.value});
    }

    changeRightColor(event) {
        event.stopPropagation();
        this.setState({tempRightColor: event.target.value});
    }

    changeLevels(value) {
        this.setState({tempLevels: value});
    }

    changeHideText() {
        const {tempHideText} = this.state;
        this.setState({tempHideText: !tempHideText});
    }

    changeUnit(event) {
        event.stopPropagation();
        this.setState({tempUnit: event.target.value});
    }

    clone() {
        const {id} = this.state;
        this.closePopup();
        this.cloneComponent(id);
    }

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

export default createGauge;
