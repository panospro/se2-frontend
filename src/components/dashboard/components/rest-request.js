/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */
import React from 'react';
import {EditableText, TextArea} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {getRestRequestStatus} from '../../../api/general';

const formatStatusColor = (status) => {
    if (status === null) return '#FF9D66';
    const statusString = status.toString()[0];
    switch (statusString) {
    case '1':
        return '#d0d5de';
    case '2':
        return '#57ae13';
    case '3':
        return '#1e3e60';
    case '4':
        return '#de152e';
    case '5':
        return '#a71022';
    default:
        return '#FF9D66';
    }
};

class RestRequest extends React.Component {
    constructor(props) {
        super(props);

        this.type = props.type;

        this.state = {
            id: props.id,
            name: props.initialState.name || 'Rest Request',
            url: props.initialState.url || '',
            requestType: props.initialState.requestType || 'GET',
            fire: props.initialState.fire || 'once',
            interval: props.initialState.interval || 5000,
            headers: props.initialState.headers || '',
            body: props.initialState.body || '',
            params: props.initialState.params || '',
            lastSend: null,
            lastSendResponse: '',
            activeText: true,
            fontSize: 16,
        };
        this.interval = null;

        this.testStatus = this.testStatus.bind(this);
        this.resize = this.resize.bind(this);
    }

    componentDidMount() {
        const {fire, interval} = this.state;

        if (fire === 'interval') {
            this.interval = setInterval(() => {
                this.testStatus();
            }, interval);
        }
        this.testStatus();
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    async testStatus() {
        const {url, requestType, headers, body, params} = this.state;
        const formattedUrl = (url.startsWith('http://') || url.startsWith('https://')) ? url : `http://${url}`;
        try {
            const response = await getRestRequestStatus(formattedUrl, requestType, headers, body, params);
            this.setState({
                lastSend: response.status,
                lastSendResponse: response.response,
            });
        } catch (error) {
            this.setState({
                lastSend: 500,
                lastSendResponse: error
            });
        }
    }

    resize(width, height) {
        let fontSize = 18;
        if (width < 200) {
            fontSize = 16;
        }
        if (width > 300) {
            fontSize = 26;
        }
        this.setState({
            activeText: (height > 40 && width > 90),
            fontSize,
        });
    }

    render() {
        const {id, name, lastSend, lastSendResponse, activeText, fontSize} = this.state;

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
                </div>
                <ReactResizeDetector onResize={this.resize}>
                    {() => (
                        <div
                            id={`restRequestDiv_${id}`}
                            style={{
                                width: '100%',
                                height: 'calc(100% - 35px)',
                                maxHeight: '100%',
                                marginTop: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        maxWidth: '250px',
                                        maxHeight: '50px',
                                        color: '#16335B',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '10px',
                                        fontSize,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {activeText
                                    && (
                                        'Status code: '
                                    )}
                                    <p style={{color: formatStatusColor(lastSend), margin: 0, marginLeft: 5}}>{lastSend}</p>
                                </div>
                                {activeText
                                && (
                                    <TextArea
                                        id="response"
                                        style={{
                                            background: 'white',
                                            height: '70px',
                                            resize: 'none',
                                            fontSize: '13px',
                                            fontFamily: 'Roboto,sans-serif',
                                            borderRadius: '5px',
                                            border: '2px solid #16335B',
                                            color: 'black'
                                        }}
                                        disabled
                                        fill
                                        growVertically={false}
                                        placeholder="Request Response"
                                        value={lastSendResponse}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </ReactResizeDetector>
            </div>
        );
    }
}

const createRestRequest = ({id, type, initialState}) => (
    <RestRequest
        id={id}
        type={type}
        initialState={initialState}
    />
);

export default createRestRequest;
