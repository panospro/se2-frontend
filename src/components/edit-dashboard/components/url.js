/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */

/*
* Importing the necessary modules
*/
import React from 'react';
import styled from 'styled-components';
import {
    Alert, EditableText, InputGroup, Tooltip
} from '@blueprintjs/core';
import {
    faCog, faTrashAlt, faClone
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

// Style StyledLink
const StyledLink = styled.div`
    width: 100%;
    height: calc(100% - 35px);
    max-height: 100%;
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: -webkit-link;
    cursor: pointer;
    word-break: break-word;
    :hover {
        text-decoration: underline;
    }
`;

class Url extends React.Component {
    // It sets the initial type, state, updateItem etc.
    constructor(props) {
        super(props);

        this.type = props.type;
        this.updateItem = props.updateItem;
        this.deleteItem = props.deleteItem;
        this.cloneComponent = props.cloneComponent;

        this.state = {
            id: props.id,
            name: props.initialState.name || 'Url',
            url: props.initialState.url || '',
            popoverOpen: false,
            deletePopupOpen: false,
            tempUrl: '',
            fontSize: 50
        };

        this.sendUpdate = this.sendUpdate.bind(this);
        this.delete = this.delete.bind(this);
        this.changeName = this.changeName.bind(this);
        this.openPopup = this.openPopup.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.closeConfirmPopup = this.closeConfirmPopup.bind(this);
        this.openDelete = this.openDelete.bind(this);
        this.closeDelete = this.closeDelete.bind(this);
        this.resize = this.resize.bind(this);
        this.changeUrl = this.changeUrl.bind(this);
        this.clone = this.clone.bind(this);
    }

    // Returns an object containing values that should be added to the component's state based on the new props. 
    // In this case, the returned object contains the values of the id, name and url props, with default values used
    // if the props are not defined.
    static getDerivedStateFromProps(props) {
        return {
            id: props.id,
            name: props.initialState.name || 'Url',
            url: props.initialState.url || ''
        };
    }
    
    // Updates the component when text changes and then it resizes 
    // it by finding the new height and width.
    componentDidUpdate(__, prevState) {
        const {id, url} = this.state;
        if (url !== prevState.url) {
            const height = document.getElementById(`urlDiv_${id}`).offsetHeight;
            const width = document.getElementById(`urlDiv_${id}`).offsetWidth;
            this.resize(width, height);
        }
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
        const {url} = this.state;
        this.setState({
            popoverOpen: true,
            tempUrl: url
        });
    }

    // Closes the pop up and sets values to popoverOpen and tempUrl etc.
    closePopup() {
        this.setState({
            popoverOpen: false,
            tempUrl: ''
        });
    }

    // Update the url state variable based on the value of the tempUrl state variable and set 
    // the popoverOpen state variable to false etc.
    closeConfirmPopup() {
        const {tempUrl} = this.state;
        this.sendUpdate('url', tempUrl);
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

    // Updates the value of the activeText and fontSize properties in the component's state based
    //  on the width and height of the component
    resize(width, height) {
        const {url} = this.state;
        this.setState({fontSize: Math.max(Math.min(height, ((2 * width) / url.length)), 12)});
    }

    // Changes the url
    changeUrl(event) {
        event.stopPropagation();
        this.setState({tempUrl: event.target.value});
    }

    // Closes the popup and calls the cloneComponent function, passing in the value of the id  
    // in the component's state as an argument
    clone() {
        const {id} = this.state;
        this.closePopup();
        this.cloneComponent(id);
    }

    // Render the url. First by getting some values from this.state, which is an object that contains several pieces of state for the component.
    // These values are then used in the JSX element that is returned, which is a div element with several nested elements inside it. Some of 
    // these elements are custom or external components and style it. The timeSpan, minint, meanint and maxint states are used to render a Tooltip 
    // component, which is a custom or external component that displays additional information when hovered over. 
    render() {
        const {id, name, url, popoverOpen, deletePopupOpen, fontSize, tempUrl} = this.state;

        let urlToVisit = url;
        if (!urlToVisit.startsWith('http://') && !urlToVisit.startsWith('https://')) {
            urlToVisit = `http://${url}`;
        }
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
                        <StyledLink
                            id={`urlDiv_${id}`}
                            style={{fontSize: `${fontSize}px`}}
                            onClick={() => window.open(urlToVisit, '_blank')}
                        >
                            {url}
                        </StyledLink>
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
                            leftIcon="tag"
                            placeholder="Url"
                            onChange={this.changeUrl}
                            value={tempUrl}
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

// Takes the arguments id, type, initialState etc and pass them to Url. The values are determined by the values 
// of the properties in the object passed to createUrl.
const createUrl = ({id, type, initialState, updateItem, deleteItem, cloneComponent}) => (
    <Url
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
// createUrl
export default createUrl;
