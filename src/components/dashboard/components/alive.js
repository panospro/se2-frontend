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
import {map} from 'rxjs/operators';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChartBar} from '@fortawesome/free-solid-svg-icons';
import {ToasterBottom} from '../../../lib/toaster';
import {findSource} from '../../../api/sources';

const mqtt = require('mqtt');

// Takes in a date object and returns a formatted string representation of that date. First gets the day, month and year values from the date object and stores them
// in separate variables. It then gets the hour, minute and second values and stores them in separate variables as well.
// Then checks the length of each of these values and if the length is 1, it adds a leading zero to the value. For example, if the month is 9, the value will be changed to 09.
// Finally, the function returns a string that is formatted as "dd/mm/yyyy, hh:mm:ss", using the day, month, year, hour, minute and second values that were extracted from the date object.
const formatDate = (date) => {
    const day = ((String(date.getDate())).length === 1) ? `0${String(date.getDate())}` : String(date.getDate());
    const month = ((String(date.getMonth() + 1)).length === 1) ? `0${String(date.getMonth() + 1)}` : String(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = ((String(date.getHours())).length === 1) ? `0${String(date.getHours())}` : String(date.getHours());
    const minutes = ((String(date.getMinutes())).length === 1) ? `0${String(date.getMinutes())}` : String(date.getMinutes());
    const seconds = ((String(date.getSeconds())).length === 1) ? `0${String(date.getSeconds())}` : String(date.getSeconds());

    return (`${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`);
};
 
class Alive extends React.Component {
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
            name: props.initialState.name || 'Value',
            lastSend: null,
            active: false,
            remaining: 0,
            counter: 0,
            minint: 0,
            maxint: 0,
            meanint: 0,
            timeSpan: 0,
            source: props.initialState.source || 'Select source',
            topic: props.initialState.topic || '',
            timeout: props.initialState.timeout || 1000,
            lastSendOpen: true,
            activeText: true,
            smallIcon: false,
            fontSize: 16,
            fontSize2: 16,
            width: 50,
            height: 50
        };
        this.interval = null;
        this.rxStomp = null;
        this.mqttClient = null;

        this.changeSpinner = this.changeSpinner.bind(this);
        this.messageReceived = this.messageReceived.bind(this);
        this.connectStompSource = this.connectStompSource.bind(this);
        this.connectMqttSource = this.connectMqttSource.bind(this);
        this.connectToTopic = this.connectToTopic.bind(this);
        this.resize = this.resize.bind(this);
    }

    // Setting up an interval that runs every 200 milliseconds and within 
    // this interval, it is updating the component's state based on the value 
    // of the lastSend and timeout properties.
    // It is also calling the connectToTopic function. Then the component 
    // will re-render itself to reflect the changes in the state.
    componentDidMount() {
        this.interval = setInterval(() => {
            const {lastSend, timeout} = this.state;
            const dateNow = new Date();
            if (lastSend === null) {
                this.setState({
                    active: false,
                    remaining: ''
                });
            } else {
                let rem = '';
                if (dateNow.getTime() - lastSend.getTime() <= timeout) {
                    rem = ((timeout - (dateNow.getTime() - lastSend.getTime())) / 1000.0).toFixed(0);
                    rem = `${rem} sec to timeout`;
                }
                this.setState({
                    active: (dateNow.getTime() - lastSend.getTime() <= timeout),
                    remaining: rem
                });
            }
        }, 200);
        this.connectToTopic();
    }

    // Checking if the rxStomp and mqttClient properties are not null and 
    // if they are not, it is calling the deactivate method on rxStomp and 
    // the end method on mqttClient.
    // These methods close the connections that were established when the 
    // component was mounted. It is important to clean up resources when a component
    // is unmounted to prevent memory leaks and improve the performance of 
    // your application.
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

    // Called when the component receives a message. It updates several in the component's state based on the time span between the current time and the time
    // of the previous message, as well as the minimum, maximum and mean time spans between messages. It also increments a counter for the number of messages received.
    // If there is an error it catches it with an empty catch block to catch any errors that might occur and prevent them from crashing the application.
    messageReceived() {
        try {
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

            this.setState({
                lastSend: new Date(),
                timeSpan: `Last interval: ${ts} sec`,
                minint: `Minimum interval: ${this.minInterval} sec`,
                meanint: `Mean interval: ${(this.meanInterval / (newCounter - 1)).toFixed(3)} sec`,
                maxint: `Maximum interval: ${this.maxInterval} sec`,
                timeSpanVal: ts,
                minintVal: this.minInterval,
                meanintVal: (this.meanInterval / (newCounter - 1)).toFixed(3),
                maxintVal: this.maxInterval,
                counter: newCounter
            });
        } catch {}
    }

    // Establish a connection to a STOMP message broker. It takes a single 
    // source argument, which is an object containing information about the 
    // STOMP message broker, such as the URL, login credentials and virtual host. 
    // Then create a new RxStomp object and activate the connection. It also sets 
    // up a subscription to a topic on the message broker and sets
    // up a receipt handler to be triggered when the initial receipt is received 
    // from the message broker. When this happens, the function disables the loading 
    // spinner. If there is an error it catches it with an empty catch block 
    // to catch any errors that might occur and prevent them from crashing the 
    // application.
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

            this.prevTime = -1;
            this.minInterval = -1;
            this.maxInterval = -1;
            this.meanInterval = 0;

            this.rxStomp.watch(`/topic/${topic}`, {receipt: initialReceiptId}).pipe(map((message) => JSON.parse(message.body))).subscribe(() => {
                this.messageReceived();
            });
            this.rxStomp.watchForReceipt(initialReceiptId, () => {
                this.changeSpinner(false);
            });
        } catch {}
    }

    // Establish a connection to an MQTT message broker. It takes a single 
    // source argument, which is an object containing information about the 
    // MQTT message broker, such as the URL and login credentials. Then 
    // create a configuration object and create a new MQTT client using 
    // the mqtt.connect function. It then sets up a subscription to a topic 
    // on the message broker and a connection event handler that disables 
    // the loading spinner when the connection is established. It also 
    // sets up an event handler for incoming messages that calls
    // the messageReceived method of the component. If there is an error 
    // it catches it with an empty catch block to catch any errors that 
    // might occur and prevent them from crashing the application.
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
            
            this.prevTime = -1;
            this.minInterval = -1;
            this.maxInterval = -1;
            this.meanInterval = 0;

            this.mqttClient.on('message', () => {
                this.messageReceived();
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

    // Handling resizing of a UI element, having width and height as arguments, it adjusts font sizes and state properties based on the new width and height values. If the width is
    // less than 200, it sets the fontSize and fontSize2 state properties to 14 and 13, respectively. If the width is greater than 300, it sets fontSize and fontSize2 to 24 and 16,
    // respectively. It also sets state properties that determine whether certain UI elements should be displayed, based on the width and height of the element.
    resize(width, height) {
        let fontSize = 16;
        let fontSize2 = 16;
        if (width < 200) {
            fontSize = 14;
            fontSize2 = 13;
        }
        if (width > 300) {
            fontSize = 24;
            fontSize2 = 16;
        }
        this.setState({
            lastSendOpen: (height > 135 && width > 100),
            activeText: (height > 40 && width > 90),
            smallIcon: (height < 40 || width < 40),
            fontSize,
            fontSize2,
            width,
            height
        });
    }

    // First it is getting some values from this.state, which is an 
    // object that contains several pieces of state for the component. 
    // These values are then used in the JSX element that is returned,
    // which is a div element with several nested elements inside it. 
    // Some of these elements, like EditableText and ProgressBar, are 
    // custom or external components and style it. The timeSpan, minint, 
    // meanint and maxint states are used to render a Tooltip component, 
    // which is a custom or external component that displays additional information
    // when hovered over. The timeSpanVal, minintVal, meanintVal and
    // maxintVal states are used to control the values of ProgressBar, 
    // which are also custom or external components.
    render() {
        const {spinnerOpen, id, name, lastSend, counter, timeSpan, minint, maxint, meanint, timeSpanVal, minintVal, meanintVal, maxintVal, active, lastSendOpen, activeText, smallIcon, fontSize, fontSize2, width, height, remaining} = this.state;
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
                            id={`aliveDiv_${id}`}
                            style={{
                                width: '100%',
                                height: 'calc(100% - 35px)',
                                maxHeight: '100%',
                                marginTop: '10px',
                                display: 'flex',
                                flexDirection: 'column',
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
                            <div
                                style={{
                                    width: '100%',
                                    height: (lastSendOpen) ? '50%' : '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderBottom: (lastSendOpen) ? '2px solid #D0D6DE' : ''
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        maxWidth: '200px',
                                        maxHeight: '50px',
                                        color: '#16335B',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '10px',
                                        fontSize: '13px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${(smallIcon) ? fontSize : fontSize + 10}px`,
                                            height: `${(smallIcon) ? fontSize : fontSize + 10}px`,
                                            borderRadius: `${fontSize + 10}px`,
                                            background: (active) ? '#7ABF43' : '#DE162F',
                                            marginRight: (activeText) ? '10px' : '0px',
                                            filter: (active) ? 'blur(2px)' : '',
                                            animation: (active) ? 'blink 3s linear infinite' : ''
                                        }}
                                    />
                                    {activeText && ((active) ? 'ACTIVE' : 'INACTIVE')}
                                </div>
                            </div>
                            {lastSendOpen
                            && (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '50%',
                                        maxHeight: '100px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderBottom: '2px solid #D0D6DE',
                                        padding: '10px',
                                        flexWrap: 'wrap',
                                        fontSize: fontSize2
                                    }}
                                >
                                    <div
                                        style={{
                                            color: '#16335B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '10px',
                                            fontSize: '13px'
                                        }}
                                    >
                                        Last:
                                    </div>
                                    <div
                                        style={{
                                            color: '#FF9D66',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '13px',
                                        }}
                                    >
                                        {(lastSend !== null) ? formatDate(lastSend) : 'No message'}
                                    </div>
                                    <div
                                        style={{
                                            color: '#aaaaaa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            // fontWeight: 'bold',
                                            fontSize: '11px',
                                        }}
                                    >
                                        {remaining}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ReactResizeDetector>
            </div>
        );
    }
}

// Takes the arguments id, type, initialState, user and owner and
// pass them to Alive. The values are determined by the values of the p
// roperties in the object passed to createAlive.
const createAlive = ({id, type, initialState, user, owner}) => (
    <Alive
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
// createAlive
export default createAlive;
