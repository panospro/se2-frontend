/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */
import React from 'react';
import {EditableText} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';

class Text extends React.Component {
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

    resize(width, height) {
        const {text} = this.state;
        this.setState({fontSize: Math.max(Math.min(height, ((2 * width) / text.length)), 12)});
    }

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

const createText = ({id, type, initialState}) => (
    <Text
        id={id}
        type={type}
        initialState={initialState}
    />
);

export default createText;
