/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */

/*
* Importing the necessary modules
*/
import React from 'react';
import {EditableText} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {getRestStatus} from '../../../api/general';

// Returns a string representing a color. Returns a default color if the status is null and it returns a color 
// based on the first character of the status value if it is a string or number. If the first character of the status 
// value does not match any of the cases in the switch statement, the function returns the default color. 
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
    // The constructor takes a single argument, props, which is an object containing the properties passed to the component when it
    // is rendered. First it calls the parent class' constructor using the super function and passes the props object to it.
    // Then assigns the value of the type property of the props object to a class property called type. It also sets the initial 
    // state of the component using an object that includes several properties, some of which are taken from the props object and 
    // some of which have default values. Also binds the value of the resize method to the current instance of the 
    // component and declares a class property called interval which is set to null.    
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

    // Called immediately after the component is mounted and is used to trigger an action or dispatch an event.
    componentDidMount() {
        const {interval} = this.state;
        this.interval = setInterval(() => {
            this.testStatus();
        }, interval);
        this.testStatus();
    }

    // It is called immediately before the component is unmounted (removed from the DOM) and is used to perform any necessary cleanup before the component is destroyed.
    componentWillUnmount() {
        clearInterval(this.interval);
        this.interval = null;
    }

    // Makes a REST request and updates the component's state with the status and response of the request. If an error is thrown during the execution of the request, 
    // the function updates the state of the component with a default error status and response value.
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

    // Rezise method. If width is less than 200 then fontSize is 16, if more that 300 then 26 and if nothing of these two, then
    // set them to 18 and activeText to a boolean.
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

    // Render rest. The render method returns a JSX element, which will be rendered to the page.
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

// Returns a JSX element representing an instance of a component. The function takes an object as an argument and uses the properties 
// of the object as props for the returned component.
const createRest = ({id, type, initialState}) => (
    <Rest
        id={id}
        type={type}
        initialState={initialState}
    />
);

// Default export createRest
export default createRest;
