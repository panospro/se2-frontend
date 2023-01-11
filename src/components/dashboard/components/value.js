/* eslint-disable max-len */

/*
* Importing the necessary modules
*/
import React from 'react';
import {
    EditableText, Tag, Spinner, ProgressBar, Text, Tooltip
} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChartBar} from '@fortawesome/free-solid-svg-icons';
import {map} from 'rxjs/operators';
import {ToasterBottom} from '../../../lib/toaster';
import {findSource} from '../../../api/sources';

const objectPath = require('object-path');
const mqtt = require('mqtt');

class Value extends React.Component {
    // The constructor of the class, that initializes type,state and resize etc.
    constructor(props) {
        super(props);

        this.type = props.type;

        this.state = {
            spinnerOpen: true,
            id: props.id,
            user: props.user,
            owner: props.owner,
            name: props.initialState.name || 'Value',
            displayValue: 50,
            counter: 0,
            source: props.initialState.source || 'Select source',
            topic: props.initialState.topic || '',
            variable: props.initialState.variable || '',
            unit: props.initialState.unit || '%',
            fontSize: 50,
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

     // It is called immediately before the component is unmounted (removed from the DOM) and is used to perform any necessary cleanup before the component is destroyed.
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

     // Displays a received message that is expected to contain an image, sending a request for annotations and updating the state to store the image and 
    // its dimensions before resizing the image and displaying it in a div element.
    messageReceived(payload) {
        const {variable, id} = this.state;
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
            this.setState({
                displayValue: value,
                counter: newCounter,
                timeSpan: `Last interval: ${ts} sec`,
                minint: `Minimum interval: ${this.minInterval} sec`,
                meanint: `Mean interval: ${(this.meanInterval / (newCounter - 1)).toFixed(3)} sec`,
                maxint: `Maximum interval: ${this.maxInterval} sec`,
                timeSpanVal: ts,
                minintVal: this.minInterval,
                meanintVal: (this.meanInterval / (newCounter - 1)).toFixed(3),
                maxintVal: this.maxInterval
            }, () => {
                const height = document.getElementById(`valueDiv_${id}`).offsetHeight;
                const width = document.getElementById(`valueDiv_${id}`).offsetWidth;
                this.resize(width, height);
            });
        } catch {}
    }

    // Connect to stomp source using RxStomp, listen for messages on different topics and handle them accordingly.
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

     // Sets up an MQTT client connection and subscribes to various topics to receive messages which it then handles with specific functions.
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

    // Resize sets the width and height of the image.
    resize(width, height) {
        const {displayValue, unit} = this.state;
        this.setState({
            fontSize: Math.min(height, (width / (String(displayValue).length + unit.length))),
            width,
            height
        });
    }

    // Render value. The render method returns a JSX element, which will be rendered to the page.
    render() {
        const {spinnerOpen, id, name, displayValue, counter, unit, fontSize, width, height, timeSpan, minint, maxint, meanint, timeSpanVal, minintVal, meanintVal, maxintVal} = this.state;

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
                            id={`valueDiv_${id}`}
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
                            {`${displayValue}${unit}`}
                        </div>
                    )}
                </ReactResizeDetector>
            </div>
        );
    }
}

// Returns a JSX element representing an instance of a component. The function takes an object as an argument and uses the properties 
// of the object as props for the returned component.
const createValue = ({id, type, initialState, user, owner}) => (
    <Value
        id={id}
        type={type}
        initialState={initialState}
        user={user}
        owner={owner}
    />
);

// Default export createValue
export default createValue;
