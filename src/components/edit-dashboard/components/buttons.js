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
    Alert, ButtonGroup, EditableText, InputGroup, Menu, MenuItem, Popover, Switch, TextArea, Tooltip
} from '@blueprintjs/core';
import {
    faCog, faTrashAlt, faClone
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {PortalOverflowOverlay} from '../../../lib/overlays';
import {ToasterBottom} from '../../../lib/toaster';
import {
    BlueBorderButton, BlueButton, OrangeButton, CustomButton
} from '../../../lib/buttons';

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
* Style FormSubHeader
*/
const FormSubHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    font-size: 18px;
    color: #16335B;
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

/*
* Style textAlignments
*/
const textAlignments = {
    left: 'Left',
    center: 'Center',
    right: 'Right'
};

/*
* Style buttonAlignments
*/
const buttonAlignments = {
    vertical: 'Vertical',
    horizontal: 'Horizontal'
};

// Takes a string as an argument and returns a boolean. 
// Parses the input string as JSON and returns true if
// the parsing is successful. If an error is thrown while
// parsing, the function returns false.
const isValidJson = (input) => {
    try {
        JSON.parse(input);
    } catch {
        return false;
    }
    return true;
};

class Buttons extends React.Component {
    // The constructor of the class. It initializes the variables and the fucntions. 
    // Sets some state variables with props which are passed in. 
    // Sets initial values for each of the component's state variables. 
    // Has a sendUpdate function which sends an update to the component. 
    // Has a delete function which deletes the component. 
    // Has a changeName function which changes the component's name. 
    // Has an openPopup and closePopup functions which open and close popups. 
    // Has a confirmPopup and closeConfirmPopup functions which confirm and close the popup. 
    // Has an openDelete and closeDelete functions which open and close the delete popup. 
    // Has an openButtonPopover function which opens the button popover. 
    // Has a changeAlignText function which changes the alignment text. 
    // Has a changeButtonsAlign function which changes the button's alignment. 
    // Has a changeTexts, changeSources, changeTopics, changePayloads, 
    // changeIsDynamic, changeColors, changeBackgrounds and changeBackgroundsHover 
    // functions which change the corresponding state variables. 
    constructor(props) {
        super(props);

        this.type = props.type;
        this.updateItem = props.updateItem;
        this.deleteItem = props.deleteItem;
        this.cloneComponent = props.cloneComponent;

        let initialTexts; 
        let initialSources = [];
        let initialTopics = [];
        let initialPayloads = [];
        let initialIsDynamic = [];
        let initialColors = [];
        let initialBackgrounds = [];
        let initialBackgroundsHover = [];
        if ('texts' in props.initialState) {
            initialTexts = props.initialState.texts;
            for (let i = 0; i < initialTexts.length; i += 1) {
                initialSources.push('Select source');
                initialTopics.push('');
                initialPayloads.push('{}');
                initialIsDynamic.push(false);
                initialColors.push('white');
                initialBackgrounds.push('#FF9D66');
                initialBackgroundsHover.push('#ff7e33');
            }
        } else {
            initialTexts = ['Button 1']; 
            initialSources = ['Select source'];
            initialTopics = [''];
            initialPayloads = ['{}'];
            initialIsDynamic = [false];
            initialColors = ['white'];
            initialBackgrounds = ['#FF9D66'];
            initialBackgroundsHover = ['#ff7e33'];
        }

        this.state = {
            id: props.id,
            availableSources: props.availableSources,
            name: props.initialState.name || 'Buttons',
            alignText: props.initialState.alignText || 'center',
            buttonsAlign: props.initialState.buttonsAlign || 'horizontal',
            texts: props.initialState.texts || initialTexts,
            sources: props.initialState.sources || initialSources,
            topics: props.initialState.topics || initialTopics,
            payloads: props.initialState.payloads || initialPayloads,
            isDynamic: props.initialState.isDynamic || initialIsDynamic,
            colors: props.initialState.colors || initialColors,
            backgrounds: props.initialState.backgrounds || initialBackgrounds,
            backgroundsHover: props.initialState.backgroundsHover || initialBackgroundsHover,
            popoverOpen: false,
            buttonPopoverOpen: false,
            buttonSelected: null,
            deletePopupOpen: false,
            tempAlignText: 'center',
            tempButtonsAlign: false,
            tempTexts: ['Button 1'],
            tempSources: ['Select source'],
            tempTopics: [''],
            tempPayloads: ['{}'],
            tempIsDynamic: [false],
            tempColors: ['white'],
            tempBackgrounds: ['#FF9D66'],
            tempBackgroundsHover: ['#ff7e33']
        };

        this.sendUpdate = this.sendUpdate.bind(this);
        this.delete = this.delete.bind(this);
        this.changeName = this.changeName.bind(this);
        this.openPopup = this.openPopup.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.closeConfirmPopup = this.closeConfirmPopup.bind(this);
        this.confirmPopup = this.confirmPopup.bind(this);
        this.openDelete = this.openDelete.bind(this);
        this.closeDelete = this.closeDelete.bind(this);
        this.openButtonPopover = this.openButtonPopover.bind(this);
        this.changeAlignText = this.changeAlignText.bind(this);
        this.changeButtonsAlign = this.changeButtonsAlign.bind(this);
        this.changeTexts = this.changeTexts.bind(this);
        this.changeSources = this.changeSources.bind(this);
        this.changeTopics = this.changeTopics.bind(this);
        this.changePayloads = this.changePayloads.bind(this);
        this.changeIsDynamic = this.changeIsDynamic.bind(this);
        this.changeColors = this.changeColors.bind(this);
        this.changeBackgrounds = this.changeBackgrounds.bind(this);
        this.changeBackgroundsHover = this.changeBackgroundsHover.bind(this);
        this.addButton = this.addButton.bind(this);
        this.removeButton = this.removeButton.bind(this);
        this.back = this.back.bind(this);
        this.clone = this.clone.bind(this);
    }

    // Receives the component's props as an argument and returns an object containing the
    // state that should be updated, the returned object includes the values of various
    // in the initialState prop as well as some default values.
    static getDerivedStateFromProps(props) {
        return {
            id: props.id,
            availableSources: props.availableSources,
            name: props.initialState.name || 'Buttons',
            alignText: props.initialState.alignText || 'center',
            buttonsAlign: props.initialState.buttonsAlign || 'horizontal',
            texts: props.initialState.texts || ['Button 1'],
            sources: props.initialState.sources || ['Select source'],
            topics: props.initialState.topics || [''],
            payloads: props.initialState.payloads || ['{}'],
            isDynamic: props.initialState.isDynamic || [false],
            colors: props.initialState.colors || ['white'],
            backgrounds: props.initialState.backgrounds || ['#FF9D66'],
            backgroundsHover: props.initialState.backgroundsHover || ['#ff7e33']
        };
    }

    // Updates the value of a specific of the component. It takes in the state
    // to update and the new value and sends a request to update the component with the new
    // values. The component's id is also included in the update request.
    sendUpdate(key, value) {
        const {id} = this.state;
        this.updateItem(id, key, value);
    }

    // Removes the component from the dashboard. It closes the delete confirmation popup and
    // calls the deleteItem function with the component's id.
    delete() {
        const {id} = this.state;
        this.setState({deletePopupOpen: false});
        this.deleteItem(id);
    }

    // Updates the component's name and sends the update to the server
    changeName(value) {
        this.sendUpdate('name', value);
    }

    // Opens a popover and stores the component's current state in a set of temporary variables
    openPopup() {
        const {alignText, buttonsAlign, texts, sources, topics, payloads, isDynamic, colors, backgrounds, backgroundsHover} = this.state;

        this.setState({
            popoverOpen: true,
            tempAlignText: alignText,
            tempButtonsAlign: buttonsAlign,
            tempTexts: [...texts],
            tempSources: [...sources],
            tempTopics: [...topics],
            tempPayloads: [...payloads],
            tempIsDynamic: [...isDynamic],
            tempColors: [...colors],
            tempBackgrounds: [...backgrounds],
            tempBackgroundsHover: [...backgroundsHover]
        });
    }

    // Closes the popover and resets the temporary variables to their default values
    closePopup() {
        this.setState({
            popoverOpen: false,
            buttonPopoverOpen: false,
            buttonSelected: null,
            tempAlignText: 'center',
            tempButtonsAlign: false,
            tempTexts: ['Button 1'],
            tempSources: ['Select source'],
            tempTopics: [''],
            tempPayloads: ['{}'],
            tempIsDynamic: [false],
            tempColors: ['white'],
            tempBackgrounds: ['#FF9D66'],
            tempBackgroundsHover: ['#ff7e33']
        });
    }

    // Takes the current state variables and updates the component's with them. It also checks
    // if the payloads of the buttons are valid JSON strings and shows an error if any of them are not. 
    // Then it sets the state of the component to hide the configuration popover and resets the temporary state 
    // variables to their default values
    closeConfirmPopup() {
        const {tempAlignText, tempButtonsAlign, tempTexts, tempSources, tempTopics, tempPayloads, tempIsDynamic, tempColors, tempBackgrounds, tempBackgroundsHover} = this.state;

        let allValid = true;
        tempPayloads.forEach((p, ind) => {
            if (!isValidJson(p)) {
                ToasterBottom.show({
                    intent: 'danger',
                    message: `Button ${tempTexts[ind]} does not include a valid JSON payload`
                });
                allValid = false;
            }
        });

        if (allValid) {
            this.sendUpdate('alignText', tempAlignText);
            this.sendUpdate('buttonsAlign', tempButtonsAlign);
            this.sendUpdate('texts', tempTexts);
            this.sendUpdate('sources', tempSources);
            this.sendUpdate('topics', tempTopics);
            this.sendUpdate('payloads', tempPayloads);
            this.sendUpdate('isDynamic', tempIsDynamic);
            this.sendUpdate('colors', tempColors);
            this.sendUpdate('backgrounds', tempBackgrounds);
            this.sendUpdate('backgroundsHover', tempBackgroundsHover);
            this.setState({popoverOpen: false, buttonPopoverOpen: false, buttonSelected: null});
        }
    }

    // Takes the current temporary state variables and updates the component's with them. Sets the state of the component to hide the configuration popover and 
    // resets the temporary state variables to their default values
    confirmPopup() {
        const {tempAlignText, tempButtonsAlign, tempTexts, tempSources, tempTopics, tempPayloads, tempIsDynamic, tempColors, tempBackgrounds, tempBackgroundsHover} = this.state;
        this.sendUpdate('alignText', tempAlignText);
        this.sendUpdate('buttonsAlign', tempButtonsAlign);
        this.sendUpdate('texts', tempTexts);
        this.sendUpdate('sources', tempSources);
        this.sendUpdate('topics', tempTopics);
        this.sendUpdate('payloads', tempPayloads);
        this.sendUpdate('isDynamic', tempIsDynamic);
        this.sendUpdate('colors', tempColors);
        this.sendUpdate('backgrounds', tempBackgrounds);
        this.sendUpdate('backgroundsHover', tempBackgroundsHover);
        this.setState({popoverOpen: false, buttonPopoverOpen: false, buttonSelected: null});
    }

    // Opens the delete pop up
    openDelete() {
        this.setState({deletePopupOpen: true});
    }

    // Cpens the delete pop up
    closeDelete() {
        this.setState({deletePopupOpen: false});
    }

    // Opens the popover button
    openButtonPopover(ind) {
        this.setState({popoverOpen: false, buttonPopoverOpen: true, buttonSelected: ind});
    }

    // Changes the alignment of the text of the button
    changeAlignText(value) {
        this.setState({tempAlignText: value});
    }

    // Changes the alignment of the buttons relative to each other
    changeButtonsAlign(value) {
        this.setState({tempButtonsAlign: value});
    }

    // Changes the text of a button
    changeTexts(event, ind) {
        event.stopPropagation();
        const {tempTexts} = this.state;
        tempTexts[ind] = event.target.value;
        this.setState({tempTexts});
    }

    // Changes the source of a button
    changeSources(value, ind) {
        const {tempSources} = this.state;
        tempSources[ind] = value;
        this.setState({tempSources});
    }

    // Changes the topic of a button
    changeTopics(event, ind) {
        event.stopPropagation();
        const {tempTopics} = this.state;
        tempTopics[ind] = event.target.value;
        this.setState({tempTopics});
    }

    // Changes the payload of a button
    changePayloads(event, ind) {
        event.stopPropagation();
        const {tempPayloads} = this.state;
        tempPayloads[ind] = event.target.value;
        this.setState({tempPayloads});
    }

    // Changes the dynamic status of a button
    changeIsDynamic(ind) {
        const {tempIsDynamic} = this.state;
        tempIsDynamic[ind] = !(tempIsDynamic[ind]);
        this.setState({tempIsDynamic});
    }

    // Updates the tempColors state with the value of the event target passed 
    // to it as an argument at the index passed as an argument.
    changeColors(event, ind) {
        event.stopPropagation();
        const {tempColors} = this.state;
        tempColors[ind] = event.target.value;
        this.setState({tempColors});
    }

    // Updates the tempBackgrounds state with the value of the event target passed 
    // to it as an argument at the index passed as an argument.
    changeBackgrounds(event, ind) {
        event.stopPropagation();
        const {tempBackgrounds} = this.state;
        tempBackgrounds[ind] = event.target.value;
        this.setState({tempBackgrounds});
    }

    // Updates the tempBackgroundsHover state with the value of the event target passed 
    // to it as an argument at the index passed as an argument.
    changeBackgroundsHover(event, ind) {
        event.stopPropagation();
        const {tempBackgroundsHover} = this.state;
        tempBackgroundsHover[ind] = event.target.value;
        this.setState({tempBackgroundsHover});
    }

    // Appends new values to the tempTexts, tempSources, tempTopics, tempPayloads, tempIsDynamic, tempColors, tempBackgrounds and
    // tempBackgroundsHover states and then calls the confirmPopup function.
    addButton() {
        const {tempTexts, tempSources, tempTopics, tempPayloads, tempIsDynamic, tempColors, tempBackgrounds, tempBackgroundsHover} = this.state;
        tempTexts.push(`Button ${tempTexts.length + 1}`);
        tempSources.push('Select source');
        tempTopics.push('');
        tempPayloads.push('{}');
        tempIsDynamic.push(false);
        tempColors.push('white');
        tempBackgrounds.push('#FF9D66');
        tempBackgroundsHover.push('#ff7e33');
        this.setState({
            tempTexts,
            tempSources,
            tempTopics,
            tempPayloads,
            tempIsDynamic,
            tempColors,
            tempBackgrounds,
            tempBackgroundsHover
        }, this.confirmPopup);
    }

    // Removes a button from the list of buttons in the component. It does this by splicing 
    // the arrays containing the button  
    removeButton(ind) {
        const {tempTexts, tempSources, tempTopics, tempPayloads, tempIsDynamic, tempColors, tempBackgrounds, tempBackgroundsHover} = this.state;
        tempTexts.splice(ind, 1);
        tempSources.splice(ind, 1);
        tempTopics.splice(ind, 1);
        tempPayloads.splice(ind, 1);
        tempIsDynamic.splice(ind, 1);
        tempColors.splice(ind, 1);
        tempBackgrounds.splice(ind, 1);
        tempBackgroundsHover.splice(ind, 1);
        this.setState({
            tempTexts,
            tempSources,
            tempTopics,
            tempPayloads,
            tempIsDynamic,
            tempColors,
            tempBackgrounds,
            tempBackgroundsHover
        }, this.confirmPopup);
    }

    // Sets the state such that the main configuration popover is open and the button configuration popover is closed and sets the buttonSelected to null.
    back() {
        this.setState({popoverOpen: true, buttonPopoverOpen: false, buttonSelected: null});
    }

    // Closes the main configuration popover and calls the cloneComponent function with the current component's id.
    clone() {
        const {id} = this.state;
        this.closePopup();
        this.cloneComponent(id);
    }

    // It starts by getting several variables from state. It then returns 
    // an array containing a single JSX element, which is a styled div element with several nested children.
    // These children include another div with a nested EditableText component and a Tag component, a styled div with an id and a class name that changes based on the value of
    // buttonsAlign in state and several CustomButton components that are mapped 
    // over the texts array in state. Each CustomButton also has several style applied
    // to it that are derived from the corresponding elements in the colors, backgrounds and backgroundsHover arrays in state. When one of these buttons is clicked, the openButtonPopup
    // function is called with the index of the clicked button as an argument.
    // Then append two JSX elements to the array returned by the render function. 
    // The first element is a PortalOverflowOverlay component that is rendered when the value of buttonPopupOpen 
    // in state is true. This component has several props applied to it that define 
    // its appearance and behavior, such as isOpen, width, height, background, borderRadius, padding, marginLeft
    // and color. It also has several nested children, including a FormHeader, a 
    // FormSubHeader and a SettingsDiv element that contains a TextArea component and two buttons
    // (a BlueBorderButton and a BlueButton). The TextArea has an onChange prop 
    // that is bound to the editPayload function and both buttons have onClick props that are bound
    // to the closeButtonPopup and changeButtonPayload functions, respectively.
    render() {
        const {id, availableSources, name, alignText, buttonsAlign, texts, colors, backgrounds, backgroundsHover, popoverOpen, buttonPopoverOpen, buttonSelected, deletePopupOpen, tempAlignText, tempButtonsAlign, tempTexts, tempSources, tempTopics, tempPayloads, tempIsDynamic, tempColors, tempBackgrounds, tempBackgroundsHover} = this.state;

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
                    id={`buttonsDiv_${id}`}
                    className={(buttonsAlign === 'vertical') ? 'vertical-buttons' : 'horizontal-buttons'}
                    style={{
                        width: '100%',
                        height: 'calc(100% - 35px)',
                        maxHeight: '100%',
                        marginTop: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '5px'
                    }}
                >
                    <ButtonGroup alignText={alignText} vertical={(buttonsAlign === 'vertical')} fill>
                        {texts.map((t, ind) => (
                            <CustomButton
                                width={((buttonsAlign === 'vertical')) ? '100%' : 'auto'}
                                height={((buttonsAlign === 'vertical')) ? 'auto' : '100%'}
                                minWidth={((buttonsAlign === 'vertical')) ? 'auto' : '0px'}
                                minHeight={((buttonsAlign === 'vertical')) ? '0px' : 'auto'}
                                color={`${colors[ind]}!important`}
                                background={`${backgrounds[ind]}!important`}
                                backgroundHover={`${backgroundsHover[ind]}!important`}
                            >
                                {t}
                            </CustomButton>
                        ))}
                    </ButtonGroup>
                </div>
            </div>,
            <PortalOverflowOverlay key="settings" id="settings" isOpen={popoverOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    {`${name} Settings`}
                </FormHeader>
                <SettingsDiv>
                    <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
                        <div
                            style={{
                                width: '50%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            Text Align:
                        </div>
                        <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <Popover popoverClassName="custom-popover">
                                <BlueBorderButton type="button" width="205px" rightIcon="caret-down">
                                    {textAlignments[tempAlignText]}
                                </BlueBorderButton>
                                <Menu>
                                    {Object.keys(textAlignments).map((tA) => (
                                        <MenuItem text={textAlignments[tA]} onClick={() => this.changeAlignText(tA)} />
                                    ))}
                                </Menu>
                            </Popover>
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', display: 'flex', alignItems: 'center', marginTop: '10px'
                        }}
                    >
                        <div
                            style={{
                                width: '50%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            Buttons Align:
                        </div>
                        <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <Popover popoverClassName="custom-popover">
                                <BlueBorderButton type="button" width="205px" rightIcon="caret-down">
                                    {buttonAlignments[tempButtonsAlign]}
                                </BlueBorderButton>
                                <Menu>
                                    {Object.keys(buttonAlignments).map((bA) => (
                                        <MenuItem text={buttonAlignments[bA]} onClick={() => this.changeButtonsAlign(bA)} />
                                    ))}
                                </Menu>
                            </Popover>
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', display: 'flex', alignItems: 'center', marginTop: '10px', justifyContent: 'center'
                        }}
                    >
                        <Popover popoverClassName="custom-popover">
                            <BlueBorderButton type="button" width="100%" rightIcon="caret-down">
                                Change Button Settings
                            </BlueBorderButton>
                            <Menu>
                                {texts.map((t, ind) => (
                                    <MenuItem text={t} onClick={() => this.openButtonPopover(ind)} />
                                ))}
                            </Menu>
                        </Popover>
                    </div>
                    <div
                        style={{
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <OrangeButton
                            id="add"
                            type="button"
                            onClick={this.addButton}
                        >
                            Add Button
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
            <PortalOverflowOverlay key="button-settings" id="button-settings" isOpen={buttonPopoverOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    {`${name} Settings`}
                </FormHeader>
                <FormSubHeader>
                    {texts[buttonSelected]}
                </FormSubHeader>
                <SettingsDiv>
                    <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
                        <div
                            style={{
                                width: '50%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            Button Text:
                        </div>
                        <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <InputGroup
                                leftIcon="label"
                                placeholder="Button Text"
                                onChange={(event) => this.changeTexts(event, buttonSelected)}
                                value={tempTexts[buttonSelected]}
                                fill
                                large
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', display: 'flex', alignItems: 'center', marginTop: '10px'
                        }}
                    >
                        <div
                            style={{
                                width: '50%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            Button Color:
                        </div>
                        <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <InputGroup
                                leftIcon="label"
                                placeholder="Button Color"
                                onChange={(event) => this.changeColors(event, buttonSelected)}
                                value={tempColors[buttonSelected]}
                                fill
                                large
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', display: 'flex', alignItems: 'center', marginTop: '10px'
                        }}
                    >
                        <div
                            style={{
                                width: '50%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            Button Background Color:
                        </div>
                        <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <InputGroup
                                leftIcon="label"
                                placeholder="Button Background Color"
                                onChange={(event) => this.changeBackgrounds(event, buttonSelected)}
                                value={tempBackgrounds[buttonSelected]}
                                fill
                                large
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', display: 'flex', alignItems: 'center', marginTop: '10px'
                        }}
                    >
                        <div
                            style={{
                                width: '50%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            Button Background Hover Color:
                        </div>
                        <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <InputGroup
                                leftIcon="label"
                                placeholder="Button Color"
                                onChange={(event) => this.changeBackgroundsHover(event, buttonSelected)}
                                value={tempBackgroundsHover[buttonSelected]}
                                fill
                                large
                            />
                        </div>
                    </div>
                    <Popover popoverClassName="custom-popover">
                        <BlueBorderButton type="button" width="410px" rightIcon="caret-down" marginTop="10px">
                            {tempSources[buttonSelected]}
                        </BlueBorderButton>
                        <Menu>
                            {availableSources.map((s) => (
                                <MenuItem text={s} onClick={() => this.changeSources(s, buttonSelected)} />
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
                            onChange={(event) => this.changeTopics(event, buttonSelected)}
                            value={tempTopics[buttonSelected]}
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
                                width: '60%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            Payload changes dynamically:
                        </div>
                        <div
                            style={{
                                width: '40%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Switch
                                className="custom-switch"
                                large
                                checked={tempIsDynamic[buttonSelected]}
                                onChange={() => this.changeIsDynamic(buttonSelected)}
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <TextArea
                            id="payload"
                            style={{
                                background: 'white', height: '70px', resize: 'none', fontSize: '13px', fontFamily: 'Roboto, sans-serif', borderRadius: '5px'
                            }}
                            fill
                            growVertically={false}
                            onChange={(event) => this.changePayloads(event, buttonSelected)}
                            placeholder={(tempIsDynamic[buttonSelected]) ? 'Default Payload' : 'Payload'}
                            defaultValue={tempPayloads[buttonSelected]}
                        />
                    </div>
                    <div
                        style={{
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <OrangeButton
                            id="add"
                            type="button"
                            width="150px"
                            onClick={() => this.removeButton(buttonSelected)}
                        >
                            Remove Button
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

// Takes an object as an argument with the id, type, initialState, user and owner to customize the appearance or behavior of the button or group of buttons.
// The function returns a JSX element called Buttons, with the id, type, initialState, user and owner being passed to it. This JSX element Buttons is a component 
// that represents a UI element in the form of a button or a group of buttons.
const createButtons = ({id, type, initialState, updateItem, deleteItem, cloneComponent, sources}) => (
    <Buttons
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
// createButtons
export default createButtons;
