/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */
import React from 'react';
import styled from 'styled-components';
import {EditableText} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';

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

    resize(width, height) {
        const {url} = this.state;
        this.setState({fontSize: Math.max(Math.min(height, ((2 * width) / url.length)), 12)});
    }

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

const createUrl = ({id, type, initialState}) => (
    <Url
        id={id}
        type={type}
        initialState={initialState}
    />
);

export default createUrl;
