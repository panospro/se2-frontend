/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */
import React from 'react';
import styled from 'styled-components';
import {
    Alert, EditableText, InputGroup, Menu, MenuItem, Popover, Tooltip
} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {
    faCog, faMapMarkerAlt, faThumbtack, faTimesCircle, faTrashAlt, faClone
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {PortalOverflowOverlay} from '../../../lib/overlays';
import {
    BlueBorderButton, BlueButton, OrangeButton
} from '../../../lib/buttons';
import imagePlaceholder from '../../../assets/imagePlaceholder.png';

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
    max-height: 400px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const CustomDiv = styled.div`
    width: 100%;
    height: 100%;
    margin-top: ${(props) => ((props.orientation === 'horizontal') ? '-10px' : '0px')};
    margin-left: ${(props) => ((props.orientation === 'vertical') ? '-10px' : '0px')};
    display: flex;
    flex-direction: ${(props) => ((props.orientation === 'horizontal') ? 'column' : 'row')};
    align-items: center;
    .map-annotation-buttons {  
        width: 14px;
        height: 14px;
        display: flex!important;
        justify-content: center!important;
        margin-top: ${(props) => ((props.orientation === 'horizontal') ? `${Math.max((props.height - props.imageHeight) / 4, 10)}px` : 'auto')};
        margin-left: ${(props) => ((props.orientation === 'vertical') ? `${Math.max((props.width - props.imageWidth) / 4, 10)}px` : 'auto')};
        margin-bottom: ${(props) => ((props.orientation === 'horizontal') ? '0px' : 'auto')};
        margin-right: ${(props) => ((props.orientation === 'vertical') ? '0px' : 'auto')};
        align-items: center;
        color: #16335B;
    }
    .map-annotation-buttons:hover {
        background: #FF9D66!important;
        color: white!important;
    }
`;

class NavigationRoute extends React.Component {
    constructor(props) {
        super(props);

        this.type = props.type;
        this.updateItem = props.updateItem;
        this.deleteItem = props.deleteItem;
        this.cloneComponent = props.cloneComponent;
        
        this.state = {
            id: props.id,
            availableSources: props.availableSources,
            name: props.initialState.name || 'Navigation Route',
            source: props.initialState.source || 'Select source',
            mapTopic: props.initialState.mapTopic || '',
            requestMapTopic: props.initialState.requestMapTopic || '',
            changeAnnotationsTopic: props.initialState.changeAnnotationsTopic || '',
            setAnnotationGoalTopic: props.initialState.setAnnotationGoalTopic || '',
            setGoalTopic: props.initialState.setGoalTopic || '',
            getAnnotationsTopic: props.initialState.getAnnotationsTopic || '',
            requestAnnotationsTopic: props.initialState.requestAnnotationsTopic || '',
            cancelGoalTopic: props.initialState.cancelGoalTopic || '',
            poseTopic: props.initialState.poseTopic || '',
            pathTopic: props.initialState.pathTopic || '',
            popoverOpen: false,
            deletePopupOpen: false,
            tempSource: 'Select source',
            tempMapTopic: '',
            tempRequestMapTopic: '',
            tempChangeAnnotationsTopic: '',
            tempSetAnnotationGoalTopic: '',
            tempSetGoalTopic: '',
            tempGetAnnotationsTopic: '',
            tempRequestAnnotationsTopic: '',
            tempCancelGoalTopic: '',
            tempPoseTopic: '',
            tempPathTopic: '',
            width: 50,
            height: 50,
            orientation: 'horizontal',
            smallButtons: false,
            imageWidth: 50,
            imageHeight: 50,
            closedButtons: false
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
        this.changeMapTopic = this.changeMapTopic.bind(this);
        this.changeRequestMapTopic = this.changeRequestMapTopic.bind(this);
        this.changeChangeAnnotationTopic = this.changeChangeAnnotationTopic.bind(this);
        this.changeSetAnnotationGoalTopic = this.changeSetAnnotationGoalTopic.bind(this);
        this.changeSetGoalTopic = this.changeSetGoalTopic.bind(this);
        this.changeGetAnnotationsTopic = this.changeGetAnnotationsTopic.bind(this);
        this.changeRequestAnnotationsTopic = this.changeRequestAnnotationsTopic.bind(this);
        this.changeCancelGoalTopic = this.changeCancelGoalTopic.bind(this);
        this.changePoseTopic = this.changePoseTopic.bind(this);
        this.changePathTopic = this.changePathTopic.bind(this);
        this.resize = this.resize.bind(this);
        this.clone = this.clone.bind(this);
    }

    componentDidMount() {
        const {id} = this.state;
        const resizeDiv = document.getElementById(`navigationRouteDiv_${id}`);
        this.resize(resizeDiv.offsetWidth, resizeDiv.offsetHeight);
    }

    static getDerivedStateFromProps(props) {
        return {
            id: props.id,
            availableSources: props.availableSources,
            name: props.initialState.name || 'Navigation Route',
            source: props.initialState.source || 'Select source',
            mapTopic: props.initialState.mapTopic || '',
            requestMapTopic: props.initialState.requestMapTopic || '',
            changeAnnotationsTopic: props.initialState.changeAnnotationsTopic || '',
            setAnnotationGoalTopic: props.initialState.setAnnotationGoalTopic || '',
            setGoalTopic: props.initialState.setGoalTopic || '',
            getAnnotationsTopic: props.initialState.getAnnotationsTopic || '',
            requestAnnotationsTopic: props.initialState.requestAnnotationsTopic || '',
            cancelGoalTopic: props.initialState.cancelGoalTopic || '',
            poseTopic: props.initialState.poseTopic || '',
            pathTopic: props.initialState.pathTopic || ''
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
        const {source, mapTopic, requestMapTopic, changeAnnotationsTopic, setAnnotationGoalTopic, setGoalTopic, getAnnotationsTopic, requestAnnotationsTopic, cancelGoalTopic, poseTopic, pathTopic} = this.state;
        this.setState({
            popoverOpen: true,
            tempSource: source,
            tempMapTopic: mapTopic,
            tempRequestMapTopic: requestMapTopic,
            tempChangeAnnotationsTopic: changeAnnotationsTopic,
            tempSetAnnotationGoalTopic: setAnnotationGoalTopic,
            tempSetGoalTopic: setGoalTopic,
            tempGetAnnotationsTopic: getAnnotationsTopic,
            tempRequestAnnotationsTopic: requestAnnotationsTopic,
            tempCancelGoalTopic: cancelGoalTopic,
            tempPoseTopic: poseTopic,
            tempPathTopic: pathTopic
        });
    }

    closePopup() {
        this.setState({
            popoverOpen: false,
            tempSource: 'Select source',
            tempMapTopic: '',
            tempRequestMapTopic: '',
            tempChangeAnnotationsTopic: '',
            tempSetAnnotationGoalTopic: '',
            tempSetGoalTopic: '',
            tempGetAnnotationsTopic: '',
            tempRequestAnnotationsTopic: '',
            tempCancelGoalTopic: '',
            tempPoseTopic: '',
            tempPathTopic: ''
        });
    }

    closeConfirmPopup() {
        const {tempSource, tempMapTopic, tempRequestMapTopic, tempChangeAnnotationsTopic, tempSetAnnotationGoalTopic, tempSetGoalTopic, tempGetAnnotationsTopic, tempRequestAnnotationsTopic, tempCancelGoalTopic, tempPoseTopic, tempPathTopic} = this.state;
        this.sendUpdate('source', tempSource);
        this.sendUpdate('mapTopic', tempMapTopic);
        this.sendUpdate('requestMapTopic', tempRequestMapTopic);
        this.sendUpdate('changeAnnotationsTopic', tempChangeAnnotationsTopic);
        this.sendUpdate('setAnnotationGoalTopic', tempSetAnnotationGoalTopic);
        this.sendUpdate('setGoalTopic', tempSetGoalTopic);
        this.sendUpdate('getAnnotationsTopic', tempGetAnnotationsTopic);
        this.sendUpdate('requestAnnotationsTopic', tempRequestAnnotationsTopic);
        this.sendUpdate('cancelGoalTopic', tempCancelGoalTopic);
        this.sendUpdate('poseTopic', tempPoseTopic);
        this.sendUpdate('pathTopic', tempPathTopic);
        this.setState({popoverOpen: false});
    }

    openDelete() {
        this.setState({deletePopupOpen: true});
    }

    closeDelete() {
        this.setState({deletePopupOpen: false});
    }

    changeSource(value) {
        this.setState({tempSource: value});
    }

    changeMapTopic(event) {
        event.stopPropagation();
        this.setState({tempMapTopic: event.target.value});
    }

    changeRequestMapTopic(event) {
        event.stopPropagation();
        this.setState({tempRequestMapTopic: event.target.value});
    }

    changeChangeAnnotationTopic(event) {
        event.stopPropagation();
        this.setState({tempChangeAnnotationsTopic: event.target.value});
    }

    changeSetAnnotationGoalTopic(event) {
        event.stopPropagation();
        this.setState({tempSetAnnotationGoalTopic: event.target.value});
    }

    changeSetGoalTopic(event) {
        event.stopPropagation();
        this.setState({tempSetGoalTopic: event.target.value});
    }

    changeGetAnnotationsTopic(event) {
        event.stopPropagation();
        this.setState({tempGetAnnotationsTopic: event.target.value});
    }

    changeRequestAnnotationsTopic(event) {
        event.stopPropagation();
        this.setState({tempRequestAnnotationsTopic: event.target.value});
    }

    changeCancelGoalTopic(event) {
        event.stopPropagation();
        this.setState({tempCancelGoalTopic: event.target.value});
    }

    changePoseTopic(event) {
        event.stopPropagation();
        this.setState({tempPoseTopic: event.target.value});
    }

    changePathTopic(event) {
        event.stopPropagation();
        this.setState({tempPathTopic: event.target.value});
    }

    resize(width, height) {
        const {id} = this.state;
        const closedButtons = ((width > height && height < 80) || (width < height && width < 100));
        const img = document.getElementById(`navigationRouteImage_${id}`);
        const ratio = img.naturalWidth / img.naturalHeight;
        let w = img.height * ratio;
        let h = img.height;
        if (w > img.width) {
            w = img.width;
            h = img.width / ratio;
        }
        this.setState({
            width,
            height,
            orientation: (width > height) ? 'horizontal' : 'vertical',
            smallButtons: (((width < height && width < 300) || (width > height && height < 160)) && !closedButtons),
            closedButtons,
            imageWidth: w,
            imageHeight: h
        });
    }

    clone() {
        const {id} = this.state;
        this.closePopup();
        this.cloneComponent(id);
    }

    render() {
        const {id, availableSources, name, popoverOpen, deletePopupOpen, tempSource, tempMapTopic, tempRequestMapTopic, tempChangeAnnotationsTopic, tempSetAnnotationGoalTopic, tempSetGoalTopic, tempGetAnnotationsTopic, tempRequestAnnotationsTopic, tempCancelGoalTopic, tempPoseTopic, tempPathTopic, width, height, orientation, smallButtons, closedButtons, imageWidth, imageHeight} = this.state;

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
                            id={`navigationRouteDiv_${id}`}
                            style={{
                                width: '100%',
                                height: 'calc(100% - 35px)',
                                maxHeight: '100%',
                                marginTop: '10px',
                                display: 'flex',
                                flexDirection: (orientation === 'horizontal') ? 'row' : 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {closedButtons && <img id={`navigationRouteImage_${id}`} src={imagePlaceholder} alt="" style={{width: '100%', height: '100%', objectFit: 'contain'}} />}
                            {(!closedButtons && !smallButtons) && <img id={`navigationRouteImage_${id}`} src={imagePlaceholder} alt="" style={{width: (orientation === 'horizontal') ? 'calc(100% - 120px)' : '100%', height: (orientation === 'vertical') ? 'calc(100% - 35px)' : '100%', objectFit: 'contain'}} />}
                            {(!closedButtons && smallButtons) && <img id={`navigationRouteImage_${id}`} src={imagePlaceholder} alt="" style={{width: (orientation === 'horizontal') ? 'calc(100% - 40px)' : '100%', height: (orientation === 'vertical') ? 'calc(100% - 40px)' : '100%', objectFit: 'contain'}} />}
                            {(!closedButtons && !smallButtons) 
                            && (
                                <div 
                                    style={{
                                        width: (orientation === 'horizontal') ? ((width > 250) ? '120px' : '30px') : '100%', 
                                        height: (orientation === 'vertical') ? ((height > 250) ? '100px' : '30px') : '100%', 
                                        padding: '0px 5px 0px 5px',
                                        display: 'flex',
                                        flexDirection: (orientation === 'vertical') ? 'row' : 'column'
                                    }}
                                >
                                    {((orientation === 'horizontal' && width > 250) || (orientation === 'vertical' && height > 250))
                                    && (
                                        <div 
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                marginLeft: (orientation === 'vertical') ? '-10px' : '0px',
                                                display: 'flex',
                                                flexDirection: (orientation === 'vertical') ? 'row' : 'column',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <OrangeButton 
                                                width={(orientation === 'horizontal') ? '100%' : '20%'}
                                                textAlign="center"
                                                fontSize="14px"
                                                marginTop={(orientation === 'horizontal') ? `${Math.max((height - imageHeight) / 2, 10)}px` : '0px'}
                                                marginLeft={(orientation === 'vertical') ? `${Math.max((width - imageWidth) / 2, 10)}px` : '0px'}
                                            >
                                                Annotate
                                            </OrangeButton>
                                            <OrangeButton 
                                                width={(orientation === 'horizontal') ? '100%' : '20%'}
                                                textAlign="center"
                                                fontSize="14px"
                                                marginTop={(orientation === 'horizontal') ? `${Math.max((height - imageHeight) / 4, 10)}px` : '0px'}
                                                marginLeft={(orientation === 'vertical') ? `${Math.max((width - imageWidth) / 4, 10)}px` : '0px'}
                                            >
                                                Go to Point
                                            </OrangeButton>
                                            <OrangeButton 
                                                width={(orientation === 'horizontal') ? '100%' : '20%'}
                                                textAlign="center"
                                                fontSize="14px"
                                                marginTop={(orientation === 'horizontal') ? `${Math.max((height - imageHeight) / 4, 10)}px` : '0px'}
                                                marginLeft={(orientation === 'vertical') ? `${Math.max((width - imageWidth) / 4, 10)}px` : '0px'}
                                            >
                                                Cancel Goal
                                            </OrangeButton>
                                        </div>
                                    )}
                                </div>
                            )}
                            {(!closedButtons && smallButtons) 
                            && (
                                <div 
                                    style={{
                                        width: (orientation === 'horizontal') ? '40px' : '100%', 
                                        height: (orientation === 'horizontal') ? '100%' : '40px', 
                                        padding: '5px',
                                        display: 'flex',
                                        flexDirection: (orientation === 'vertical') ? 'row' : 'column',
                                        alignItems: 'center'
                                    }}
                                >
                                    <CustomDiv orientation={orientation} width={width} height={height} imageWidth={imageWidth} imageHeight={imageHeight}>
                                        <Tooltip content="Annotate" targetClassName="map-annotation-buttons">
                                            <FontAwesomeIcon 
                                                icon={faThumbtack}   
                                                style={{
                                                    fontSize: '12px',
                                                    cursor: 'pointer', 
                                                }} 
                                            />
                                        </Tooltip>
                                        <Tooltip content="Go to Point" targetClassName="map-annotation-buttons">
                                            <FontAwesomeIcon 
                                                icon={faMapMarkerAlt}  
                                                style={{
                                                    fontSize: '12px',
                                                    cursor: 'pointer', 
                                                }} 
                                            />
                                        </Tooltip>
                                        <Tooltip content="Cancel Goal" targetClassName="map-annotation-buttons">
                                            <FontAwesomeIcon 
                                                icon={faTimesCircle}   
                                                style={{
                                                    fontSize: '12px',
                                                    cursor: 'pointer', 
                                                }} 
                                            />
                                        </Tooltip>
                                    </CustomDiv>
                                </div>
                            )}
                        </div>
                    )}
                </ReactResizeDetector>
            </div>,
            <PortalOverflowOverlay key="settings" id="settings" isOpen={popoverOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    {`${name} Settings`}
                    <div style={{position: 'absolute', right: '0px', top: '0px'}}>
                        <Tooltip content="Clone component" popoverClassName="item-info-tooltip">
                            <FontAwesomeIcon icon={faClone} style={{color: '#FF9D66', fontSize: '20px', cursor: 'pointer'}} onClick={this.clone} />
                        </Tooltip>
                    </div>
                </FormHeader>
                <SettingsDiv>
                    <div 
                        style={{
                            width: '400px', height: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'
                        }}
                    >
                        <Popover popoverClassName="custom-popover">
                            <BlueBorderButton type="button" width="400px" rightIcon="caret-down">
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
                                placeholder="Map Topic"
                                onChange={this.changeMapTopic}
                                value={tempMapTopic}
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
                                placeholder="Request Map Topic"
                                onChange={this.changeRequestMapTopic}
                                value={tempRequestMapTopic}
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
                                placeholder="Add/Remove Annotation Topic"
                                onChange={this.changeChangeAnnotationTopic}
                                value={tempChangeAnnotationsTopic}
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
                                placeholder="Set Annotation Goal Topic"
                                onChange={this.changeSetAnnotationGoalTopic}
                                value={tempSetAnnotationGoalTopic}
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
                                placeholder="Set Pose Goal Topic"
                                onChange={this.changeSetGoalTopic}
                                value={tempSetGoalTopic}
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
                                placeholder="Get Annotations Topic"
                                onChange={this.changeGetAnnotationsTopic}
                                value={tempGetAnnotationsTopic}
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
                                placeholder="Request Annotations Topic"
                                onChange={this.changeRequestAnnotationsTopic}
                                value={tempRequestAnnotationsTopic}
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
                                placeholder="Cancel Goal Topic"
                                onChange={this.changeCancelGoalTopic}
                                value={tempCancelGoalTopic}
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
                                placeholder="Pose Topic"
                                onChange={this.changePoseTopic}
                                value={tempPoseTopic}
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
                                placeholder="Path Topic"
                                onChange={this.changePathTopic}
                                value={tempPathTopic}
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

const createNavigationRoute = ({id, type, initialState, updateItem, deleteItem, cloneComponent, sources}) => (
    <NavigationRoute 
        id={id}
        type={type}
        initialState={initialState}
        updateItem={updateItem}
        deleteItem={deleteItem}
        cloneComponent={cloneComponent}
        availableSources={sources}
    />
);

export default createNavigationRoute;
