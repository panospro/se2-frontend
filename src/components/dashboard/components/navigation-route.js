/* eslint-disable camelcase */
/* eslint-disable react/no-unused-state */
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
    Alert,
    EditableText, InputGroup, Spinner, Tooltip
} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {map} from 'rxjs/operators';
import {
    faMapMarkerAlt, faThumbtack, faTimesCircle, faExpand, faTimes
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    BlueBorderButton, BlueButton, OrangeButton, RedBorderButton
} from '../../../lib/buttons';
import {ToasterBottom} from '../../../lib/toaster';
import {findSource} from '../../../api/sources';
import {PortalOverflowOverlay} from '../../../lib/overlays';
import robotIcon from '../../../assets/robot.png';

const mqtt = require('mqtt');

/*
* Set the width, display, alignment, margins
* and font-size and font-weight of FormHeader div.
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
`;
/*
* Set the width, display, alignment,
* margins and font-size fonr-weight of FormSubHeader div.
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
* Sets the width, display and alignment
* of SettingsDiv div.
*/
const SettingsDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

/*
* Sets the z-index, background and cursor of CustomCanvas canvas.
*/
const CustomCanvas = styled.canvas`
    z-index: 3;
    background: rgba(255, 255, 255, 0.2);
    cursor: crosshair;
`;

// Set the width, height, margin, display, flex-direction
// and alignment of CustomDiv div, as well as the width,
// height, margin, display, justify-content, margin, alignment
// of map-annotation-buttons div and the color and background
// of map-annotation-buttons div when hovering.
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
    // Takes in a date object and returns a formatted string representation of that date. First gets the day, month and year values from the date object and stores them
    // in separate variables. It then gets the hour, minute and second values and stores them in separate variables as well.
    // Then checks the length of each of these values and if the length is 1, it adds a leading zero to the value. For example, if the month is 9, the value will be changed to 09.
    // Finally, the function returns a string that is formatted as "dd/mm/yyyy, hh:mm:ss", using the day, month, year, hour, minute and second values that were extracted from the date object.
    constructor(props) {
        super(props);

        this.type = props.type;
        
        this.state = {
            spinnerOpen: false,
            id: props.id,
            user: props.user,
            owner: props.owner,
            name: props.initialState.name || 'Navigation Route',
            image: '',
            pose: {x: 50, y: 50, theta: 0},
            path: [],
            annotations: [],
            map_width: 10,
            map_height: 10,
            resolution: 0.1,
            origin: {x: 0, y: 0},
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
            width: 50,
            height: 50,
            orientation: 'horizontal',
            smallButtons: false,
            closedButtons: false,
            imageWidth: 50,
            imageHeight: 50,
            canvasOpen: false,
            gotoCanvasOpen: false,
            annotationNamePopupOpen: false,
            tempAnnotationName: '',
            deleteAnnotationPopupOpen: false,
            selectAnnotationPopupOpen: false,
            imagePopupOpen: false,
            previousImageWidth: 50,
            previousImageHeight: 50
        };
        this.rxStomp = null;
        this.mqttClient = null;
        this.canvas = React.createRef();
        this.ctx = null;
        this.gotoCanvas = React.createRef();
        this.gotoCtx = null;
        this.tempPoint = null;
        this.tempDeleteAnnotation = null;
        this.tempSelectedAnnotation = null;

        this.changeSpinner = this.changeSpinner.bind(this);
        this.messageReceivedMap = this.messageReceivedMap.bind(this);
        this.messageReceivedPose = this.messageReceivedPose.bind(this);
        this.messageReceivedPath = this.messageReceivedPath.bind(this);
        this.messageReceivedAnnotations = this.messageReceivedAnnotations.bind(this);
        this.connectStompSource = this.connectStompSource.bind(this);
        this.connectMqttSource = this.connectMqttSource.bind(this);
        this.connectToTopic = this.connectToTopic.bind(this);
        this.resize = this.resize.bind(this);
        this.annotate = this.annotate.bind(this);
        this.goToPlace = this.goToPlace.bind(this);
        this.goToPoint = this.goToPoint.bind(this);
        this.cancelGoal = this.cancelGoal.bind(this);
        this.closeAnnotate = this.closeAnnotate.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseUpGoto = this.onMouseUpGoto.bind(this);
        this.addAnnotation = this.addAnnotation.bind(this);
        this.deleteAnnotation = this.deleteAnnotation.bind(this);
        this.sendPointGoal = this.sendPointGoal.bind(this);
        this.closeGotoCanvas = this.closeGotoCanvas.bind(this);
        this.changeAnnotationName = this.changeAnnotationName.bind(this);
        this.cancelAnnotation = this.cancelAnnotation.bind(this);
        this.sendAnnotation = this.sendAnnotation.bind(this);
        this.openDeleteAnnotation = this.openDeleteAnnotation.bind(this);
        this.closeDeleteAnnotation = this.closeDeleteAnnotation.bind(this);
        this.selectAnnotation = this.selectAnnotation.bind(this);
        this.cancelSelectAnnotation = this.cancelSelectAnnotation.bind(this);
        this.openImage = this.openImage.bind(this);
        this.closeImage = this.closeImage.bind(this);
    }

    // Called immediately after the component is mounted and is used
    // to trigger an action or dispatch an event.
    componentDidMount() {
        this.connectToTopic();
        const {id} = this.state;
        const imageDiv = document.getElementById(`navigationRouteDiv_${id}`);
        this.resize(imageDiv.offsetWidth, imageDiv.offsetHeight);
    }

    // It is called immediately before the component is
    // unmounted (removed from the DOM) and is used to
    // perform any necessary cleanup before the component is destroyed.
    componentWillUnmount() {
        if (this.rxStomp !== null) {
            this.rxStomp.deactivate();
        }
        if (this.mqttClient !== null) {
            this.mqttClient.end();
        }
    }

    // What happens when the mouse goes upwards. Checks if the
    // mouse is within the boundary of the canvas and if so,
    // adds an annotation to the canvas with the coordinates
    // of the mouse. It then sets the canvasOpen state to
    // false and removes the mouseup event listener. 
    onMouseUp(e) {        
        if (this.canvas.current) {
            const {left, right, top, bottom} = this.canvas.current.getBoundingClientRect();
            if (!(e.pageX < left || e.pageX > right || e.pageY < top || e.pageY > bottom)) {
                const point = {
                    x: e.offsetX,
                    y: e.offsetY
                };
                this.setState({canvasOpen: false});
                document.removeEventListener('mouseup', this.onMouseUp, false);
                this.addAnnotation(point);
            }
        }
    }

    // Checks if the mouse has been clicked outside
    // of the "gotoCanvas" element. If it has been,
    // it removes the event listener and sends a goal
    // point to the canvas.
    onMouseUpGoto(e) {        
        if (this.gotoCanvas.current) {
            const {left, right, top, bottom} = this.gotoCanvas.current.getBoundingClientRect();
            if (!(e.pageX < left || e.pageX > right || e.pageY < top || e.pageY > bottom)) {
                const point = {
                    x: e.offsetX,
                    y: e.offsetY
                };
                this.setState({gotoCanvasOpen: false});
                document.removeEventListener('mouseup', this.onMouseUpGoto, false);
                this.sendPointGoal(point);
            }
        }
    }

    // Changes the value of the spinnerOpen state to the
    // given value. It is used to open or close the spinner. 
    changeSpinner(value) {
        this.setState({spinnerOpen: value});
    }
    
    // Displays a received message that is expected to contain an image, 
    // sending a request for annotations and updating the state to store the image and 
    // its dimensions before resizing the image and displaying it in a div element.
    messageReceivedMap(payload) {
        const {requestAnnotationsTopic, previousImageWidth, previousImageHeight} = this.state;
        try {
            const image = payload.data.img;
            if (this.rxStomp !== null) {
                this.rxStomp.publish({destination: `/topic/${requestAnnotationsTopic}`, body: JSON.stringify({})});
            } else if (this.mqttClient !== null) {
                this.mqttClient.publish(requestAnnotationsTopic, JSON.stringify({}));
            }
            if (previousImageWidth !== payload.data.width || previousImageHeight !== payload.data.height) {
                this.setState({
                    previousImageWidth: payload.data.width,
                    previousImageHeight: payload.data.height,
                    path: []
                });
            }
            this.setState({image: `data:image/jpg;base64,${image}`}, () => {
                setTimeout(() => {
                    const {id} = this.state;
                    const imageDiv = document.getElementById(`navigationRouteDiv_${id}`);
                    this.resize(imageDiv.offsetWidth, imageDiv.offsetHeight);
                }, 200);
            });
        } catch (error) {
            console.error('An error occurred:', error);
          }
    }


    // Processes a received message that is expected to contain pose data, 
    // including the width and height of a map, the origin and resolution of the map
    // and the x and y coordinates and orientation (theta) of the robot.
    // Then calculates the position of the robot on the map in terms of percentages of
    // the map's dimensions and stores the pose data and map details in the 
    // component's state.
    messageReceivedPose(payload) {
        try {
            const {map_width, map_height, origin, resolution, theta, x, y} = payload.data;
            const robotX = ((origin.x + x) / (map_width * resolution)) * 100;
            const robotY = (1 - (((origin.y + y) / resolution) / map_height)) * 100;
            const pose = {x: robotX, y: robotY, theta};
            this.setState({
                pose, 
                map_width,
                map_height,
                origin,
                resolution
            });
        } catch (error) {
            console.error('An error occurred:', error);
          }
    }

    // ReceivES a message that is expected to contain path data, calculating
    // the positions of the points on a map in terms of percentages of the map's 
    // dimensions and storing the path data and map details in the component's state.
    messageReceivedPath(payload) {
        try {
            const {map_width, map_height, origin, resolution, path} = payload.data;
            const dataPath = [];
            path.forEach((p) => {
                const pX = ((origin.x + p.x) / (map_width * resolution)) * 100;
                const pY = (1 - (((origin.y + p.y) / resolution) / map_height)) * 100;
                dataPath.push({x: pX, y: pY});
            });
            this.setState({
                path: dataPath, 
                map_width,
                map_height,
                origin,
                resolution
            });
        } catch (error) {
            console.error('An error occurred:', error);
          }
    }

    // This method processes a received message containing annotation data
    // and stores the data and map details in the component's state.
    messageReceivedAnnotations(payload) {
        try {
            const {map_width, map_height, origin, resolution, annotations} = payload.data;
            const annotationsData = [];
            Object.keys(annotations).forEach((p) => {
                const pX = ((origin.x + annotations[p].pose.x) / (map_width * resolution)) * 100;
                const pY = (1 - (((origin.y + annotations[p].pose.y) / resolution) / map_height)) * 100;
                annotationsData.push({x: pX, y: pY, name: p});
            });
            this.setState({
                annotations: annotationsData, 
                map_width,
                map_height,
                origin,
                resolution
            });
        } catch (error) {
            console.error('An error occurred:', error);
          }
    }

    // Connect to stomp source using RxStomp, listen for messages on
    // different topics and handle them accordingly.
    connectStompSource(source) {
        const {name, mapTopic, poseTopic, pathTopic, getAnnotationsTopic, requestMapTopic} = this.state;
        try {
            const stompConfig = {
                connectHeaders: {
                    login: source.login,
                    passcode: source.passcode,
                    host: source.vhost
                },
                // debug: (str) => {
                //     console.log(`STOMP: ${str}`);
                // },
                brokerURL: source.url
            };
            // eslint-disable-next-line no-undef
            this.rxStomp = new RxStomp.RxStomp();
            this.rxStomp.configure(stompConfig);
            this.rxStomp.activate();
            const initialReceiptId = `${name}_start`;

            this.rxStomp.watch(`/topic/${mapTopic}`, {receipt: initialReceiptId}).pipe(map((message) => JSON.parse(message.body))).subscribe((payload) => {
                this.messageReceivedMap(payload);
            });
            this.rxStomp.watchForReceipt(initialReceiptId, () => {
                this.changeSpinner(false);
                this.rxStomp.publish({destination: `/topic/${requestMapTopic}`, body: JSON.stringify({})});
            });
            this.rxStomp.watch(`/topic/${poseTopic}`).pipe(map((message) => JSON.parse(message.body))).subscribe((payload) => {
                this.messageReceivedPose(payload);
            });
            this.rxStomp.watch(`/topic/${pathTopic}`).pipe(map((message) => JSON.parse(message.body))).subscribe((payload) => {
                this.messageReceivedPath(payload);
            });
            this.rxStomp.watch(`/topic/${getAnnotationsTopic}`).pipe(map((message) => JSON.parse(message.body))).subscribe((payload) => {
                this.messageReceivedAnnotations(payload);
            });
        } catch (error) {
            console.error('An error occurred:', error);
          }
    }

    // Sets up an MQTT client connection and subscribes to various topics
    // to receive messages which it then handles with specific functions.
    connectMqttSource(source) {
        const {mapTopic, poseTopic, pathTopic, getAnnotationsTopic, requestMapTopic} = this.state;
        try {
            const config = {
                username: source.login,
                password: source.passcode
            };

            this.mqttClient = mqtt.connect(source.url, config);
            this.mqttClient.on('connect', () => {
                this.mqttClient.subscribe(`${mapTopic}`, (err) => {
                    if (!err) {
                        this.changeSpinner(false);
                        this.mqttClient.publish(requestMapTopic, JSON.stringify({}));
                    }
                });
                this.mqttClient.subscribe(`${poseTopic}`, () => {});
                this.mqttClient.subscribe(`${pathTopic}`, () => {});
                this.mqttClient.subscribe(`${getAnnotationsTopic}`, () => {});
            });

            this.mqttClient.on('message', (topic, message) => {
                if (topic === mapTopic) {
                    this.messageReceivedMap(JSON.parse(message.toString()));
                } else if (topic === poseTopic) {
                    this.messageReceivedPose(JSON.parse(message.toString()));
                } else if (topic === pathTopic) {
                    this.messageReceivedPath(JSON.parse(message.toString()));
                } else if (topic === getAnnotationsTopic) {
                    this.messageReceivedAnnotations(JSON.parse(message.toString()));
                }
            });
        } catch (error) {
            console.error('An error occurred:', error);
          }
    }

    // Connects to the specified source and subscribes to relevant topics.
    async connectToTopic() {
        const {user, owner, name, source} = this.state;
        const response = await findSource(source, owner, user);
        if (response.success) {
            if (response.source.type === 'stomp') {
                this.connectStompSource(response.source);
            } else {
                this.connectMqttSource(response.source);
            }
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || `There was a problem trying to find the source for ${name}`
            });
        }
    }

    // Resize sets the width and height of the image and its surrounding
    // div and determines whether the display should show small or closed buttons
    // based on the size of the display.
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

    // Function to open canvas for annotation and listen for mouse up events.
    annotate() {
        this.setState({canvasOpen: true}, () => {
            document.addEventListener('mouseup', this.onMouseUp, false);
        });
    }

    // Sends a message to a certain topic to navigate to an annotation
    goToPlace(ind) {
        const {setAnnotationGoalTopic, annotations} = this.state;
        try {
            if (this.rxStomp !== null) {
                this.rxStomp.publish({destination: `/topic/${setAnnotationGoalTopic}`, body: JSON.stringify({name: annotations[ind].name})});
            } else if (this.mqttClient !== null) {
                this.mqttClient.publish(setAnnotationGoalTopic, JSON.stringify({name: annotations[ind].name}));
            }
            this.setState({selectAnnotationPopupOpen: false});
        } catch (error) {
            console.error('An error occurred:', error);
          }
    }

    // Opens up a canvas to click on a point and sends the coordinates
    // to a message broker.
    goToPoint() {
        this.setState({gotoCanvasOpen: true}, () => {
            document.addEventListener('mouseup', this.onMouseUpGoto, false);
        });
    }

    // Function cancels the current goal by publishing a message on
    // the cancelGoalTopic.
    cancelGoal() {
        const {cancelGoalTopic} = this.state;
        try {
            if (this.rxStomp !== null) {
                this.rxStomp.publish({destination: `/topic/${cancelGoalTopic}`, body: JSON.stringify({})});
            } else if (this.mqttClient !== null) {
                this.mqttClient.publish(cancelGoalTopic, JSON.stringify({}));
            }
        } catch (error) {
            console.error('An error occurred:', error);
          }
    }

    // Close annotation canvas and remove mouse event listener.
    closeAnnotate() {
        this.setState({canvasOpen: false});
        document.removeEventListener('mouseup', this.onMouseUp, false);
    }

    // Opens input for new annotation name at given point
    addAnnotation(point) {
        this.tempPoint = point;
        this.setState({annotationNamePopupOpen: true});
    }

    // Sends a message over a message broker to delete an annotation 
    // at a specified index in the annotations array
    deleteAnnotation() {       
        const {annotations, changeAnnotationsTopic} = this.state;
        try {
            if (this.rxStomp !== null) {
                this.rxStomp.publish({destination: `/topic/${changeAnnotationsTopic}`, body: JSON.stringify({mode: 'delete', name: annotations[this.tempDeleteAnnotation].name})});
            } else if (this.mqttClient !== null) {
                this.mqttClient.publish(changeAnnotationsTopic, JSON.stringify({mode: 'delete', name: annotations[this.tempDeleteAnnotation].name}));
            }
            this.setState({deleteAnnotationPopupOpen: false});
        } catch (error) {
            console.error('An error occurred:', error);
          }
    }

    // Sends a goal to a topic in the form of an (x, y) coordinate, 
    // with theta (angle) set to 0, based on a point within the dimensions 
    // of an image and the resolution, width and height of the map
    sendPointGoal(point) {
        const {imageWidth, imageHeight, resolution, origin, map_width, map_height, setGoalTopic} = this.state;
        const newX = (((point.x / imageWidth) * map_width) * resolution) - origin.x;
        const newY = ((((imageHeight - point.y) / imageHeight) * map_height) * resolution) - origin.y;
        if (this.rxStomp !== null) {
            this.rxStomp.publish({destination: `/topic/${setGoalTopic}`, body: JSON.stringify({x: newX, y: newY, theta: 0})});
        } else if (this.mqttClient !== null) {
            this.mqttClient.publish(setGoalTopic, JSON.stringify({x: newX, y: newY, theta: 0}));
        }
    }

    // Closes the 'goto' canvas and removes mouseup event listener.
    closeGotoCanvas() {
        this.setState({gotoCanvasOpen: false});
        document.removeEventListener('mouseup', this.onMouseUpGoto, false);
    }

    // Sets a temporary annotation name based on input.
    changeAnnotationName(event) {
        this.setState({tempAnnotationName: event.target.value});
    }

    // Handles canceling the creation of a new annotation.
    cancelAnnotation() {
        this.tempPoint = null;
        this.setState({tempAnnotationName: '', annotationNamePopupOpen: false});
    }

    // Sends an annotation to change the annotations topic with the given name and pose. The pose is calculated from the given point on the image by converting it to map 
    // coordinates using the resolution and origin of the map and the 
    // width and height of the image and map. The function can be called 
    // using either RxStomp or an MQTT client
    sendAnnotation() {          
        const {tempAnnotationName, imageWidth, imageHeight, resolution, origin, map_width, map_height, changeAnnotationsTopic} = this.state;
        const newX = (((this.tempPoint.x / imageWidth) * map_width) * resolution) - origin.x;
        const newY = ((((imageHeight - this.tempPoint.y) / imageHeight) * map_height) * resolution) - origin.y;
        try {
            if (this.rxStomp !== null) {
                this.rxStomp.publish({destination: `/topic/${changeAnnotationsTopic}`, body: JSON.stringify({mode: 'add', name: tempAnnotationName, pose: {x: newX, y: newY}})});
            } else if (this.mqttClient !== null) {
                this.mqttClient.publish(changeAnnotationsTopic, JSON.stringify({mode: 'add', name: tempAnnotationName, pose: {x: newX, y: newY}}));
            }
            this.cancelAnnotation();
        } catch (error) {
            console.error('An error occurred:', error);
          }
    }

    // Opens a delete annotation popup, closes a select annotation 
    // popup andstores the annotation being deleted temporarily. It takes 
    // an index or identifier for the annotation as its parameter.
    openDeleteAnnotation(ind) {
        this.tempDeleteAnnotation = ind;
        this.setState({deleteAnnotationPopupOpen: true, selectAnnotationPopupOpen: false});
    }

    // Closes a delete annotation popup, closes a select annotation 
    // popup andstores the annotation being deleted temporarily. It takes
    // an index or identifier for the annotation
    // as its parameter.
    closeDeleteAnnotation() {
        this.tempDeleteAnnotation = null;
        this.setState({deleteAnnotationPopupOpen: false});
    }

    // Selects a annotation popup, closes a select annotation popup 
    // andstores the annotation temporarily. It takes an index or identifier
    //  for the annotation
    // as its parameter.
    selectAnnotation(ind) {
        this.tempSelectedAnnotation = ind;
        this.setState({selectAnnotationPopupOpen: true});
    }

    // Cancels a annotation popup, closes a select annotation popup
    // and stores the annotation being deleted temporarily. It takes
    // an index or identifier for the annotation as its parameter.
    cancelSelectAnnotation() {
        this.tempSelectedAnnotation = null;
        this.setState({selectAnnotationPopupOpen: false});
    }

    // Updates the state of the object by setting the imagePopupOpen 
    // to true.
    openImage() {
        this.setState({imagePopupOpen: true});
    }

    // Updates the state of the object by setting  imagePopupOpen to false.
    closeImage() {
        this.setState({imagePopupOpen: false});
    }

    // Render navigation-route. The render method returns a JSX element, 
    // which will be rendered to the page.
    render() {
        const {spinnerOpen, id, name, image, pose, path, annotations, width, height, orientation, smallButtons, closedButtons, imageWidth, imageHeight, canvasOpen, gotoCanvasOpen, annotationNamePopupOpen, tempAnnotationName, deleteAnnotationPopupOpen, selectAnnotationPopupOpen, imagePopupOpen} = this.state;
        
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
                    <EditableText disabled className="name-no-edit" placeholder="Component Name" value={name} />
                </div>
                <div
                    style={{
                        width: '100%',
                        height: 'calc(100% - 35px)',
                        maxHeight: '100%',
                        marginTop: '10px',
                        position: 'relative'
                    }}
                >
                    {spinnerOpen
                    && (
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                top: '0px',
                                left: '0px',
                                zIndex: 1000,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255, 255, 255, 0.6)'
                            }}
                        >
                            <Spinner intent="primary" size={Math.min(width / 10, height / 2)} />
                        </div> 
                    )}
                    <ReactResizeDetector onResize={this.resize}>
                        {() => (
                            <div
                                id={`navigationRouteDiv_${id}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: (orientation === 'horizontal') ? 'row' : 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                {closedButtons && <img id={`navigationRouteImage_${id}`} src={image} alt="" style={{width: '100%', height: '100%', objectFit: 'contain', zIndex: 1}} />}
                                {(closedButtons && image !== '')
                                && (
                                    <div
                                        style={{
                                            width: `${(Math.max(((Math.min(imageWidth, imageHeight) / 10) + 10), 20))}px`,
                                            height: `${(Math.max(((Math.min(imageWidth, imageHeight) / 10) + 10), 20))}px`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'absolute',
                                            bottom: `${(height - imageHeight) / 2}px`,
                                            right: `${(width - imageWidth) / 2}px`,
                                            background: '#D0D6DE',
                                            opacity: 0.8,
                                            zIndex: 2
                                        }}
                                    >
                                        <FontAwesomeIcon 
                                            icon={faExpand} 
                                            style={{
                                                color: '#FF9D66', 
                                                cursor: 'pointer', 
                                                fontSize: `${Math.max(Math.min(imageWidth, imageHeight) / 10, 14)}px`
                                            }}
                                            onClick={this.openImage}
                                        />
                                    </div>
                                )}
                                {(!closedButtons && !smallButtons) && <img id={`navigationRouteImage_${id}`} src={image} alt="" style={{width: (orientation === 'horizontal') ? 'calc(100% - 120px)' : '100%', height: (orientation === 'vertical') ? 'calc(100% - 35px)' : '100%', objectFit: 'contain', zIndex: 1}} />}
                                {(!closedButtons && !smallButtons && image !== '')
                                && (
                                    <div
                                        style={{
                                            width: `${(Math.max(((Math.min(imageWidth, imageHeight) / 10) + 10), 20))}px`,
                                            height: `${(Math.max(((Math.min(imageWidth, imageHeight) / 10) + 10), 20))}px`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'absolute',
                                            bottom: (orientation === 'vertical') ? `${((height - 100) - imageHeight) / 2 + 100}px` : `${(height - imageHeight) / 2}px`,
                                            right: (orientation === 'horizontal') ? `${(((width - 120) - imageWidth) / 2) + 120}px` : `${(width - imageWidth) / 2}px`,
                                            background: '#D0D6DE',
                                            opacity: 0.8,
                                            zIndex: 2
                                        }}
                                    >
                                        <FontAwesomeIcon 
                                            icon={faExpand} 
                                            style={{
                                                color: '#FF9D66', 
                                                cursor: 'pointer', 
                                                fontSize: `${Math.max(Math.min(imageWidth, imageHeight) / 10, 14)}px`
                                            }}
                                            onClick={this.openImage}
                                        />
                                    </div>
                                )}
                                {(!closedButtons && smallButtons) && <img id={`navigationRouteImage_${id}`} src={image} alt="" style={{width: (orientation === 'horizontal') ? 'calc(100% - 40px)' : '100%', height: (orientation === 'vertical') ? 'calc(100% - 40px)' : '100%', objectFit: 'contain', zIndex: 1}} />}
                                {(!closedButtons && smallButtons && image !== '')
                                && (
                                    <div
                                        style={{
                                            width: `${(Math.max(((Math.min(imageWidth, imageHeight) / 10) + 10), 20))}px`,
                                            height: `${(Math.max(((Math.min(imageWidth, imageHeight) / 10) + 10), 20))}px`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'absolute',
                                            bottom: (orientation === 'vertical') ? `${((height - 40) - imageHeight) / 2 + 40}px` : `${(height - imageHeight) / 2}px`,
                                            right: (orientation === 'horizontal') ? `${(((width - 40) - imageWidth) / 2) + 40}px` : `${(width - imageWidth) / 2}px`,
                                            background: '#D0D6DE',
                                            opacity: 0.8,
                                            zIndex: 2
                                        }}
                                    >
                                        <FontAwesomeIcon 
                                            icon={faExpand} 
                                            style={{
                                                color: '#FF9D66', 
                                                cursor: 'pointer', 
                                                fontSize: `${Math.max(Math.min(imageWidth, imageHeight) / 10, 14)}px`
                                            }}
                                            onClick={this.openImage}
                                        />
                                    </div>
                                )}
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
                                                    disabled={image === ''}
                                                    width={(orientation === 'horizontal') ? '100%' : '20%'}
                                                    textAlign="center"
                                                    fontSize="14px"
                                                    onClick={this.annotate}
                                                    marginTop={(orientation === 'horizontal') ? `${Math.max((height - imageHeight) / 2, 10)}px` : '0px'}
                                                    marginLeft={(orientation === 'vertical') ? `${Math.max((width - imageWidth) / 2, 10)}px` : '0px'}
                                                >
                                                    Annotate
                                                </OrangeButton>
                                                <OrangeButton 
                                                    disabled={image === ''}
                                                    width={(orientation === 'horizontal') ? '100%' : '20%'}
                                                    textAlign="center"
                                                    fontSize="14px"
                                                    onClick={this.goToPoint}
                                                    marginTop={(orientation === 'horizontal') ? `${Math.max((height - imageHeight) / 4, 10)}px` : '0px'}
                                                    marginLeft={(orientation === 'vertical') ? `${Math.max((width - imageWidth) / 4, 10)}px` : '0px'}
                                                >
                                                    Go to Point
                                                </OrangeButton>
                                                <OrangeButton 
                                                    disabled={image === ''}
                                                    width={(orientation === 'horizontal') ? '100%' : '20%'}
                                                    textAlign="center"
                                                    fontSize="14px"
                                                    onClick={this.cancelGoal}
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
                                            display: 'flex',
                                            flexDirection: (orientation === 'vertical') ? 'row' : 'column',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <CustomDiv orientation={orientation} width={width} height={height} imageWidth={imageWidth} imageHeight={imageHeight}>
                                            <Tooltip disabled={image === ''} content="Annotate" targetClassName="map-annotation-buttons">
                                                <FontAwesomeIcon 
                                                    disabled={image === ''}
                                                    icon={faThumbtack}  
                                                    style={{
                                                        fontSize: '12px',
                                                        cursor: (image === '') ? 'not-allowed' : 'pointer', 
                                                    }} 
                                                    onClick={(image === '') ? null : this.annotate}
                                                />
                                            </Tooltip>
                                            <Tooltip disabled={image === ''} content="Go to Point" targetClassName="map-annotation-buttons">
                                                <FontAwesomeIcon 
                                                    disabled={image === ''}
                                                    icon={faMapMarkerAlt} 
                                                    style={{
                                                        fontSize: '12px',
                                                        cursor: (image === '') ? 'not-allowed' : 'pointer'
                                                    }} 
                                                    onClick={(image === '') ? null : this.goToPoint}
                                                />
                                            </Tooltip>
                                            <Tooltip disabled={image === ''} content="Cancel Goal" targetClassName="map-annotation-buttons">
                                                <FontAwesomeIcon 
                                                    disabled={image === ''}
                                                    icon={faTimesCircle}  
                                                    style={{
                                                        fontSize: '12px',
                                                        cursor: (image === '') ? 'not-allowed' : 'pointer', 
                                                    }} 
                                                    onClick={(image === '') ? null : this.cancelGoal}
                                                />
                                            </Tooltip>
                                        </CustomDiv>
                                    </div>
                                )}
                            </div>
                        )}
                    </ReactResizeDetector>
                    <div
                        id={`navigationRouteComponents_${id}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: (orientation === 'horizontal') ? 'row' : 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            top: '0px',
                            left: '0px',
                            pointerEvents: 'none'
                            // background: 'rgba(255, 255, 255, 1)'
                        }}
                    >
                        <div 
                            style={{
                                width: (closedButtons) ? '100%' : ((smallButtons) ? ((orientation === 'horizontal') ? 'calc(100% - 40px)' : '100%') : ((orientation === 'horizontal') ? 'calc(100% - 120px)' : '100%')),
                                height: (closedButtons) ? '100%' : ((smallButtons) ? ((orientation === 'vertical') ? 'calc(100% - 40px)' : '100%') : ((orientation === 'vertical') ? 'calc(100% - 35px)' : '100%')),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <div style={{width: `${imageWidth}px`, height: `${imageHeight}px`, zIndex: 2}}>
                                {image !== ''
                                && (
                                    <div 
                                        style={{
                                            width: `${Math.min(imageWidth, imageHeight) / 15}px`, 
                                            height: `${Math.min(imageWidth, imageHeight) / 15}px`, 
                                            transform: `translate(${((pose.x / 100) * imageWidth) - ((Math.min(imageWidth, imageHeight) / 15) / 2)}px, ${((pose.y / 100) * imageHeight) - ((Math.min(imageWidth, imageHeight) / 15) / 2)}px) rotate(${-pose.theta}rad)`,
                                            transformOrigin: 'center',
                                            position: 'absolute',
                                            zIndex: 5
                                        }}
                                    >
                                        <img src={robotIcon} alt="" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                                    </div>
                                )}
                                {path.map((p) => (
                                    <div 
                                        style={{
                                            width: `${Math.min(imageWidth, imageHeight) / 60}px`, 
                                            height: `${Math.min(imageWidth, imageHeight) / 60}px`, 
                                            borderRadius: `${Math.min(imageWidth, imageHeight) / 60}px`, 
                                            transform: `translate(${((p.x / 100) * imageWidth) - ((Math.min(imageWidth, imageHeight) / 60) / 2)}px, ${((p.y / 100) * imageHeight) - ((Math.min(imageWidth, imageHeight) / 60) / 2)}px)`,
                                            background: 'red',
                                            position: 'absolute'
                                        }}
                                    />
                                ))}
                                {annotations.map((a, ind) => (
                                    <>
                                        <div 
                                            style={{
                                                width: `${Math.min(imageWidth, imageHeight) / 20}px`,
                                                height: `${Math.min(imageWidth, imageHeight) / 20}px`,
                                                transform: `translate(${((a.x / 100) * imageWidth) - ((Math.min(imageWidth, imageHeight) / 20) / 2)}px, ${((a.y / 100) * imageHeight) - ((Math.min(imageWidth, imageHeight) / 20))}px)`,
                                                position: 'absolute',
                                                display: 'flex', 
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                pointerEvents: 'auto'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faMapMarkerAlt} style={{color: '#DE162F', width: '100%', height: '100%', cursor: 'pointer'}} onClick={() => this.selectAnnotation(ind)} />
                                        </div>
                                        <div 
                                            style={{
                                                width: '150px',
                                                height: '20px',
                                                position: 'absolute',
                                                transform: `translate(${((a.x / 100) * imageWidth) - (150 / 2)}px, ${((a.y / 100) * imageHeight) - ((Math.min(imageWidth, imageHeight) / 20)) - 20}px)`,
                                                display: 'flex', 
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                color: '#FF9D66',
                                                fontSize: `${Math.min(150 / a.name.length, 20)}px`
                                            }}
                                        >
                                            {a.name}
                                        </div>
                                    </>
                                ))}
                            </div>   
                        </div>
                        {(!closedButtons && !smallButtons) 
                        && (
                            <div 
                                style={{
                                    width: (orientation === 'horizontal') ? ((width > 250) ? '120px' : '30px') : '100%', 
                                    height: (orientation === 'vertical') ? ((height > 250) ? '100px' : '30px') : '100%'
                                }}
                            />
                        )}
                        {(!closedButtons && smallButtons) 
                        && (
                            <div 
                                style={{
                                    width: (orientation === 'horizontal') ? '40px' : '100%', 
                                    height: (orientation === 'horizontal') ? '100%' : '40px'
                                }}
                            />
                        )}
                    </div>
                    <div style={{display: (canvasOpen) ? 'block' : 'none'}}>
                        <div
                            id={`navigationRouteCanvas_${id}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: (orientation === 'horizontal') ? 'row' : 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                                top: '0px',
                                left: '0px',
                                background: 'rgba(255, 255, 255, 1)'
                            }}
                        >
                            {closedButtons 
                            && (
                                <div 
                                    style={{
                                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <CustomCanvas id={`canvas_${id}`} ref={this.canvas} style={{width: `${imageWidth}px`, height: `${imageHeight}px`}} />
                                </div>
                            )}
                            {(!closedButtons && !smallButtons) 
                            && (
                                <div 
                                    style={{
                                        width: (orientation === 'horizontal') ? 'calc(100% - 120px)' : '100%', height: (orientation === 'vertical') ? 'calc(100% - 35px)' : '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <CustomCanvas id={`canvas_${id}`} ref={this.canvas} style={{width: `${imageWidth}px`, height: `${imageHeight}px`}} />
                                </div>
                            )}
                            {(!closedButtons && smallButtons) 
                            && (
                                <div 
                                    style={{
                                        width: (orientation === 'horizontal') ? 'calc(100% - 40px)' : '100%', height: (orientation === 'vertical') ? 'calc(100% - 40px)' : '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <CustomCanvas id={`canvas_${id}`} ref={this.canvas} style={{width: `${imageWidth}px`, height: `${imageHeight}px`}} />
                                </div>
                            )}
                            {(!closedButtons && !smallButtons) 
                            && (
                                <div 
                                    style={{
                                        width: (orientation === 'horizontal') ? ((width > 250) ? '120px' : '30px') : '100%', 
                                        height: (orientation === 'vertical') ? ((height > 250) ? '100px' : '30px') : '100%',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <OrangeButton 
                                        width={(orientation === 'horizontal') ? '100%' : '20%'}
                                        textAlign="center"
                                        fontSize="14px"
                                        onClick={this.closeAnnotate}
                                    >
                                        Cancel
                                    </OrangeButton>
                                </div>
                            )}
                            {(!closedButtons && smallButtons) 
                            && (
                                <div 
                                    style={{
                                        width: (orientation === 'horizontal') ? '40px' : '100%', 
                                        height: (orientation === 'horizontal') ? '100%' : '40px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Tooltip content="Cancel" targetClassName="map-annotation-button">
                                        <FontAwesomeIcon 
                                            icon={faTimesCircle} 
                                            style={{color: '#16335B', width: '30%', cursor: 'pointer'}} 
                                            onClick={this.closeAnnotate}
                                        />
                                    </Tooltip>
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{display: (gotoCanvasOpen) ? 'block' : 'none'}}>
                        <div
                            id={`navigationRouteGotoCanvas_${id}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: (orientation === 'horizontal') ? 'row' : 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                                top: '0px',
                                left: '0px',
                                background: 'rgba(255, 255, 255, 1)'
                            }}
                        >
                            {closedButtons 
                            && (
                                <div 
                                    style={{
                                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <CustomCanvas id={`canvas_${id}`} ref={this.gotoCanvas} style={{width: `${imageWidth}px`, height: `${imageHeight}px`}} />
                                </div>
                            )}
                            {(!closedButtons && !smallButtons) 
                            && (
                                <div 
                                    style={{
                                        width: (orientation === 'horizontal') ? 'calc(100% - 120px)' : '100%', height: (orientation === 'vertical') ? 'calc(100% - 35px)' : '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <CustomCanvas id={`canvas_${id}`} ref={this.gotoCanvas} style={{width: `${imageWidth}px`, height: `${imageHeight}px`}} />
                                </div>
                            )}
                            {(!closedButtons && smallButtons) 
                            && (
                                <div 
                                    style={{
                                        width: (orientation === 'horizontal') ? 'calc(100% - 40px)' : '100%', height: (orientation === 'vertical') ? 'calc(100% - 40px)' : '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <CustomCanvas id={`canvas_${id}`} ref={this.gotoCanvas} style={{width: `${imageWidth}px`, height: `${imageHeight}px`}} />
                                </div>
                            )}
                            {(!closedButtons && !smallButtons) 
                            && (
                                <div 
                                    style={{
                                        width: (orientation === 'horizontal') ? ((width > 250) ? '120px' : '30px') : '100%', 
                                        height: (orientation === 'vertical') ? ((height > 250) ? '100px' : '30px') : '100%',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <OrangeButton 
                                        width={(orientation === 'horizontal') ? '100%' : '20%'}
                                        textAlign="center"
                                        fontSize="14px"
                                        onClick={this.closeGotoCanvas}
                                    >
                                        Cancel
                                    </OrangeButton>
                                </div>
                            )}
                            {(!closedButtons && smallButtons) 
                            && (
                                <div 
                                    style={{
                                        width: (orientation === 'horizontal') ? '40px' : '100%', 
                                        height: (orientation === 'horizontal') ? '100%' : '40px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Tooltip content="Cancel" targetClassName="map-annotation-button">
                                        <FontAwesomeIcon 
                                            icon={faTimesCircle} 
                                            style={{color: '#16335B', width: '30%', cursor: 'pointer'}} 
                                            onClick={this.closeGotoCanvas}
                                        />
                                    </Tooltip>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>,
            <PortalOverflowOverlay key="annotation-name" id="annotation-name" isOpen={annotationNamePopupOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    {`${name} Settings`}
                </FormHeader>
                <FormSubHeader>
                    Annotation Name
                </FormSubHeader>
                <SettingsDiv>
                    <div 
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <InputGroup
                            leftIcon="tag"
                            placeholder="Annotation Name"
                            onChange={this.changeAnnotationName}
                            value={tempAnnotationName}
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
                            onClick={this.cancelAnnotation}
                        >
                            Cancel
                        </BlueBorderButton>
                        <BlueButton
                            id="save"
                            type="button"
                            onClick={this.sendAnnotation}
                        >
                            Annotate
                        </BlueButton>
                    </div>
                </SettingsDiv>
            </PortalOverflowOverlay>,
            <PortalOverflowOverlay key="select-annotation" id="select-annotation" isOpen={selectAnnotationPopupOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    {`${name} Settings`}
                </FormHeader>
                <FormSubHeader>
                    Annotation Selected
                </FormSubHeader>
                <SettingsDiv>
                    <div 
                        style={{
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <RedBorderButton
                            id="cancel"
                            type="button"
                            onClick={() => this.openDeleteAnnotation(this.tempSelectedAnnotation)}
                        >
                            Delete
                        </RedBorderButton>
                        <BlueButton
                            id="save"
                            type="button"
                            onClick={() => this.goToPlace(this.tempSelectedAnnotation)}
                        >
                            Go To Point
                        </BlueButton>
                    </div>
                    <div 
                        style={{
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <BlueBorderButton
                            id="cancel"
                            type="button"
                            onClick={this.cancelSelectAnnotation}
                        >
                            Cancel
                        </BlueBorderButton>
                    </div>
                </SettingsDiv>
            </PortalOverflowOverlay>,
            <Alert key="delete-annotation-alert" style={{background: 'white', color: 'black'}} usePortal cancelButtonText="Cancel" confirmButtonText="Delete" icon="trash" intent="danger" isOpen={deleteAnnotationPopupOpen} onCancel={this.closeDeleteAnnotation} onConfirm={this.deleteAnnotation}>
                <p>
                    Are you sure you want to delete the annotation
                    {this.tempDeleteAnnotation !== null && (<b style={{marginLeft: '5px'}}>{annotations[this.tempDeleteAnnotation].name}</b>)}
                    ?
                </p>
            </Alert>,
            <PortalOverflowOverlay key="image" id="image" isOpen={imagePopupOpen} width="533.33px" height="400px" background="none" borderRadius="10px" padding="0px" marginLeft="auto" marginRight="auto" color="black">
                <div style={{width: '100%', height: '100%', borderRadius: '10px', position: 'relative'}}>
                    <img src={image} alt="" style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px'}} />
                    <div 
                        style={{
                            width: '30px', height: '30px', borderRadius: '30px', position: 'absolute', top: '-15px', right: '-15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#D0D6DE'
                        }}
                    >
                        <FontAwesomeIcon icon={faTimes} style={{color: '#16335B', fontSize: '24px', cursor: 'pointer'}} onClick={this.closeImage} />
                    </div>  
                </div>
            </PortalOverflowOverlay>
        ]);
    }
}

// Returns a JSX element representing an instance of a component. The function takes an object as an argument and uses the properties 
// of the object as props for the returned component.
const createNavigationRoute = ({id, type, initialState, user, owner}) => (
    <NavigationRoute 
        id={id}
        type={type}
        initialState={initialState}
        user={user}
        owner={owner}
    />
);

/*
*
* Default export
*
*/
// The export constant is: 
// createNavigationRoute
export default createNavigationRoute;
