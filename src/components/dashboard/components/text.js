/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */

/*
* Importing the necessary modules
*/
import React from 'react';
import {EditableText} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';

class Text extends React.Component {
    // The constructor of the class, that initializes type,state and resize
    constructor(props) {
        super(props);

        this.type = props.type;

        this.state = {
            id: props.id,
            name: props.initialState.name || 'Text',
            text: props.initialState.text || '',
            fontSize: 50
        };

        this.resize = this.resize.bind(this);
    }

    // Adjust the font size of a component based on its dimensions and the length of a text  in its state.
    // Ensures that the fontSize is within a certain range and proportionally adjusts the value based on the length of the text.
    resize(width, height) {
        const {text} = this.state;
        this.setState({fontSize: Math.max(Math.min(height, ((2 * width) / text.length)), 12)});
    }

    // Render rest-request. The render method returns a JSX element, which will be rendered to the page.
    render() {
        const {id, name, text, fontSize} = this.state;

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
                            id={`textDiv_${id}`}
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
                                wordBreak: 'break-word'
                            }}
                        >
                            {text}
                        </div>
                    )}
                </ReactResizeDetector>
            </div>
        );
    }
}

// Returns a JSX element representing an instance of a component. The function takes an object as an argument and uses the properties 
// of the object as props for the returned component.
const createText = ({id, type, initialState}) => (
    <Text
        id={id}
        type={type}
        initialState={initialState}
    />
);

// Default export createRestRequest
export default createText;
