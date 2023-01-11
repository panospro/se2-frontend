/* eslint-disable max-len */

/*
* Importing the necessary modules
*/
import React from 'react';
import {EditableText} from '@blueprintjs/core';

class Iframe extends React.Component {
    // It sets the initial type, state of the component by assigning an object to the state  of the component 
    constructor(props) {
        super(props);

        this.type = props.type;

        this.state = {
            id: props.id,
            name: props.initialState.name || 'Iframe',
            url: props.initialState.url || '',
        };
    }

    // Returning a description of what the user interface (UI) of the component should look like. More specifically it returns a div element with some nested elements that
    // include an EditableText component and an iframe element. The div element has several inline styles applied to it and the iframe element's src attribute is set to the
    // value of the url  in the component's state, after some formatting is applied to it. The render function is called every time the component's state or props change
    // and the UI is updated to reflect the current state.
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

// Takes the arguments id, type and initialState and pass them to Iframe. The values are determined by the values of the properties in the object passed to createGauge.
const createIframe = ({id, type, initialState}) => (
    <Iframe 
        id={id}
        type={type}
        initialState={initialState}
    />
);

/*
*
* Default export
*
*/
// The export constant is: 
// createIframe
export default createIframe;
