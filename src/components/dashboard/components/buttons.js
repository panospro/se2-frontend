/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */
import React from 'react';
import styled from 'styled-components';
import {
    ButtonGroup, EditableText, TextArea, Tag
} from '@blueprintjs/core';
import {
    BlueBorderButton, BlueButton, CustomButton
} from '../../../lib/buttons';
import {ToasterBottom} from '../../../lib/toaster';
import {findSource} from '../../../api/sources';
import {PortalOverflowOverlay} from '../../../lib/overlays';

const mqtt = require('mqtt');

const FormHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    font-size: 24px;
    font-weight: bold;
    color: #16335B;
`;

const FormSubHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    font-size: 18px;
    color: #16335B;
`;

const SettingsDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const isValidJson = (input) => {
    try {
        JSON.parse(input);
    } catch {
        return false;
    }
    return true;
};

class Buttons extends React.Component {
    constructor(props) {
        super(props);

        this.type = props.type;

        let initialTexts; 
        let initialSources = [];
        let initialTopics = [];
        let initialPayloads = [];
        let initialIsDynamic = [];
        let initialColors = [];
        let initialBackgrounds = [];
        let initialBackgroundsHover = [];
        if ('texts' in props.initialState) {
            initialTexts = props.initialState.texts;
            for (let i = 0; i < initialTexts.length; i += 1) {
                initialSources.push('Select source');
                initialTopics.push('');
                initialPayloads.push('{}');
                initialIsDynamic.push(false);
                initialColors.push('white');
                initialBackgrounds.push('#FF9D66');
                initialBackgroundsHover.push('#ff7e33');
            }
        } else {
            initialTexts = []; 
            initialSources = [];
            initialTopics = [];
            initialPayloads = [];
            initialIsDynamic = [];
            initialColors = [];
            initialBackgrounds = [];
            initialBackgroundsHover = [];
        }

        this.state = {
            id: props.id,
            user: props.user,
            owner: props.owner,
            name: props.initialState.name || 'Buttons',
            counter: 0,
            alignText: props.initialState.alignText || 'center',
            buttonsAlign: props.initialState.buttonsAlign || 'horizontal',
            texts: props.initialState.texts || initialTexts,
            sources: props.initialState.sources || initialSources,
            topics: props.initialState.topics || initialTopics,
            payloads: props.initialState.payloads || initialPayloads,
            isDynamic: props.initialState.isDynamic || initialIsDynamic,
            colors: props.initialState.colors || initialColors,
            backgrounds: props.initialState.backgrounds || initialBackgrounds,
            backgroundsHover: props.initialState.backgroundsHover || initialBackgroundsHover,
            buttonPopupOpen: false,
            buttonSelected: null,
            tempPayload: ''
        };
        this.rxStomps = [];
        this.mqttClients = [];
        props.initialState.texts.forEach(() => { this.rxStomps.push(null); });
        props.initialState.texts.forEach(() => { this.mqttClients.push(null); });

        this.connectStompSource = this.connectStompSource.bind(this);
        this.connectMqttSource = this.connectMqttSource.bind(this);
        this.connectToTopics = this.connectToTopics.bind(this);
        this.disconnectFromTopics = this.disconnectFromTopics.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.openButtonPopup = this.openButtonPopup.bind(this);
        this.closeButtonPopup = this.closeButtonPopup.bind(this);
        this.changeButtonPayload = this.changeButtonPayload.bind(this);
        this.editPayload = this.editPayload.bind(this);
    }

    componentDidMount() {
        this.connectToTopics();
    }

    componentWillUnmount() {
        this.disconnectFromTopics();
    }

    connectStompSource(source, ind) {
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
            this.rxStomps[ind] = new RxStomp.RxStomp();
            this.rxStomps[ind].configure(stompConfig);
            this.rxStomps[ind].activate();
        } catch {}
    }

    connectMqttSource(source, ind) {
        try {
            const config = {
                username: source.login,
                password: source.passcode
            };

            this.mqttClients[ind] = mqtt.connect(source.url, config);
        } catch {}
    }

    async connectToTopics() {
        const {user, owner, name, sources} = this.state;
        sources.forEach((source, ind) => {
            findSource(source, owner, user).then((response) => {
                if (response.success) {
                    if (response.source.type === 'stomp') {
                        this.connectStompSource(response.source, ind);
                    } else {
                        this.connectMqttSource(response.source, ind);
                    }
                } else {
                    ToasterBottom.show({
                        intent: 'danger',
                        message: `There was a problem trying to find the source for ${name} and source ${source}`
                    });
                }
            });
        });
    }

    disconnectFromTopics() {
        this.rxStomps.forEach((rxStomp) => {
            if (rxStomp !== null) {
                rxStomp.deactivate();
            }
        });
        this.mqttClients.forEach((mqqtClient) => {
            if (mqqtClient !== null) {
                mqqtClient.end();
            }
        });
    }

    sendMessage() {
        const {counter, topics, payloads, buttonSelected} = this.state;
        try {
            if (this.rxStomps[buttonSelected] !== null) {
                this.rxStomps[buttonSelected].publish({destination: `/topic/${topics[buttonSelected]}`, body: payloads[buttonSelected]});
            } else if (this.mqttClients[buttonSelected] !== null) {
                this.mqttClients[buttonSelected].publish(topics[buttonSelected], payloads[buttonSelected]);
            }
            this.setState({counter: counter + 1, buttonSelected: null});
        } catch {}
    }

    openButtonPopup(ind) {
        const {payloads, isDynamic} = this.state;
        if (isDynamic[ind]) {
            this.setState({buttonPopupOpen: true, buttonSelected: ind, tempPayload: payloads[ind]});
        } else {
            this.setState({buttonSelected: ind}, this.sendMessage);
        }
    }

    closeButtonPopup() {
        this.setState({buttonPopupOpen: false, buttonSelected: null});
    }

    changeButtonPayload() {
        const {payloads, buttonSelected, tempPayload} = this.state;
        if (isValidJson(tempPayload)) {
            payloads[buttonSelected] = tempPayload;
            this.setState({payloads, buttonPopupOpen: false, tempPayload: ''}, this.sendMessage);
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: 'Not a valid json payload'
            });
        }
    }

    editPayload(event) {
        this.setState({tempPayload: event.target.value});
    }

    render() {
        const {id, name, counter, alignText, buttonsAlign, texts, colors, backgrounds, backgroundsHover, buttonPopupOpen, tempPayload} = this.state;

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
                <div
                    id={`buttonsDiv_${id}`}
                    className={(buttonsAlign === 'vertical') ? 'vertical-buttons' : 'horizontal-buttons'}
                    style={{
                        width: '100%',
                        height: 'calc(100% - 35px)',
                        maxHeight: '100%',
                        marginTop: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '5px'
                    }}
                >
                    <ButtonGroup alignText={alignText} vertical={(buttonsAlign === 'vertical')} fill>
                        {texts.map((t, ind) => (
                            <CustomButton
                                width={((buttonsAlign === 'vertical')) ? '100%' : 'auto'}
                                height={((buttonsAlign === 'vertical')) ? 'auto' : '100%'}
                                minWidth={((buttonsAlign === 'vertical')) ? 'auto' : '0px'}
                                minHeight={((buttonsAlign === 'vertical')) ? '0px' : 'auto'}
                                color={`${colors[ind]}!important`}
                                background={`${backgrounds[ind]}!important`}
                                backgroundHover={`${backgroundsHover[ind]}!important`}
                                onClick={() => this.openButtonPopup(ind)}
                            >
                                {t}
                            </CustomButton>
                        ))}
                    </ButtonGroup>
                </div>
            </div>,
            <PortalOverflowOverlay key="settings" id="settings" isOpen={buttonPopupOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    {`${name} Settings`}
                </FormHeader>
                <FormSubHeader>
                    Button Payload
                </FormSubHeader>
                <SettingsDiv>
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <TextArea
                            id="payload"
                            style={{
                                background: 'white', height: '70px', resize: 'none', fontSize: '13px', fontFamily: 'Roboto, sans-serif', borderRadius: '5px'
                            }}
                            fill
                            growVertically={false}
                            onChange={this.editPayload}
                            placeholder="Button Payload"
                            defaultValue={tempPayload}
                        />
                    </div>
                    <div
                        style={{
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <BlueBorderButton
                            id="cancel"
                            type="button"
                            onClick={this.closeButtonPopup}
                        >
                            Cancel
                        </BlueBorderButton>
                        <BlueButton
                            id="save"
                            type="button"
                            onClick={this.changeButtonPayload}
                        >
                            Save
                        </BlueButton>
                    </div>
                </SettingsDiv>
            </PortalOverflowOverlay>
        ]);
    }
}

const createButtons = ({id, type, initialState, user, owner}) => (
    <Buttons
        id={id}
        type={type}
        initialState={initialState}
        user={user}
        owner={owner}
    />
);

export default createButtons;
