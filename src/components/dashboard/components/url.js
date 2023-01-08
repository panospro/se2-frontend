/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */

/*
* Importing the necessary modules
*/
import React from 'react';
import styled from 'styled-components';
import {EditableText} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';

// Style StyledLink
const StyledLink = styled.div`
    width: 100%;
    height: calc(100% - 35px);
    max-height: 100%;
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: -webkit-link;
    cursor: pointer;
    word-break: break-word;
    :hover {
        text-decoration: underline;
    }
`;

class Url extends React.Component {
    // The constructor of the class, that initializes type,state and resize
    constructor(props) {
        super(props);

        this.type = props.type;

        this.state = {
            id: props.id,
            name: props.initialState.name || 'Text',
            url: props.initialState.url || '',
            fontSize: 50
        };

        this.resize = this.resize.bind(this);
    }

    // Adjust the font size of a component based on its dimensions and the length of a text property in its state.
    // Ensures that the fontSize is within a certain range and proportionally adjusts the value based on the length of the text.
    resize(width, height) {
        const {url} = this.state;
        this.setState({fontSize: Math.max(Math.min(height, ((2 * width) / url.length)), 12)});
    }

    // Render rest-request. The render method returns a JSX element, which will be rendered to the page.
    render() {
        const {id, name, url, fontSize} = this.state;

        let urlToVisit = url;
        if (!urlToVisit.startsWith('http://') && !urlToVisit.startsWith('https://')) {
            urlToVisit = `http://${url}`;
        }
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
                        <StyledLink
                            id={`urlDiv_${id}`}
                            style={{fontSize: `${fontSize}px`}}
                            onClick={() => window.open(urlToVisit, '_blank')}
                        >
                            {url}
                        </StyledLink>
                    )}
                </ReactResizeDetector>
            </div>
        );
    }
}

// Returns a JSX element representing an instance of a component. The function takes an object as an argument and uses the properties 
// of the object as props for the returned component.
const createUrl = ({id, type, initialState}) => (
    <Url
        id={id}
        type={type}
        initialState={initialState}
    />
);

// Default export createUrl
export default createUrl;
