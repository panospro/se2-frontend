/* eslint-disable max-len */

/*
* Importing the necessary modules
*/
import React from 'react';
import {
    EditableText, Tag, Spinner
} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {map} from 'rxjs/operators';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faExpand, faTimes} from '@fortawesome/free-solid-svg-icons';
import {ToasterBottom} from '../../../lib/toaster';
import {findSource} from '../../../api/sources';
import {PortalOverflowOverlay} from '../../../lib/overlays';

const objectPath = require('object-path');
const mqtt = require('mqtt');

class Image extends React.Component {
    // The constructor, initializes takes props as an argument and passes it to the parent class's constructor function through the super function.
    // Then, it is binding the component's instance to several functions, such as changeSpinner, messageReceived, connectStompSource, connectMqttSource, connectToTopic and resize.
    // This is done so that these functions can be called with the correct this value when they are used within the component. Then it is setting several instances,
    // such as interval, rxStomp and mqttClient. These properties are not part of the component's state, but are used to store data that needs to be shared
    // between different methods of the component.
    constructor(props) {
        super(props);

        this.type = props.type;

        this.state = {
            spinnerOpen: true,
            id: props.id,
            user: props.user,
            owner: props.owner,
            name: props.initialState.name || 'Image',
            image: '',
            counter: 0,
            source: props.initialState.source || 'Select source',
            topic: props.initialState.topic || '',
            variable: props.initialState.variable || '',
            width: 50,
            height: 50,
            imageWidth: 50,
            imageHeight: 50,
            imagePopupOpen: false
        };
        this.rxStomp = null;
        this.mqttClient = null;

        this.changeSpinner = this.changeSpinner.bind(this);
        this.messageReceived = this.messageReceived.bind(this);
        this.connectStompSource = this.connectStompSource.bind(this);
        this.connectMqttSource = this.connectMqttSource.bind(this);
        this.connectToTopic = this.connectToTopic.bind(this);
        this.resize = this.resize.bind(this);
        this.openImage = this.openImage.bind(this);
        this.closeImage = this.closeImage.bind(this);
    }

    // Called immediately after the component is mounted and is used to trigger an action or dispatch an event.
    componentDidMount() {
        this.connectToTopic();
    }

    // Checking if the rxStomp and mqttClient properties are not null and if they are not, it is calling the deactivate method on rxStomp and the end method on mqttClient.
    // These methods close the connections that were established when the component was mounted. It is important to clean up resources when a component
    // is unmounted to prevent memory leaks and improve the performance of your application.
    componentWillUnmount() {
        if (this.rxStomp !== null) {
            this.rxStomp.deactivate();
        }
        if (this.mqttClient !== null) {
            this.mqttClient.end();
        }
    }

    // Changes the value of the spinnerOpen state to the
    // given value. It is used to open or close the spinner. 
    changeSpinner(value) {
        this.setState({spinnerOpen: value});
    }
    
    // Called when the component receives a message. It updates several properties in the component's state based on the time span between the current time and the time
    // of the previous message, as well as the minimum, maximum and mean time spans between messages. It also increments a counter for the number of messages received.
    // If there is an error it catches it with an empty catch block to catch any errors that might occur and prevent them from crashing the application.
    messageReceived(payload) {
        const {variable} = this.state;
        try {
            const {counter} = this.state;
            const newCounter = counter + 1;
            const image = objectPath.get(payload, variable);
            this.setState({image: `data:image/jpg;base64,${image}`, counter: newCounter});
        } catch {}
    }

    // Establish a connection to a STOMP message broker. It takes a single source argument, which is an object containing information about the STOMP message broker, such as the URL,
    // login credentials and virtual host. Then create a new RxStomp object and activate the connection. It also sets up a subscription to a topic on the message broker and sets
    // up a receipt handler to be triggered when the initial receipt is received from the message broker. When this happens, the function disables the loading spinner.
    // If there is an error it catches it with an empty catch block to catch any errors that might occur and prevent them from crashing the application.
    connectStompSource(source) {
        const {name, topic} = this.state;
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

            this.rxStomp.watch(`/topic/${topic}`, {receipt: initialReceiptId}).pipe(map((message) => JSON.parse(message.body))).subscribe((payload) => {
                this.messageReceived(payload);
            });
            this.rxStomp.watchForReceipt(initialReceiptId, () => {
                this.changeSpinner(false);
            });
        } catch {}
    }

    // Establish a connection to an MQTT message broker. It takes a single source argument, which is an object containing information about the MQTT message broker, such as the URL 
    // and login credentials. Then create a configuration object and create a new MQTT client using the mqtt.connect function. It then sets up a subscription to a topic on the message
    // broker and a connection event handler that disables the loading spinner when the connection is established. It also sets up an event handler for incoming messages that calls
    // the messageReceived method of the component. If there is an error it catches it with an empty catch block to catch any errors that might occur and prevent them from crashing the application.
    connectMqttSource(source) {
        const {topic} = this.state;
        try {
            const config = {
                username: source.login,
                password: source.passcode
            };

            this.mqttClient = mqtt.connect(source.url, config);
            this.mqttClient.on('connect', () => {
                this.mqttClient.subscribe(`${topic}`, (err) => {
                    if (!err) {
                        this.changeSpinner(false);
                    }
                });
            });

            this.mqttClient.on('message', (__, message) => {
                this.messageReceived(JSON.parse(message.toString()));
            });
        } catch {}
    }

    // Fetches the source for a given topic from the server and then connects to the source using either the STOMP or MQTT protocol, depending on the type of source. If the connection 
    //is not successful, it displays an error message using the ToasterBottom component.
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

    // Takes in two arguments, width and height. The function sets the state of the component to have a width based
    // on the given width and height values and also sets originalWidth and height in the state.
    resize(width, height) {
        const {id} = this.state;
        const img = document.getElementById(`${id}_image`);
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
            imageWidth: w,
            imageHeight: h
        });
    }

    // Updates the component's state by setting the value of the imagePopupOpen property to true.
    openImage() {
        this.setState({imagePopupOpen: true});
    }

    // Updates the component's state by setting the value of the imagePopupOpen property to false.
    closeImage() {
        this.setState({imagePopupOpen: false});
    }

    // First it is getting some values from this.state, which is an object that contains several pieces of state for the component. These values are then used in the JSX element that
    // is returned, which is a div element with several nested elements inside it. Some of these elements, like EditableText and ProgressBar, are custom or external components and 
    // style it. The timeSpan, minint, meanint and maxint states are used to render a Tooltip component, which is a custom or external component that displays additional information
    // when hovered over. The timeSpanVal, minintVal, meanintVal and maxintVal states are used to control the values of ProgressBar components, which are also custom or external components.
    render() {
        const {spinnerOpen, id, name, image, counter, width, height, imageWidth, imageHeight, imagePopupOpen} = this.state;
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
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '2%',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <Tag
                            round
                            intent="primary"
                            style={{
                                background: '#16335b',
                                color: '#888888',
                                fontSize: '13px'
                            }}
                        >
                            {counter}
                        </Tag>
                    </div>
                </div>
                <ReactResizeDetector onResize={this.resize}>
                    {() => (
                        <div
                            id={`imageDiv_${id}`}
                            style={{
                                width: '100%',
                                height: 'calc(100% - 35px)',
                                maxHeight: '100%',
                                marginTop: '10px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
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
                            <img id={`${id}_image`} src={image} alt="" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                            {image !== ''
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
                                        opacity: 0.8
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
                        </div>
                    )}
                </ReactResizeDetector>
            </div>,
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

// Takes the arguments id, type, initialState, user and owner and pass them to Image. The values are determined by the values of the properties in the object passed to createGauge.
const createImage = ({id, type, initialState, user, owner}) => (
    <Image
        id={id}
        type={type}
        initialState={initialState}
        user={user}
        owner={owner}
    />
);

// Default export createImage
export default createImage;
