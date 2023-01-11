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
import {
    EditableText, Spinner, Tag
} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {map} from 'rxjs/operators';
import {
    XYPlot, LineSeries, HorizontalGridLines, VerticalGridLines, XAxis, YAxis, DiscreteColorLegend, Highlight, Borders, VerticalBarSeries
} from 'react-vis';
import {ToasterBottom} from '../../../lib/toaster';
import {findSource} from '../../../api/sources';

import '../../../../node_modules/react-vis/dist/style.css';

const objectPath = require('object-path');
const mqtt = require('mqtt');

// Takes a date as a string or number and returns it as a string in the
// format "hh:mm:ss". It converts the input into a Date object, retrieves 
// the hour, minute and second values and pads single-digit values with
// a leading zero before returning the formatted string.
const formatDate = (dateM) => {
    const date = new Date(dateM);
    const hours = ((String(date.getHours())).length === 1) ? `0${String(date.getHours())}` : String(date.getHours());
    const minutes = ((String(date.getMinutes())).length === 1) ? `0${String(date.getMinutes())}` : String(date.getMinutes());
    const seconds = ((String(date.getSeconds())).length === 1) ? `0${String(date.getSeconds())}` : String(date.getSeconds());
    return (`${hours}:${minutes}:${seconds}`);
};

class Plot extends React.Component {
    // It initializes the component with properties from the props 
    // object passed to it and sets the initial state of the component 
    // using an object that includes several class properties. Ιt also
    // binds the values of several class methods to the current instance 
    // of the component.
    constructor(props) {
        super(props);

        this.type = props.type;

        let initialNames; 
        let initialTypes = [];
        let initialTopics = [];
        let initialVariables = [];
        let initialColors = [];
        let initialSmooths = [];
        let values = [];
        if ('names' in props.initialState) {
            initialNames = props.initialState.names;
            for (let i = 0; i < initialNames.length; i += 1) {
                initialTypes.push('line');
                initialTopics.push('');
                initialVariables.push('');
                initialColors.push('#FF9D66');
                initialSmooths.push(false);
                values.push([]);
            }
        } else {
            initialNames = []; 
            initialTypes = [];
            initialTopics = [];
            initialVariables = [];
            initialColors = [];
            initialSmooths = [];
            values = [];
        }

        this.state = {
            spinnerOpen: true,
            id: props.id,
            user: props.user,
            owner: props.owner,
            name: props.initialState.name || 'Plot Viewer',
            values,
            counter: 0,
            source: props.initialState.source || 'Select source',
            verticalGrid: props.initialState.verticalGrid || true,
            horizontalGrid: props.initialState.horizontalGrid || true,
            xAxis: props.initialState.xAxis || true,
            yAxis: props.initialState.yAxis || true,
            legend: props.initialState.legend || true,
            legendPosition: props.initialState.legendPosition || 'topRight',
            maxValues: props.initialState.maxValues || -1,
            names: props.initialState.names || initialNames,
            types: props.initialState.types || initialTypes,
            topics: props.initialState.topics || initialTopics,
            variables: props.initialState.variables || initialVariables,
            colors: props.initialState.colors || initialColors,
            smooths: props.initialState.smooths || initialSmooths,
            width: 50,
            height: 50,
            lastDrawLocation: null
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

    // Called immediately after the component is mounted and is used
    // to trigger an action or dispatch an event.
    componentDidMount() {
        this.connectToTopic();
    }

    // It is called immediately before the component is unmounted
    // (removed from the DOM) and is used to perform any necessary
    // cleanup before the component is destroyed.
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

    // Displays a received message that is expected to contain 
    // an image, sending a request for annotations and updating 
    // the state to store the image and its dimensions before resizing
    // the image and displaying it in a div element.
    messageReceived(payload, ind) {
        const {variables, maxValues} = this.state;
        try {
            const {counter, values} = this.state;
            const newCounter = counter + 1;
            const value = objectPath.get(payload, variables[ind]);
            values[ind].push({x: (new Date()).getTime(), y: value});
            if (values[ind].length > maxValues && maxValues !== -1) {
                values[ind].shift();
            }
            this.setState({values, counter: newCounter});
        } catch {}
    }

    // Connect to stomp source using RxStomp, listen for messages 
    // on different topics and handle them accordingly.
    connectStompSource(source) {
        const {name, topics} = this.state;
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

            topics.forEach((t, ind) => {
                this.rxStomp.watch(`/topic/${t}`, {receipt: initialReceiptId}).pipe(map((message) => JSON.parse(message.body))).subscribe((payload) => {
                    this.messageReceived(payload, ind);
                });
            });
            this.rxStomp.watchForReceipt(initialReceiptId, () => {
                this.changeSpinner(false);
            });
        } catch {}
    }

    // Sets up an MQTT client connection and subscribes to various 
    // topics to receive messages which it then handles with specific functions.
    connectMqttSource(source) {
        const {topics} = this.state;
        try {
            const config = {
                username: source.login,
                password: source.passcode
            };

            this.mqttClient = mqtt.connect(source.url, config);
            this.mqttClient.on('connect', () => {
                topics.forEach((t) => {
                    this.mqttClient.subscribe(`${t}`, (err) => {
                        if (!err) {
                            this.changeSpinner(false);
                        }
                    });
                });
            });

            this.mqttClient.on('message', (topic, message) => {
                topics.forEach((t, ind) => {
                    if (t === topic) {
                        this.messageReceived(JSON.parse(message.toString()), ind);
                    }
                });
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

    // Resize the state
    resize(width, height) {
        this.setState({width, height});
    }

    // Renders plot as a graphical component containing a xy-plot with line
    // and bar series. It also contains a name, a tag with a counter,
    // a legend, x and y axes and a Highlight. It also listens to the
    // resize event and also stores the location of the last draw in 
    // the state. The legend and the plots are iterated over the names,
    // types, colors and smooths arrays and stored in the legendItems and 
    // plots variables respectively. The xTickValues are stored in xTickValues 
    // array with the values sorted in ascending order. The compoent also
    // contains styling for the name, tag and the legend. The render
    // function returns the graphical with all the elements mentioned above.
    render() {
        const {spinnerOpen, id, name, values, counter, verticalGrid, horizontalGrid, xAxis, yAxis, legend, legendPosition, names, types, colors, smooths, width, height, lastDrawLocation} = this.state;

        const legendItems = [];
        names.forEach((n, ind) => {
            legendItems.push({title: n, color: colors[ind]});
        });

        const xTickValues = [];
        values.forEach((pV) => {
            pV.forEach((v) => {
                xTickValues.push(v.x);
            });
        });

        const plots = [];
        names.forEach((__n, ind) => {
            const data = values[ind];
            if (data.length !== 0) {
                data.sort((a, b) => (a.x - b.x));
            }
            switch (types[ind]) {
            case 'line':
                plots.push(<LineSeries data={data} color={colors[ind]} animation="gentle" curve={smooths[ind] ? 'curveMonotoneX' : ''} />);
                break;
            case 'bar':
                plots.push(<VerticalBarSeries data={data} color={colors[ind]} animation="gentle" barWidth={0.2} />);
                break;
            default:
            }
        });

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
                            id={`plotDiv_${id}`}
                            style={{
                                width: '100%',
                                height: 'calc(100% - 35px)',
                                marginTop: '10px',
                                overflowY: 'auto',
                                position: 'relative'
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
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
                            <XYPlot
                                height={height}
                                width={width}
                                margin={{bottom: 60}}
                                xDomain={
                                    lastDrawLocation && [
                                        lastDrawLocation.left,
                                        lastDrawLocation.right
                                    ]
                                }
                                yDomain={
                                    lastDrawLocation && [
                                        lastDrawLocation.bottom,
                                        lastDrawLocation.top
                                    ]
                                }
                            >
                                {verticalGrid && <VerticalGridLines />}
                                {horizontalGrid && <HorizontalGridLines />}
                                {plots}
                                <Borders style={{
                                    bottom: {fill: '#fff'},
                                    left: {fill: '#fff'},
                                    right: {fill: '#fff'},
                                    top: {fill: '#fff'}
                                }}
                                />
                                {xAxis && <XAxis tickFormat={(v) => formatDate(v)} tickLabelAngle={-45} tickValues={xTickValues} />}
                                {yAxis && <YAxis />}
                                {legend
                                && (
                                    <DiscreteColorLegend
                                        items={legendItems}
                                        style={{
                                            position: 'absolute',
                                            top: ((legendPosition === 'topRight') || (legendPosition === 'topLeft')) ? '0px' : '',
                                            bottom: ((legendPosition === 'bottomRight') || (legendPosition === 'bottomLeft')) ? '0px' : '',
                                            left: ((legendPosition === 'topLeft') || (legendPosition === 'bottomLeft')) ? '0px' : '',
                                            right: ((legendPosition === 'topRight') || (legendPosition === 'bottomRight')) ? '0px' : ''
                                        }}
                                    />
                                )}
                                <Highlight
                                    onBrushEnd={(area) => this.setState({lastDrawLocation: area})}
                                    onDrag={(area) => {
                                        this.setState({
                                            lastDrawLocation: {
                                                bottom: lastDrawLocation.bottom + (area.top - area.bottom),
                                                left: lastDrawLocation.left - (area.right - area.left),
                                                right: lastDrawLocation.right - (area.right - area.left),
                                                top: lastDrawLocation.top + (area.top - area.bottom)
                                            }
                                        });
                                    }}
                                />
                            </XYPlot>
                        </div>
                    )}
                </ReactResizeDetector>
            </div>
        );
    }
}

// Returns a JSX element representing an instance of a component. 
// The function takes an object as an argument and uses the properties 
// of the object as props for the returned component.
const createPlot = ({id, type, initialState, user, owner}) => (
    <Plot
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
// createPlot
export default createPlot;
