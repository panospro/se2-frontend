/* eslint-disable max-len */

/*
* Importing the necessary modules
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
import GaugeChart from 'react-gauge-chart';
import {map} from 'rxjs/operators';
import {ToasterBottom} from '../../../lib/toaster';
import {findSource} from '../../../api/sources';

const objectPath = require('object-path');
const mqtt = require('mqtt');

class Gauge extends React.Component {
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
            name: props.initialState.name || 'Gauge',
            gaugeValue: 0.5,
            counter: 0,
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
            width: 50,
            originalWidth: 50,
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
        const {variable, minValue, maxValue} = this.state;
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

            const value = objectPath.get(payload, variable);
            const gaugeValue = Math.min(Math.max(((value - minValue) / (maxValue - minValue)), 0), 1);
            this.setState({
                gaugeValue,
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
            
            this.prevTime = -1;
            this.minInterval = -1;
            this.maxInterval = -1;
            this.meanInterval = 0;

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
        let newWidth;
        if (width > 2.2225 * height) {
            newWidth = ((2.2225 * height) / width) * 100;
        } else {
            newWidth = 100;
        }
        this.setState({width: newWidth, originalWidth: width, height});
    }

    // First it is getting some values from this.state, which is an object that contains several pieces of state for the component. These values are then used in the JSX element that
    // is returned, which is a div element with several nested elements inside it. Some of these elements, like EditableText and ProgressBar, are custom or external components and 
    // style it. The timeSpan, minint, meanint and maxint states are used to render a Tooltip component, which is a custom or external component that displays additional information
    // when hovered over. The timeSpanVal, minintVal, meanintVal and maxintVal states are used to control the values of ProgressBar components, which are also custom or external components.
    render() {
        const {spinnerOpen, id, name, gaugeValue, counter, timeSpan, minint, maxint, meanint, timeSpanVal, minintVal, meanintVal, maxintVal, minValue, maxValue, leftColor, rightColor, levels, hideText, unit, width, originalWidth, height} = this.state;

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
                            id={`gaugeDiv_${id}`}
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
                                    <Spinner intent="primary" size={Math.min(originalWidth / 10, height / 2)} />
                                </div>
                            )}
                            <GaugeChart
                                id={`gauge_${id}`}
                                nrOfLevels={levels}
                                percent={gaugeValue}
                                textColor="#16335B"
                                colors={[leftColor, rightColor]}
                                style={{width: `${width}%`}}
                                hideText={hideText}
                                formatTextValue={(value) => `${(((value / 100) * (maxValue - minValue)) + minValue).toFixed(2)}${unit}`}
                            />
                        </div>
                    )}
                </ReactResizeDetector>
            </div>
        );
    }
}

// Takes the arguments id, type, initialState, user and owner and pass them to Gauge. The values are determined by the values of the properties in the object passed to createGauge.
const createGauge = ({id, type, initialState, user, owner}) => (
    <Gauge
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
// createGauge
export default createGauge;
