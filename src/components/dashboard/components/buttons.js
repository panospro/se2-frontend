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

/*
* Style FormHeader
*/
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

/*
* Style FormSubHeader
*/
const FormSubHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    font-size: 18px;
    color: #16335B;
`;

/*
* Style SettingsDiv
*/
const SettingsDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

// Takes a string as an argument and returns a boolean. The function attempts to parse the input string as JSON and returns true if the parsing is successful. If an error is thrown while
// parsing, the function returns false.
const isValidJson = (input) => {
    try {
        JSON.parse(input);
    } catch {
        return false;
    }
    return true;
};

class Buttons extends React.Component {
    // The component's props are destructured and used to initialize the component's state. 
    // The component's state is initialized with several, some of which are destructured from the props.initialState object and others of which have default values.
    // The component also has several class (this.rxStomps, this.mqttClients, etc.) that are initialized with empty arrays.
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

    // Called immediately after the component is mounted and is used to trigger an action or dispatch an event.
    componentDidMount() {
        this.connectToTopics();
    }

    // It is called immediately before the component is unmounted (removed from the DOM) and is used to perform any necessary cleanup before the component is destroyed.
    componentWillUnmount() {
        this.disconnectFromTopics();
    }

    // Used to connect to a STOMP broker using the RxStomp.RxStomp library, which is a library for interacting with STOMP brokers using the reactive programming paradigm.
    // The method takes a source object and an index ind as arguments and uses them to configure the connection to the STOMP broker. The method instantiates an RxStomp.RxStomp object,
    // calls the configure method on it with a configuration object and then calls the activate method to establish the connection to the broker.
    // If there is an error it catches it with an empty catch block to catch any errors that might occur and prevent them from crashing the application.
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
        } catch (error) {
            console.error('An error occurred:', error);
          }
    }

    // Takes source and ind as arguments and is used to connect to an MQTT (Message Queuing Telemetry Transport) broker with the provided source object. It uses the mqtt.connect function
    // to establish the connection to the broker. The source object's login and passcode are destructured and used as the username and password configuration options, respectively. 
    // If there is an error it catches it with an empty catch block to catch any errors that might occur and prevent them from crashing the application.
    connectMqttSource(source, ind) {
        try {
            const config = {
                username: source.login,
                password: source.passcode
            };

            this.mqttClients[ind] = mqtt.connect(source.url, config);
        } catch (error) {
            console.error('An error occurred:', error);
          }
    }

    // It is an async function that retrieves sources based on the owner, user and name in the component's state and then uses those sources to connect to brokers using
    // the connectStompSource and connectMqttSource. The function findSource is called with the source, owner and user as arguments and returns a promise that resolves with
    // a response object. If the response.success is true, the method checks the type of the source in the response (either 'stomp' or 'mqtt') and calls the appropriate connection method
    // with the source object and the index ind as arguments. If the response is not successful, a message is displayed using the ToasterBottom.show method.
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

    // Used to disconnect from topics in a messaging system. It does this by deactivating all "rxStomp" objects and ending all "mqttClient" objects.
    // The purpose of this function is to cleanly disconnect from the messaging system and close any open connections.
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

    // Used to publish a message to a topic in a messaging system. The topic and message payload are determined by the current state of the component, specifically the "topics" and "payloads"
    // arrays and "buttonSelected". It attempts to publish the message using either an "rxStomp" object or an "mqttClient" object, depending on which is available.
    // The counter state is incremented and the "buttonSelected" is reset after the message is sent.
    sendMessage() {
        const {counter, topics, payloads, buttonSelected} = this.state;
        try {
            if (this.rxStomps[buttonSelected] !== null) {
                this.rxStomps[buttonSelected].publish({destination: `/topic/${topics[buttonSelected]}`, body: payloads[buttonSelected]});
            } else if (this.mqttClients[buttonSelected] !== null) {
                this.mqttClients[buttonSelected].publish(topics[buttonSelected], payloads[buttonSelected]);
            }
            this.setState({counter: counter + 1, buttonSelected: null});
        } catch (error) {
            console.error('An error occurred:', error);
          }
    }

    // Used to either open a popup or send a message, depending on the value of the "isDynamic"  in the component's state. If "isDynamic" is true for the specified index,
    // the function opens a popup and stores the index and the current value of the "payloads" array in the component's state.
    // If "isDynamic" is false, the function stores the index in the component's state and calls the sendMessage() function to publish a message.
    openButtonPopup(ind) {
        const {payloads, isDynamic} = this.state;
        if (isDynamic[ind]) {
            this.setState({buttonPopupOpen: true, buttonSelected: ind, tempPayload: payloads[ind]});
        } else {
            this.setState({buttonSelected: ind}, this.sendMessage);
        }
    }

    // Used to close a popup and reset the "buttonSelected"  in the component's state.
    closeButtonPopup() {
        this.setState({buttonPopupOpen: false, buttonSelected: null});
    }

    // Changes the payload of a button in a user interface. Getting the values from state into: payloads, buttonSelected and tempPayload. It then checks if tempPayload is a valid
    // JSON string. If it is valid, it updates the payloads array by assigning the value of tempPayload to the index specified by buttonSelected. The function then sets the
    // component's state with the updated payloads array, closes the button popup and resets the tempPayload to an empty string. If tempPayload is not 
    // a valid JSON string, a message is displayed to the user.
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

    // A way for the user to edit the payload of a button by changing the value of the tempPayload state variable to the value of the event.target.value .
    editPayload(event) {
        this.setState({tempPayload: event.target.value});
    }

    // It starts by getting several variables from state. It then returns an array containing a single JSX element, which is a styled div element with several nested children.
    // These children include another div with a nested EditableText component and a Tag component, a styled div with an id and a class name that changes based on the value of
    // buttonsAlign in state and several CustomButton components that are mapped over the texts array in state. Each CustomButton also has several style applied
    // to it that are derived from the corresponding elements in the colors, backgrounds and backgroundsHover arrays in state. When one of these buttons is clicked, the openButtonPopup
    // function is called with the index of the clicked button as an argument.
    // Then append two JSX elements to the array returned by the render function. The first element is a PortalOverflowOverlay component that is rendered when the value of buttonPopupOpen 
    // in state is true. This component has several props applied to it that define its appearance and behavior, such as isOpen, width, height, background, borderRadius, padding, marginLeft
    // and color. It also has several nested children, including a FormHeader, a FormSubHeader and a SettingsDiv element that contains a TextArea component and two buttons
    // (a BlueBorderButton and a BlueButton). The TextArea has an onChange prop that is bound to the editPayload function and both buttons have onClick props that are bound
    // to the closeButtonPopup and changeButtonPayload functions, respectively.
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

// Takes an object as an argument with the id, type, initialState, user and owner to customize the appearance or behavior of the button or group of buttons.
// The function returns a JSX element called Buttons, with the id, type, initialState, user and owner being passed to it. This JSX element Buttons is a component 
// that represents a UI element in the form of a button or a group of buttons.
const createButtons = ({id, type, initialState, user, owner}) => (
    <Buttons
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
// createButtons
export default createButtons;
