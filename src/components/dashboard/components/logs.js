/* eslint-disable max-len */
import React from 'react';
import {
    Drawer,
    EditableText, InputGroup, Menu, MenuItem, Popover, Position, Tag, Tooltip, Spinner, ProgressBar, Text
} from '@blueprintjs/core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faBars, faChevronUp, faEraser, faFileExport, faFilter, faTimes, faChartBar
} from '@fortawesome/free-solid-svg-icons';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {map} from 'rxjs/operators';
import {ToasterBottom} from '../../../lib/toaster';
import {findSource} from '../../../api/sources';

const objectPath = require('object-path');
const mqtt = require('mqtt');
const fileDownload = require('js-file-download');

const formatDate = (date) => {
    const day = ((String(date.getDate())).length === 1) ? `0${String(date.getDate())}` : String(date.getDate());
    const month = ((String(date.getMonth() + 1)).length === 1) ? `0${String(date.getMonth() + 1)}` : String(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = ((String(date.getHours())).length === 1) ? `0${String(date.getHours())}` : String(date.getHours());
    const minutes = ((String(date.getMinutes())).length === 1) ? `0${String(date.getMinutes())}` : String(date.getMinutes());

    return (`${day}/${month}/${year}, ${hours}:${minutes}`);
};

class Logs extends React.Component {
    constructor(props) {
        super(props);

        this.type = props.type;

        this.state = {
            spinnerOpen: true,
            id: props.id,
            user: props.user,
            owner: props.owner,
            name: props.initialState.name || 'Logs',
            logs: [],
            counter: 0,
            source: props.initialState.source || 'Select source',
            topic: props.initialState.topic || '',
            variable: props.initialState.variable || '',
            maxMessages: props.initialState.maxMessages || -1,
            colorKeys: props.initialState.colorKeys || [],
            colorValues: props.initialState.colorValues || [],
            filter: '',
            filterDrawerOpen: false,
            width: 50,
            height: 50
        };
        this.rxStomp = null;
        this.mqttClient = null;

        this.changeSpinner = this.changeSpinner.bind(this);
        this.resize = this.resize.bind(this);
        this.messageReceived = this.messageReceived.bind(this);
        this.connectStompSource = this.connectStompSource.bind(this);
        this.connectMqttSource = this.connectMqttSource.bind(this);
        this.connectToTopic = this.connectToTopic.bind(this);
        this.filterMessages = this.filterMessages.bind(this);
        this.clearMessages = this.clearMessages.bind(this);
        this.exportMessages = this.exportMessages.bind(this);
        this.changeFilter = this.changeFilter.bind(this);
        this.removeFilter = this.removeFilter.bind(this);
        this.closeFilter = this.closeFilter.bind(this);
    }

    componentDidMount() {
        this.connectToTopic();
    }

    componentWillUnmount() {
        if (this.rxStomp !== null) {
            this.rxStomp.deactivate();
        }
        if (this.mqttClient !== null) {
            this.mqttClient.end();
        }
    }

    changeSpinner(value) {
        this.setState({spinnerOpen: value});
    }

    messageReceived(payload) {
        const {variable, maxMessages, id} = this.state;
        try {
            const {counter, logs} = this.state;
            const messagesList = document.getElementById(`logsDiv_${id}`);
            const toBottom = Math.abs((messagesList.scrollTop + messagesList.clientHeight) - (messagesList.scrollHeight)) < 5;

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
            logs.push({message: JSON.stringify(value), date: new Date()});
            if (logs.length > maxMessages && maxMessages !== -1) {
                logs.shift();
            }
            this.setState({
                logs,
                counter: newCounter,
                timeSpan: `Last interval: ${ts} sec`,
                minint: `Minimum interval: ${this.minInterval} sec`,
                meanint: `Mean interval: ${(this.meanInterval / (newCounter - 1)).toFixed(3)} sec`,
                maxint: `Maximum interval: ${this.maxInterval} sec`,
                timeSpanVal: ts,
                minintVal: this.minInterval,
                meanintVal: (this.meanInterval / (newCounter - 1)).toFixed(3),
                maxintVal: this.maxInterval,
            }, () => {
                if (toBottom) {
                    messagesList.scrollTop = messagesList.scrollHeight;
                }
            });
        } catch {}
    }

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

    filterMessages() {
        this.setState({filterDrawerOpen: true});
    }

    clearMessages() {
        this.setState({
            logs: [],
            counter: 0
        });
    }

    exportMessages() {
        const {logs} = this.state;
        let allLogs = '';

        logs.forEach((l, ind) => {
            if (ind === 0) {
                allLogs = `${formatDate(l.date)}:\n${l.message}`;
            } else {
                allLogs = `${allLogs}\n\n${formatDate(l.date)}:\n${l.message}`;
            }
        });
        fileDownload(allLogs, 'logs.txt');
    }

    changeFilter(event) {
        this.setState({filter: event.target.value});
    }

    removeFilter() {
        this.setState({filter: ''});
    }

    closeFilter() {
        this.setState({filterDrawerOpen: false});
    }

    resize(width, height) {
        this.setState({width, height});
    }

    render() {
        const {spinnerOpen, id, name, logs, counter, timeSpan, minint, maxint, meanint, timeSpanVal, minintVal, meanintVal, maxintVal, colorKeys, colorValues, filter, filterDrawerOpen, width, height} = this.state;

        const filteredLogs = [];
        logs.forEach((l) => {
            try {
                if (l.message.includes(filter) || (new RegExp(filter)).test(l.message)) {
                    let color = '#16335B';
                    for (let i = colorKeys.length - 1; i >= 0; i -= 1) {
                        if (l.message.includes(colorKeys[i]) || (new RegExp(colorKeys[i])).test(l.message)) {
                            color = colorValues[i];
                        }
                    }
                    filteredLogs.push({message: l.message, date: l.date, color});
                }
            } catch {}
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
                    {(width > 180 && !spinnerOpen)
                    && (
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
                            <Tooltip content="Filter Messages">
                                <FontAwesomeIcon
                                    icon={faFilter}
                                    style={{color: 'white', cursor: 'pointer'}}
                                    onClick={this.filterMessages}
                                />
                            </Tooltip>
                            <Tooltip content="Clear Messages">
                                <FontAwesomeIcon
                                    icon={faEraser}
                                    style={{color: 'white', cursor: 'pointer', marginLeft: '5px'}}
                                    onClick={this.clearMessages}
                                />
                            </Tooltip>
                            <Tooltip content="Export to txt">
                                <FontAwesomeIcon
                                    icon={faFileExport}
                                    style={{color: 'white', cursor: 'pointer', marginLeft: '5px'}}
                                    onClick={this.exportMessages}
                                />
                            </Tooltip>
                        </div>
                    )}
                    {(width < 180 && !spinnerOpen)
                    && (
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
                            <Popover popoverClassName="custom-popover">
                                <FontAwesomeIcon icon={faBars} style={{color: 'white', cursor: 'pointer'}} />
                                <Menu>
                                    <MenuItem text="Filter Messages" onClick={this.filterMessages} />
                                    <MenuItem text="Clear Messages" onClick={this.clearMessages} />
                                    <MenuItem text="Export to txt" onClick={this.exportMessages} />
                                </Menu>
                            </Popover>
                        </div>
                    )}
                    {filter !== ''
                    && (
                        <div
                            style={{
                                height: '100%',
                                position: 'absolute',
                                top: '0px',
                                left: 'calc(2% + 25px)',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Tooltip
                                popoverClassName="item-info-tooltip"
                                content="Clear filter"
                                interactionKind="hover"
                            >
                                <FontAwesomeIcon icon={faFilter} style={{color: '#FF9D66', cursor: 'pointer'}} onClick={this.removeFilter} />
                            </Tooltip>
                        </div>
                    )}
                </div>
                <Drawer
                    isOpen={filterDrawerOpen}
                    position={Position.TOP}
                    usePortal={false}
                    hasBackdrop={false}
                    canEscapeKeyClose
                    transitionDuration={100}
                    style={{
                        width: '98%', height: '35px', top: 'calc(1% + 25px)', marginLeft: 'auto', marginRight: 'auto'
                    }}
                >
                    <div style={{width: '100%', height: '100%', padding: '5px', display: 'flex'}}>
                        <div style={{width: 'calc(100% - 60px)', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <InputGroup
                                leftIcon="search"
                                placeholder="Filter"
                                onChange={this.changeFilter}
                                defaultValue={filter}
                                fill
                            />
                        </div>
                        <div
                            style={{
                                width: '25px', height: '100%', marginLeft: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <FontAwesomeIcon icon={faTimes} style={{color: '#16335B', fontSize: '16px', cursor: 'pointer'}} onClick={this.removeFilter} />
                        </div>
                        <div
                            style={{
                                width: '25px', height: '100%', marginLeft: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <FontAwesomeIcon icon={faChevronUp} style={{color: '#16335B', fontSize: '16px', cursor: 'pointer'}} onClick={this.closeFilter} />
                        </div>
                    </div>
                </Drawer>
                <ReactResizeDetector onResize={this.resize}>
                    {() => (
                        <div
                            id={`logsDiv_${id}`}
                            style={{
                                width: '100%',
                                height: 'calc(100% - 35px)',
                                maxHeight: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                overflowY: 'auto',
                                wordBreak: 'break-word',
                                fontSize: '14px',
                                padding: '10px',
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
                            {filteredLogs.map((l, ind) => (
                                <div
                                    key={`log_${ind}`}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        marginTop: '10px',
                                        borderBottom: (ind === filteredLogs.length - 1) ? '' : '2px solid #D0D6DE',
                                        padding: '5px 0px 5px 0px'
                                    }}
                                >
                                    <div style={{width: '100%', fontSize: '14px', fontWeight: 'bold', color: '#FF9D66'}}>
                                        {formatDate(l.date)}
                                    </div>
                                    <div
                                        style={{
                                            width: '100%', fontSize: '14px', color: l.color, marginTop: '5px', display: 'flex', justifyContent: 'flex-end'
                                        }}
                                    >
                                        {l.message}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ReactResizeDetector>
            </div>
        );
    }
}

const createLogs = ({id, type, initialState, user, owner}) => (
    <Logs
        id={id}
        type={type}
        initialState={initialState}
        user={user}
        owner={owner}
    />
);

export default createLogs;
