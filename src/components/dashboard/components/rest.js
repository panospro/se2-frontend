/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */
import React from 'react';
import {EditableText} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {getRestStatus} from '../../../api/general';

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

class Rest extends React.Component {
    constructor(props) {
        super(props);

        this.type = props.type;

        this.state = {
            id: props.id,
            name: props.initialState.name || 'Rest Status',
            lastSend: null,
            active: false,
            url: props.initialState.url || '',
            interval: props.initialState.interval || 5000,
            activeText: true,
            smallIcon: false,
            fontSize: 16,
        };
        this.interval = null;

        this.testStatus = this.testStatus.bind(this);
        this.resize = this.resize.bind(this);
    }

    componentDidMount() {
        const {interval} = this.state;
        this.interval = setInterval(() => {
            this.testStatus();
        }, interval);
        this.testStatus();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.interval = null;
    }

    async testStatus() {
        const {url} = this.state;
        const formattedUrl = (url.startsWith('http://') || url.startsWith('https://')) ? url : `http://${url}`;
        try {
            const response = await getRestStatus(formattedUrl);
            this.setState({
                lastSend: response.status,
                active: response.active
            });
        } catch (error) {
            this.setState({
                lastSend: 500,
                active: false
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
            smallIcon: (height < 40 || width < 40),
            fontSize,
        });
    }

    render() {
        const {id, name, lastSend, active, activeText, smallIcon, fontSize} = this.state;

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
                            id={`restDiv_${id}`}
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
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        maxWidth: '200px',
                                        maxHeight: '50px',
                                        color: formatStatusColor(lastSend),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '10px',
                                        fontSize,
                                        fontWeight: 'bold',
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
                                    {activeText && lastSend}
                                </div>
                            </div>
                        </div>
                    )}
                </ReactResizeDetector>
            </div>
        );
    }
}

const createRest = ({id, type, initialState}) => (
    <Rest
        id={id}
        type={type}
        initialState={initialState}
    />
);

export default createRest;
