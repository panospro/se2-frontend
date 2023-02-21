/* eslint-disable max-len */

/*
*
* Importing the necessary modules
* e.g. React, modules from our code,
* external modules and etc.
*
*/ 
import React from 'react';
import {
    EditableText, Tag, Spinner, Tooltip, ProgressBar, Text
} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChartBar} from '@fortawesome/free-solid-svg-icons';
/* eslint-disable import/no-unresolved */
import ReactJson from 'react-json-view';
import {map} from 'rxjs/operators';
import {ToasterBottom} from '../../../lib/toaster';
import {findSource} from '../../../api/sources';

const objectPath = require('object-path');
const mqtt = require('mqtt');

// Takes an input value and returns a boolean indicating whether the value is a non-null object. First checks if the input is an object and
// not null and if so, it returns true. If the input is not an object or is null, the function returns false. If an error occurs returns false.
const isValidJson = (input) => {
    try {
        return (typeof input === 'object' && input !== null);
    } catch {
        return false;
    }
};

class Json extends React.Component {
    // The constructor, initializes takes props as an argument and passes it to the parent class's constructor function through the super function.
    // Then, it is binding the component's instance to several functions.
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
            name: props.initialState.name || 'Json Viewer',
            value: {},
            counter: 0,
            source: props.initialState.source || 'Select source',
            topic: props.initialState.topic || '',
            variable: props.initialState.variable || '',
            fontSize: 14,
            width: 50,
            height: 50
        };
        this.rxStomp = null;
        this.mqttClient = null;

        this.changeSpinner = this.changeSpinner.bind(this);
        this.messageReceived = this.messageReceived.bind(this);
        this.connectStompSource = this.connectStompSource.bind(this);
        this.connectMqttSource = this.connectMqttSource.bind(this);
        this.connectToTopic = this.connectToTopic.bind(this);
        this.resize = this.resize.bind(this);
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
        const {counter} = this.state;
        const newCounter = counter + 1;
        let ts = (new Date() - this.prevTime) / 1000.0;
        if (this.prevTime < 0) {
            ts = '-';
            this.minInterval = 1000000000;
            this.maxInterval = 0;
            this.meanInterval = 0;
        } else {
            if (ts < this.minInterval) {
                this.minInterval = ts;
            }
            if (ts > this.maxInterval) {
                this.maxInterval = ts;
            }
            this.meanInterval += ts;
        }
        this.prevTime = new Date();

        const value = objectPath.get(payload, variable);
        if (isValidJson(value)) {
            this.setState({
                value,
                counter: newCounter,
                timeSpan: `Last interval: ${ts} sec`,
                minint: `Minimum interval: ${this.minInterval} sec`,
                meanint: `Mean interval: ${(this.meanInterval / (newCounter - 1)).toFixed(3)} sec`,
                maxint: `Maximum interval: ${this.maxInterval} sec`,
                timeSpanVal: ts,
                minintVal: this.minInterval,
                meanintVal: (this.meanInterval / (newCounter - 1)).toFixed(3),
                maxintVal: this.maxInterval
            });
        } else {
            this.setState({
                counter: newCounter,
                timeSpan: `Last interval: ${ts} sec`,
                minint: `Minimum interval: ${this.minInterval} sec`,
                meanint: `Mean interval: ${(this.meanInterval / (newCounter - 1)).toFixed(3)} sec`,
                maxint: `Maximum interval: ${this.maxInterval} sec`,
                timeSpanVal: ts,
                minintVal: this.minInterval,
                meanintVal: (this.meanInterval / (newCounter - 1)).toFixed(3),
                maxintVal: this.maxInterval
            });
        }
    }

    // Establish a connection to a STOMP message broker. It takes a single source argument, which is an object containing information about the STOMP message broker, such as the URL,
    // login credentials and virtual host. Then create a new RxStomp object and activate the connection. It also sets up a subscription to a topic on the message broker and sets
    // up a receipt handler to be triggered when the initial receipt is received from the message broker. When this happens, the function disables the loading spinner.
    // If there is an error it catches it with an empty catch block to catch any errors that might occur and prevent them from crashing the application.
    connectStompSource(source) {
        const {name, topic} = this.state;
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

        this.prevTime = -1;
        this.minInterval = -1;
        this.maxInterval = -1;
        this.meanInterval = 0;

        this.rxStomp.watch(`/topic/${topic}`, {receipt: initialReceiptId}).pipe(map((message) => JSON.parse(message.body))).subscribe((payload) => {
            this.messageReceived(payload);
        });
        this.rxStomp.watchForReceipt(initialReceiptId, () => {
            this.changeSpinner(false);
        });
    }

    // Establish a connection to an MQTT message broker. It takes a single source argument, which is an object containing information about the MQTT message broker, such as the URL 
    // and login credentials. Then create a configuration object and create a new MQTT client using the mqtt.connect function. It then sets up a subscription to a topic on the message
    // broker and a connection event handler that disables the loading spinner when the connection is established. It also sets up an event handler for incoming messages that calls
    // the messageReceived method of the component. If there is an error it catches it with an empty catch block to catch any errors that might occur and prevent them from crashing the application.
    connectMqttSource(source) {
        const {topic} = this.state;
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
        
        this.prevTime = -1;
        this.minInterval = -1;
        this.maxInterval = -1;
        this.meanInterval = 0;

        this.mqttClient.on('message', (__, message) => {
            this.messageReceived(JSON.parse(message.toString()));
        });
    }

    // Fetches the source for a given topic from the server and then connects to the source using either the STOMP or MQTT protocol, depending on the type of source. If the connection 
    // is not successful, it displays an error message using the ToasterBottom component.
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

    // Handling resizing of a UI element, having width and height as arguments, it adjusts font sizes and state properties based on the new width and height values. If the width is
    // less than 300, it sets the fontSize to 12 if the width is also <200 it sets it to 10. If the hight is less than 200, it sets fontSize 12.
    // It also sets state properties that determine whether certain UI elements should be displayed, based on the width and height of the element.
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
        this.setState({
            fontSize,
            width,
            height
        });
    }

    // It starts by getting several variables from state. It then returns an array containing a single JSX element, which is a styled div element with several nested children.
    // These children include another div with a nested EditableText component and a Tag component, a styled div with an id and a class name that changes based on the value of
    // buttonsAlign in state and several CustomButton components that are mapped over the texts array in state. Used to display a popover with some content when
    // the user interacts with it, specifically when they hover over it. The content of the popover is a series of progress bars, each accompanied by some text.
    // The progress bars seem to represent some values (timeSpanVal, minintVal, meanintVal and maxintVal) as proportions of a maximum value (maxintVal).
    // The text displayed with each progress bar appears to be labels for the values (timeSpan, minint, meanint and maxint).
    // Contains a FontAwesome icon and a counter value. The spinner is shown when the spinnerOpen prop is true and it is overlaid on top of the content in the div
    // element with an ID of jsonDiv_{id}. There is also a component being used to detect when the size of the div element with the ID
    // jsonDiv_{id} changes and a callback function is being passed to the onResize prop that is called when this happens. The div element with the ID 
    // jsonDiv_{id} has its fontSize style set to fontSize pixels and the width and height styles are set to 100% and calc(100% - 35px), respectively. 
    // The spinner has a size prop set to the minimum of width / 10 and height / 2.
    render() {
        const {spinnerOpen, id, name, value, counter, timeSpan, minint, maxint, meanint, timeSpanVal, minintVal, meanintVal, maxintVal, fontSize, width, height} = this.state;

        return (
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
                        <Tooltip
                            popoverClassName="item-info-tooltip"
                            content={(
                                <div>
                                    <div>
                                        <div>
                                            <Text>{timeSpan}</Text>
                                            <ProgressBar
                                                intent="primary"
                                                animate={false}
                                                stripes={false}
                                                value={timeSpanVal / maxintVal}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <Text>{minint}</Text>
                                            <ProgressBar
                                                intent="success"
                                                animate={false}
                                                stripes={false}
                                                value={minintVal / maxintVal}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <Text>{meanint}</Text>
                                            <ProgressBar
                                                intent="warning"
                                                animate={false}
                                                stripes={false}
                                                value={meanintVal / maxintVal}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <Text>{maxint}</Text>
                                            <ProgressBar
                                                intent="danger"
                                                animate={false}
                                                stripes={false}
                                                value={maxintVal / maxintVal}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            interactionKind="hover"
                        >
                            <Tag
                                round
                                intent="primary"
                                style={{
                                    background: '#16335B',
                                    color: '#aaaaaa',
                                    fontSize: '13px'
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faChartBar}
                                    style={{
                                        color: '#aaaaaa',
                                        paddingRight: '4px',
                                        fontSize: '13px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={this.filterMessages}
                                />
                                {counter}
                            </Tag>
                        </Tooltip>
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
                                fontSize: `${fontSize}px`,
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
                            <ReactJson
                                src={value}
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
            </div>
        );
    }
}

// Takes an object as an argument with the properties id, type, initialState, user and owner to customize the appearance or behavior of the button or group of buttons.
// The function returns a JSX element called Json, with the properties id, type, initialState, user and owner being passed to it. 
const createJson = ({id, type, initialState, user, owner}) => (
    <Json
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
// createJson
export default createJson;
