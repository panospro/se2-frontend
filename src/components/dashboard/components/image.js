/* eslint-disable max-len */
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
        const {variable} = this.state;
        try {
            const {counter} = this.state;
            const newCounter = counter + 1;
            const image = objectPath.get(payload, variable);
            this.setState({image: `data:image/jpg;base64,${image}`, counter: newCounter});
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

    openImage() {
        this.setState({imagePopupOpen: true});
    }

    closeImage() {
        this.setState({imagePopupOpen: false});
    }

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

const createImage = ({id, type, initialState, user, owner}) => (
    <Image
        id={id}
        type={type}
        initialState={initialState}
        user={user}
        owner={owner}
    />
);

export default createImage;
