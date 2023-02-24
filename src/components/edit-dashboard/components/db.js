/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */

/*
* Importing the necessary modules
* e.g. React, modules from our code,
* external modules and etc.
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

class DB extends React.Component {
    constructor(props) {
        super(props);

        this.type = props.type;
        this.updateItem = props.updateItem;
        this.deleteItem = props.deleteItem;
        this.cloneComponent = props.cloneComponent;

        this.state = {
            id: props.id,
            name: props.initialState.name || 'DB',
            uri: props.initialState.uri || '',
            connection: props.initialState.connection || '',
            collection: props.initialState.collection || '',
            tempUri: '', 
            tempConnection: '',
            tempCollection: '',            
            popoverOpen: false,
            deletePopupOpen: false,
            fontSize: 50,
        };

        this.sendUpdate = this.sendUpdate.bind(this);
        this.delete = this.delete.bind(this);
        this.changeName = this.changeName.bind(this);
        this.openPopup = this.openPopup.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.closeConfirmPopup = this.closeConfirmPopup.bind(this);
        this.openDelete = this.openDelete.bind(this);
        this.closeDelete = this.closeDelete.bind(this);
        this.changeUri = this.changeUri.bind(this);
        this.changeConnection = this.changeConnection.bind(this);
        this.changeCollection = this.changeCollection.bind(this);
        this.clone = this.clone.bind(this);
        // this.resize = this.resize.bind(this);
    }


    static getDerivedStateFromProps(props) {
        return {
            id: props.id,
            name: props.initialState.name || '',
            uri: props.initialState.uri || '',
            connection: props.initialState.connection || '',
            collection: props.initialState.collection || '',
        };
    }

    sendUpdate(key, value) {
        const {id} = this.state;
        this.updateItem(id, key, value);
    }

    // Updates the name 
    changeName(value) {
        this.sendUpdate('name', value);
    }

    // Opens the pop up and sets values to popoverOpen and tempUrl etc.
    openPopup() {
        const {uri, connection, collection} = this.state;
        this.setState({
            popoverOpen: true,
            tempUri: uri,
            tempConnection: connection,
            tempCollection: collection,
        });
    }

    // Closes the pop up and sets values to popoverOpen and tempUrl etc.
    closePopup() {
        this.setState({
            popoverOpen: false,
            tempUri: '',
            tempConnection: '',
            tempCollection: '',
        });
    }

    // Update the url state variable based on the value of the tempUrl state variable and set the 
    // popoverOpen state variable to false etc.
    closeConfirmPopup() {
        const {tempCollection, tempConnection, tempUri} = this.state;
        this.sendUpdate('uri', tempUri);
        this.sendUpdate('collection', tempCollection);
        this.sendUpdate('connection', tempConnection);
        this.setState({popoverOpen: false});
    }

    // Sets the deletePopupOpen state variable to false and then calls the deleteItem function with the component's 
    // id state variable as an argument.
    delete() {
        const {id} = this.state;
        this.setState({deletePopupOpen: false});
        this.deleteItem(id);
    }

    // Sets the deletePopupOpen state variable to true.
    openDelete() {
        this.setState({deletePopupOpen: true});
    }

    // Sets the deletePopupOpen state variable to false
    closeDelete() {
        this.setState({deletePopupOpen: false});
    }

    // Closes the popup and calls the cloneComponent function, passing in the value of the id  
    // in the component's state as an argument
    clone() {
        const {id} = this.state;
        this.closePopup();
        this.cloneComponent(id);
    }

    // Changes the Connection
    changeConnection(event) {
        event.stopPropagation();
        this.setState({tempConnection: event.target.value});
    }

    // Changes the collection
    changeCollection(event) {
        event.stopPropagation();
        this.setState({tempCollection: event.target.value});
    }

    changeUri(event) {
        event.stopPropagation();
        this.setState({tempUri: event.target.value});
    }
    // Updates the value of the activeText and fontSize properties in the component's state based
    //  on the width and height of the component
    // resize(width, height) {
    //     const {text} = this.state;
    //     this.setState({fontSize: Math.max(Math.min(height, ((2 * width) / text.length)), 12)});
    // }

    render() {
        const {id, name, uri, connection, collection, popoverOpen, deletePopupOpen, fontSize, tempCollection, tempConnection, tempUri} = this.state;


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
                            id={`db_${id}`}
                            style={{
                                width: '100%',
                                height: 'calc(100% - 35px)',
                                maxHeight: '100%',
                                marginTop: '10px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: '#16335B',
                                fontSize: `${fontSize}px`,
                                wordBreak: 'break-word'
                            }}
                        >
                            {uri}
                            {connection}
                            {collection}
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
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <InputGroup
                            leftIcon="tag"
                            placeholder="Uri"
                            onChange={this.changeUri}
                            value={tempUri}
                            fill
                            large
                        />
                    </div>
                    <div
                        style={{
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <InputGroup
                            leftIcon="tag"
                            placeholder="Connection Name"
                            onChange={this.changeConnection}
                            value={tempConnection}
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
                            leftIcon="tag"
                            placeholder="Collection Name"
                            onChange={this.changeCollection}
                            value={tempCollection}
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





const createDB = ({id, type, initialState, updateItem, deleteItem, cloneComponent}) => (
    <DB
        id={id}
        type={type}
        initialState={initialState}
        updateItem={updateItem}
        deleteItem={deleteItem}
        cloneComponent={cloneComponent}
    />
);


export default createDB;
