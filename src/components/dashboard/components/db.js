/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */

/*
* Importing the necessary modules
* e.g. React, modules from our code,
* external modules and etc.
*/ 
import React from 'react';
import { EditableText, Spinner} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import { ToasterBottom } from '../../../lib/toaster';

// import {connectDB} from '../../../api/general';

class DB extends React.Component {
    constructor(props) {
        super(props);

        this.type = props.type;

        this.state = {
            id: props.id,
            name: props.initialState.name || 'DB',
            uri: props.initialState.uri || '',
            connection: props.initialState.connection || '',
            collection: props.initialState.collection || '',
            // fontSize: 50,
            spinnerOpen: true,
            data: {},
        };


        // this.resize = this.resize.bind(this);
        this.connectToDB = this.connectToDB.bind(this);
    }

    // Changes the value of the spinnerOpen state to the
    // given value. It is used to open or close the spinner. 
    // changeSpinner(value) {
    //     this.setState({spinnerOpen: value});
    // }

    // Called immediately after the component is mounted and is used to trigger an action or dispatch an event.
    // componentDidMount() {
    //     this.connectToTopic();
    // }

    async connectToDB() {
        const {uri, connection, collection} = this.state;
        const response = await this.connectDB(uri, connection, collection);
        if (response.success) {
            this.setState({data: response.data});
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was a problem'
            });
        }
        this.setState({spinnerOpen: false});
    }



    // Updates the value of the activeText and fontSize properties in the component's state based
    //  on the width and height of the component
    // resize(width, height) {
    //     const {text} = this.state;
    //     this.setState({fontSize: Math.max(Math.min(height, ((2 * width) / text.length)), 12)});
    // }

    render() {
        const {id, name, data, spinnerOpen} = this.state;


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
                    <div>
                        <EditableText disabled className="name-no-edit" placeholder="Component Name" value={name} />
                    </div>
                </div>
                <ReactResizeDetector onResize={this.resize}>
                    {() => (
                        <div
                            id={`db2_${id}`}
                            style={{
                                width: '100%',
                                height: 'calc(100% - 35px)',
                                maxHeight: '100%',
                                marginTop: '10px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: '#16335B',
                                wordBreak: 'break-word'
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
                                        background: 'rgba(255, 255, 255, 0.6'
                                    }}
                                >
                                    <Spinner intent="primary" size={30} />
                                </div>        
                            )}
                            {JSON.stringify(data)}

                        </div>
                    )}
                </ReactResizeDetector>
            </div>
        );
    }
}

const createDB = ({id, type, initialState}) => (
    <DB
        id={id}
        type={type}
        initialState={initialState}
    />
);

export default createDB;
