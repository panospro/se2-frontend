/* eslint-disable no-constant-condition */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

/*
*
* Importing the necessary modules
* e.g. React, modules from our code,
* external modules and etc.
*
*/ 
import React from 'react';
import {Box} from 'rebass';
import styled from 'styled-components';
import {connect} from 'react-redux';
import {Collapse, Tooltip} from '@blueprintjs/core';
/* eslint-disable import/no-unresolved */
import GridLayout from 'react-grid-layout';
// eslint-disable-next-line camelcase
import jwt_decode from 'jwt-decode';
import {ToasterBottom} from '../../lib/toaster';
import actions from '../../actions';
import {getDashboard, saveDashboard} from '../../api/dashboards';
import {checkSource} from '../../api/sources';
import {CustomSpinner} from '../../lib/overlays';
import {CollapseButton, OrangeOnlyBorderButton} from '../../lib/buttons';
import components from './components';
import importIcon from '../../assets/import.png';
import importHoverIcon from '../../assets/importHover.png';
import exportIcon from '../../assets/export.png';
import exportHoverIcon from '../../assets/exportHover.png';

/* eslint-disable import/no-unresolved */
import '../../../node_modules/react-grid-layout/css/styles.css';
/* eslint-disable import/no-unresolved */
import '../../../node_modules/react-resizable/css/styles.css';

const fileDownload = require('js-file-download');

// Creates a styled component. It sets the height and width to 100%
// and uses flexbox to align items in the center and allow overflow.
// It also sets the position of the component as relative.
const StyledBox = styled(Box)`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    position: relative;
`;

// Style DragComp
const DragComp = styled.div`
    width: 80%;
    border-radius: 50px;
    cursor: move;
    z-index: 1;
    align-items: center;
    justify-content: center;
    margin: 1px;
`;

// Style CategoryDiv
const CategoryDiv = styled.div`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    margin-top: 2px;
`;

// Initialize the categories
const categories = {
    web: 'WEB COMPONENTS',
    broker: 'BROKER COMPONENTS',
    navigation: 'NAVIGATION COMPONENTS'
};

// Filters components by category and returns the names that belong to the specified category
const filterComponents = (comps, category) => {
    const categoryComponents = [];

    Object.keys(comps).forEach((c) => {
        if (comps[c].category === category) {
            categoryComponents.push(c);
        }
    });

    return categoryComponents;
};

// Returns a boolean indicating whether a value is within a specified range 
const valueInRange = (value, minim, maxim) => (
    (value >= minim) && (value <= maxim)
);

// Returns a boolean indicating whether a component with the size and position specified
// can be placed on the layout without overlapping with any existing components.
const componentFits = (row, column, w, h, currentLayout, nCols) => {
    if (column + w > nCols) {
        return false;
    }
    if (
        currentLayout.some((el) => {
            const xOverlap = valueInRange(column, el.x, el.x + el.w - 1) || valueInRange(el.x, column, column + w - 1);
            const yOverlap = valueInRange(row, el.y, el.y + el.h - 1) || valueInRange(el.y, row, row + h - 1);
            if (xOverlap && yOverlap) {
                return true;
            }
            return false;
        })
    ) {
        return false;
    }
    return true;
};

export class EditDashboardPage extends React.Component {
    // The constructor of the class. It sets up the initial state of the class and binds
    // class methods. It also creates a number of properties that describe the dashboard,
    // such as the user, token and sources. It also sets up properties related to the
    // dashboard's layout and elements.
    constructor(props) {
        super(props);

        this.user = props.user;
        this.token = props.token;
        this.clearAuth = props.clearAuth;
        this.pushHistory = props.history.push;
        this.dashboardId = props.match.params.dashboardId;

        this.nCols = 24;
        this.state = {
            name: '',
            spinnerOpen: false,
            mapWidth: 100,
            currentLayout: [],
            items: {},
            nextId: 1,
            droppingItem: {i: '', w: null, h: null},
            dragging: null,
            sources: [],
            openCategories: ['web', 'broker', 'navigation']
        };

        this.fetchDashboard = this.fetchDashboard.bind(this);
        this.changeSpinner = this.changeSpinner.bind(this);
        this.changeMapDimensions = this.changeMapDimensions.bind(this);
        this.elemDragStart = this.elemDragStart.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.layoutChanged = this.layoutChanged.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.saveDashboard = this.saveDashboard.bind(this);
        this.exportDashboard = this.exportDashboard.bind(this);
        this.importDashboard = this.importDashboard.bind(this);
        this.importedFile = this.importedFile.bind(this);
        this.checkSources = this.checkSources.bind(this);
        this.changeCategoryState = this.changeCategoryState.bind(this);
        this.findAvailableSpace = this.findAvailableSpace.bind(this);
        this.cloneComponent = this.cloneComponent.bind(this);
    }

    // Checks for token expiry, loads data and add event listener to window object. 
    componentDidMount() {
        if (jwt_decode(this.token).exp < Date.now() / 1000) {
            this.clearAuth();
            ToasterBottom.show({
                intent: 'danger',
                message: 'Connection session has expired. Please login again.'
            });
        } else {
            this.fetchDashboard();
            this.changeMapDimensions();
            window.addEventListener('resize', this.changeMapDimensions);
        }
    }

    // Removes the resize event listener.
    componentWillUnmount() {
        window.removeEventListener('resize', this.changeMapDimensions);
    }

    // Handles the event when user drops a component and updates the layout states and saves it.
    onDrop(__, layoutItem) {
        const {currentLayout, items, nextId, dragging} = this.state;
        currentLayout.push({
            i: nextId.toString(),
            x: layoutItem.x,
            y: layoutItem.y,
            w: components[dragging].startW,
            h: components[dragging].startH,
            minW: components[dragging].minW,
            maxW: components[dragging].maxW,
            minH: components[dragging].minH,
            maxH: components[dragging].maxH,
        });
        items[nextId.toString()] = {type: dragging, ...components[dragging].props};
        this.setState({
            currentLayout,
            items,
            nextId: nextId + 1,
            dragging: null,
            droppingItem: {i: '', w: null, h: null}
        }, this.saveDashboard);
    }


    // Updates the currentLayout state and save the updated one.
    layoutChanged(layout) {
        this.setState({currentLayout: layout}, this.saveDashboard);
    }

    // Ηandles the event when a user starts dragging a component and updates the state accordingly.
    elemDragStart(event, comp) {
        const {nextId} = this.state;
        event.stopPropagation();
        event.dataTransfer.setData('text/plain', '');
        this.setState({
            droppingItem: {
                i: nextId.toString(),
                w: components[comp].startW,
                h: components[comp].startH
            },
            dragging: comp
        });
    }

    // Change the spinner based on the value
    changeSpinner(value) {
        this.setState({spinnerOpen: value});
    }


    // Fetches dashboard data from API, change spinner status and updates state.
    async fetchDashboard() {
        this.changeSpinner(true);
        const response = await getDashboard(this.dashboardId);
        if (response.success) {
            this.setState({
                name: response.dashboard.name,
                currentLayout: response.dashboard.layout,
                items: response.dashboard.items,
                nextId: response.dashboard.nextId,
                sources: response.sources
            });
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was a problem trying to fetch the dashboard'
            });
        }

        this.changeSpinner(false);
    }

    // Retrieves the width of the map element and sets it to the state.
    changeMapDimensions() {
        const mapWidth = document.getElementById('mainmap').offsetWidth;
        this.setState({mapWidth});
    }

    // Updates a specific item in the state and saves the updated state.
    updateItem(id, key, value) {
        const {items} = this.state;
        items[id][key] = value;
        this.setState({items}, this.saveDashboard);
    }

    // Deletes an item from the state and saves the updated state
    deleteItem(id) {
        const {currentLayout, items} = this.state;
        delete items[id];
        const newLayout = currentLayout.filter((el) => el.i !== id);
        this.setState({
            currentLayout: newLayout,
            items
        }, this.saveDashboard);
    }

    // Save the current layout, items and nextId state to the server
    async saveDashboard() {
        const {currentLayout, items, nextId} = this.state;
        const response = await saveDashboard(this.dashboardId, currentLayout, items, nextId);
        if (!(response.success)) {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was a problem trying to save the dashboard'
            });
        }
    }

    // Exports the current layout, items and nextId state as a json file
    exportDashboard() {
        this.changeSpinner(true);
        const {name, currentLayout, items, nextId} = this.state;
        const json = {
            layout: currentLayout,
            items,
            nextId
        };
        const file = JSON.stringify(json);
        fileDownload(file, `${name}.json`);
        this.changeSpinner(false);
    }

    // eslint-disable-next-line class-methods-use-this
    // Triggers the file input element to let user select a file to import
    importDashboard() {
        const fileInput = document.getElementById('selectFile');
        fileInput.click();
    }

    // Reads the imported file as json, updates the current layout, items, nextId states and save the changes.
    importedFile(event) {
        event.preventDefault();

        const reader = new FileReader();
        // eslint-disable-next-line prefer-destructuring
        this.file = event.target.files[0];

        reader.onloadend = () => {
            const file = JSON.parse(reader.result);
            this.setState({
                currentLayout: file.layout,
                items: file.items,
                nextId: file.nextId
            }, () => {
                this.saveDashboard();
                this.checkSources();
            });
            document.getElementById('selectFile').value = null;
        };

        reader.readAsText(this.file);
    }

    // Checks the imported sources against the server and notify the new sources.
    async checkSources() {
        const {items} = this.state;
        const sourcesToCheck = [];
        Object.keys(items).forEach((it) => {
            switch (items[it].type) {
            case 'iframe':
                break;
            case 'gauge':
            case 'image':
            case 'logs':
            case 'value':
                if (!(sourcesToCheck.includes(items[it].source))) {
                    sourcesToCheck.push(items[it].source);
                }
                break;
            case 'buttons':
                items[it].sources.forEach((s) => {
                    if (!(sourcesToCheck.includes(s))) {
                        sourcesToCheck.push(s);
                    }
                });
                break;
            default:
            }
        });

        const response = await checkSource(sourcesToCheck);
        if (response.success) {
            response.newSources.forEach((n) => {
                ToasterBottom.show({
                    intent: 'primary',
                    message: `A new empty source named ${n} has been created. You should fill its info.`
                });
            });
        } else {
            ToasterBottom.show({
                intent: 'danger',
                message: response.message || 'There was a problem trying to check the imported sources'
            });
        }
    }

    //  Toggles the open state of a specific category.
    changeCategoryState(cat) {
        const {openCategories} = this.state;
        if (openCategories.includes(cat)) {
            openCategories.splice(openCategories.indexOf(cat), 1);
        } else {
            openCategories.push(cat);
        }
        this.setState({openCategories});
    }

    // Finds an empty spot for the component with specific width and height.
    findAvailableSpace(w, h) {
        const {currentLayout} = this.state;
        let x = null;
        let y = null;
        let row = -1;
        let column = -1;
        while (true) {
            if (x !== null && y !== null) {
                break;
            }
            row += 1;
            column = -1;
            while (true) {
                column += 1;
                if (column === this.nCols) {
                    break;
                }
                if (componentFits(row, column, w, h, currentLayout, this.nCols)) {
                    x = column;
                    y = row;
                    break;
                }
            }
        }

        return {x, y};
    }

    // Creates a clone of an existing component by its ID, add it to the state and saves the updated state.
    cloneComponent(id) {
        const {currentLayout, items, nextId} = this.state;
        const layout = currentLayout.find((el) => el.i === id.toString());
        const {x, y} = this.findAvailableSpace(layout.w, layout.h);
        currentLayout.push({
            i: nextId.toString(),
            x,
            y,
            w: layout.w,
            h: layout.h,
            minW: layout.minW,
            maxW: layout.maxW,
            minH: layout.minH,
            maxH: layout.maxH,
        });
        items[nextId.toString()] = {...items[id]};
        this.setState({
            currentLayout,
            items,
            nextId: nextId + 1
        }, this.saveDashboard);
    }

    // Generates JSX elements. It also renders the menu of categories and the components in them. It also generates the onclick handlers
    // for UI such as update, delete and clone the components. Then it returns the rendered elements in JSX which then
    // displayed on the page.
    render() {
        const {spinnerOpen, mapWidth, currentLayout, items, nextId, droppingItem, dragging, sources, openCategories} = this.state;

        const objects = [];
        currentLayout.forEach((it) => {
            objects.push(
                <div
                    key={it.i}
                    data-grid={{
                        x: it.x, y: it.y, w: it.w, h: it.h, minW: it.minW, maxW: it.maxW, minH: it.minH, maxH: it.maxH
                    }}
                    style={{width: '100%', height: '100%'}}
                >
                    {components[items[it.i].type].component({
                        id: it.i,
                        type: items[it.i].type,
                        initialState: items[it.i],
                        updateItem: this.updateItem,
                        deleteItem: this.deleteItem,
                        cloneComponent: this.cloneComponent,
                        sources
                    })}
                </div>
            );
        });

        return ([
            <StyledBox key="mainarea">
                <div
                    key="menu"
                    style={{
                        width: '250px', height: '100%', display: 'flex', flexDirection: 'column', padding: '20px 10px 20px 10px'
                    }}
                >
                    <div style={{width: '100%', height: 'calc(100% - 45px)', overflowY: 'auto'}}>
                        {Object.keys(categories).map((cat, ind) => (
                            <React.Fragment key={cat}>
                                <CollapseButton id={cat} key={cat} width="100%" height="40px" icon={openCategories.includes(cat) ? 'caret-down' : 'caret-right'} marginTop={(ind === 0) ? '0px' : '15px'} fontSize="13px" onClick={() => { this.changeCategoryState(cat); }}>
                                    {categories[cat]}
                                </CollapseButton>
                                <Collapse key={`${cat}_collapse`} isOpen={openCategories.includes(cat)}>
                                    <CategoryDiv>
                                        {filterComponents(components, cat).map((comp) => (
                                            <DragComp
                                                draggable
                                                unselectable="on"
                                                onDragStart={(event) => this.elemDragStart(event, comp)}
                                                onMouseOver={() => { document.getElementById(`icon_${comp}`).src = components[comp].iconHover; }}
                                                onFocus={() => { document.getElementById(`icon_${comp}`).src = components[comp].iconHover; }}
                                                onMouseOut={() => { document.getElementById(`icon_${comp}`).src = components[comp].icon; }}
                                                onBlur={() => { document.getElementById(`icon_${comp}`).src = components[comp].icon; }}
                                            >
                                                <Tooltip
                                                    // popoverClassName="components-tooltip"
                                                    disabled={dragging}
                                                    content={(
                                                        <div style={{flexDirection: 'column', textAlign: 'center', maxWidth: '200px', overflow: 'auto'}}>
                                                            <div style={{fontWeight: 'bold', fontSize: '16px'}}>
                                                                {components[comp].header}
                                                            </div>
                                                            <div style={{textAlign: 'left'}}>
                                                                {components[comp].text}
                                                            </div>
                                                        </div>
                                                    )}
                                                    interactionKind="hover"
                                                    position="left"
                                                    portalClassName="components-tooltip"
                                                >
                                                    <img id={`icon_${comp}`} src={components[comp].icon} alt={comp} draggable={false} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                                                </Tooltip>
                                            </DragComp>
                                        ))}
                                    </CategoryDiv>
                                </Collapse>
                            </React.Fragment>
                        ))}
                    </div>
                    <div
                        style={{
                            width: '100%', height: '35px', marginTop: '10px', display: 'flex', justifyContent: 'space-evenly'
                        }}
                    >
                        <OrangeOnlyBorderButton onClick={() => this.pushHistory(`/dashboards/${this.dashboardId}`)}>
                            Deploy
                        </OrangeOnlyBorderButton>
                        <div
                            style={{width: '35px', height: '35px'}}
                            onClick={this.importDashboard}
                            onMouseOver={() => { document.getElementById('importIcon').src = importHoverIcon; }}
                            onFocus={() => { document.getElementById('importIcon').src = importHoverIcon; }}
                            onMouseOut={() => { document.getElementById('importIcon').src = importIcon; }}
                            onBlur={() => { document.getElementById('importIcon').src = importIcon; }}
                        >
                            <Tooltip
                                popoverClassName="item-info-tooltip"
                                disabled={dragging}
                                content="Import dashboard"
                                interactionKind="hover"
                            >
                                <img id="importIcon" src={importIcon} alt="" style={{width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer'}} />
                            </Tooltip>
                        </div>
                        <div
                            style={{width: '35px', height: '35px'}}
                            onClick={this.exportDashboard}
                            onMouseOver={() => { document.getElementById('exportIcon').src = exportHoverIcon; }}
                            onFocus={() => { document.getElementById('exportIcon').src = exportHoverIcon; }}
                            onMouseOut={() => { document.getElementById('exportIcon').src = exportIcon; }}
                            onBlur={() => { document.getElementById('exportIcon').src = exportIcon; }}
                        >
                            <Tooltip
                                popoverClassName="item-info-tooltip"
                                disabled={dragging}
                                content="Export dashboard"
                                interactionKind="hover"
                            >
                                <img id="exportIcon" src={exportIcon} alt="" style={{width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer'}} />
                            </Tooltip>
                        </div>
                    </div>
                </div>
                <div
                    key={`mainmap_${nextId}`}
                    id="mainmap"
                    style={{
                        width: 'calc(100% - 250px)',
                        height: '100%',
                        background: '#D0D6DE',
                        display: 'flex',
                        flexWrap: 'wrap',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}
                >
                    <GridLayout
                        className="layout"
                        cols={this.nCols}
                        width={mapWidth}
                        compactType={null}
                        rowHeight={(mapWidth / this.nCols) - 10}
                        preventCollision
                        isDroppable
                        onDrop={this.onDrop}
                        style={{width: '100%', height: '100%', overflowY: 'auto'}}
                        droppingItem={droppingItem}
                        onDragStop={this.layoutChanged}
                        onResizeStop={this.layoutChanged}
                    >
                        {objects}
                    </GridLayout>
                </div>
            </StyledBox>,
            <CustomSpinner key="spinner" isOpen={spinnerOpen} />,
            <input type="file" id="selectFile" accept=".json" multiple={false} onChange={(event) => this.importedFile(event)} style={{display: 'none'}} />
        ]);
    }
}

// Takes the state and maps the user and token state values to props that can be used. 
export const mapState = (state) => ({user: state.auth.user, token: state.auth.token});

// Maps clearAuth dispatch, so it can be used to clear the authentication
// state in the store. 
export const mapDispatch = (dispatch) => ({
    clearAuth: () => {
        dispatch(actions.auth.clear());
    }
});

// Connects it to EditDashboardPage so that the mapState and mapDispatch can be used within it.
export default connect(
    mapState,
    mapDispatch
)(EditDashboardPage);
