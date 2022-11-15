/* eslint-disable max-len */
import React from 'react';
import {EditableText} from '@blueprintjs/core';

class Iframe extends React.Component {
    constructor(props) {
        super(props);

        this.type = props.type;

        this.state = {
            id: props.id,
            name: props.initialState.name || 'Iframe',
            url: props.initialState.url || '',
        };
    }

    render() {
        const {id, name, url} = this.state;
        const formattedUrl = (url.startsWith('http://') || url.startsWith('https://')) ? url : `http://${url}`;

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
                <div
                    id={`iframeDiv_${id}`}
                    style={{
                        width: '100%',
                        height: 'calc(100% - 35px)',
                        maxHeight: '100%',
                        marginTop: '10px'
                    }}
                >
                    <iframe allowFullScreen title="Iframe" name="Iframe" src={formattedUrl || ''} />
                </div>
            </div>
        );
    }
}

const createIframe = ({id, type, initialState}) => (
    <Iframe 
        id={id}
        type={type}
        initialState={initialState}
    />
);

export default createIframe;
