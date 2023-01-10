/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */

/*
* Importing the necessary modules
*/
import React from 'react';
import styled from 'styled-components';
import {
    Alert, EditableText, InputGroup, Menu, MenuItem, Popover, Switch, Tooltip, NumericInput
} from '@blueprintjs/core';
import {
    faCog, faTrashAlt, faClone
} from '@fortawesome/free-solid-svg-icons';
/* eslint-disable import/no-unresolved */
import ReactResizeDetector from 'react-resize-detector';
import {
    XYPlot, LineSeries, HorizontalGridLines, VerticalGridLines, XAxis, YAxis, DiscreteColorLegend, Highlight, Borders, VerticalBarSeries
} from 'react-vis';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {PortalOverflowOverlay} from '../../../lib/overlays';
import {
    BlueBorderButton, BlueButton, OrangeButton
} from '../../../lib/buttons';

import '../../../../node_modules/react-vis/dist/style.css';

// Defines a styled div element with specific styling properties such as font size,
// font weight and color. It also includes layout properties to center the element and give it a margin.
const FormHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    font-size: 24px;
    font-weight: bold;
    color: #16335B;
    position: relative;
`;

// Defines a styled div element with specific styling properties such as font size,
// font weight and color. It also includes layout properties to center the element and give it a margin.
const FormSubHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    font-size: 18px;
    color: #16335B;
`;

// Creates a styled div element with a width of 100%
// and sets the flex-direction to column and align-items to center.
const SettingsDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

// Initialize legend positions
const legendPositions = {
    topLeft: 'Top-Left',
    topRight: 'Top-Right',
    bottomLeft: 'Bottom-Left',
    bottomRight: 'Bottom-Right'
};

// Takes in a date object and returns a formatted string representation of that date. First gets the day, month and year values from the date object and stores them
// in separate variables. It then gets the hour, minute and second values and stores them in separate variables as well.
// Then checks the length of each of these values and if the length is 1, it adds a leading zero to the value. For example, if the month is 9, the value will be changed to 09.
// Finally, the function returns a string that is formatted as "dd/mm/yyyy, hh:mm:ss", using the day, month, year, hour, minute and second values that were extracted from the date object.
const formatDate = (dateM) => {
    const date = new Date(dateM);
    // const day = ((String(date.getDate())).length === 1) ? `0${String(date.getDate())}` : String(date.getDate());
    // const month = ((String(date.getMonth() + 1)).length === 1) ? `0${String(date.getMonth() + 1)}` : String(date.getMonth() + 1);
    // const year = date.getFullYear();
    const hours = ((String(date.getHours())).length === 1) ? `0${String(date.getHours())}` : String(date.getHours());
    const minutes = ((String(date.getMinutes())).length === 1) ? `0${String(date.getMinutes())}` : String(date.getMinutes());
    const seconds = ((String(date.getSeconds())).length === 1) ? `0${String(date.getSeconds())}` : String(date.getSeconds());

    return (`${hours}:${minutes}:${seconds}`);

    // return (`${day}/${month}/${year}`);
};

// Initialize plot types
const plotTypes = {
    line: 'Line chart',
    bar: 'Bar chart'
};

class Plot extends React.Component {
    // It sets the initial type, state, updateItem etc.
    constructor(props) {
        super(props);

        this.type = props.type;
        this.updateItem = props.updateItem;
        this.deleteItem = props.deleteItem;
        this.cloneComponent = props.cloneComponent;

        let initialNames; 
        let initialTypes = [];
        let initialTopics = [];
        let initialVariables = [];
        let initialColors = [];
        let initialSmooths = [];
        if ('names' in props.initialState) {
            initialNames = props.initialState.names;
            for (let i = 0; i < initialNames.length; i += 1) {
                initialTypes.push('line');
                initialTopics.push('');
                initialVariables.push('');
                initialColors.push('#FF9D66');
                initialSmooths.push(false);
            }
        } else {
            initialNames = ['Plot 1']; 
            initialTypes = ['line'];
            initialTopics = [''];
            initialVariables = [''];
            initialColors = ['#FF9D66'];
            initialSmooths = [false];
        }

        this.state = {
            id: props.id,
            availableSources: props.availableSources,
            name: props.initialState.name || 'Plot Viewer',
            source: props.initialState.source || 'Select source',
            verticalGrid: props.initialState.verticalGrid || true,
            horizontalGrid: props.initialState.horizontalGrid || true,
            xAxis: props.initialState.xAxis || true,
            yAxis: props.initialState.yAxis || true,
            legend: props.initialState.legend || true,
            legendPosition: props.initialState.legendPosition || 'topRight',
            maxValues: props.initialState.maxValues || -1,
            names: props.initialState.names || initialNames,
            types: props.initialState.types || initialTypes,
            topics: props.initialState.topics || initialTopics,
            variables: props.initialState.variables || initialVariables,
            colors: props.initialState.colors || initialColors,
            smooths: props.initialState.smooths || initialSmooths,
            popoverOpen: false,
            deletePopupOpen: false,
            tempSource: 'Select source',
            tempVerticalGrid: true,
            tempHorizontalGrid: true,
            tempXAxis: true,
            tempYAxis: true,
            tempLegend: true,
            tempLegendPosition: 'topRight',
            tempMaxValues: -1,
            tempNames: ['Plot 1'],
            tempTypes: 'line',
            tempTopics: [''],
            tempVariables: [''],
            tempColors: ['#FF9D66'],
            tempSmooths: [false],
            width: 50,
            height: 50,
            lastDrawLocation: null,
            plotPopoverOpen: false,
            plotSelected: null
        };

        this.generateValues = this.generateValues.bind(this);
        this.sendUpdate = this.sendUpdate.bind(this);
        this.delete = this.delete.bind(this);
        this.changeName = this.changeName.bind(this);
        this.openPopup = this.openPopup.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.closeConfirmPopup = this.closeConfirmPopup.bind(this);
        this.openDelete = this.openDelete.bind(this);
        this.closeDelete = this.closeDelete.bind(this);
        this.changeSource = this.changeSource.bind(this);
        this.changeVerticalGrid = this.changeVerticalGrid.bind(this);
        this.changeHorizontalGrid = this.changeHorizontalGrid.bind(this);
        this.changeXAxis = this.changeXAxis.bind(this);
        this.changeYAxis = this.changeYAxis.bind(this);
        this.changeLegend = this.changeLegend.bind(this);
        this.changeLegendPosition = this.changeLegendPosition.bind(this);
        this.changeMaxValues = this.changeMaxValues.bind(this);
        this.changeNames = this.changeNames.bind(this);
        this.changeTypes = this.changeTypes.bind(this);
        this.changeTopics = this.changeTopics.bind(this);
        this.changeVariables = this.changeVariables.bind(this);
        this.changeColors = this.changeColors.bind(this);
        this.changeSmooths = this.changeSmooths.bind(this);
        this.clone = this.clone.bind(this);
        this.resize = this.resize.bind(this);
        this.addPlot = this.addPlot.bind(this);
        this.removePlot = this.removePlot.bind(this);
        this.back = this.back.bind(this);
        this.openPlotPopup = this.openPlotPopup.bind(this);
    }

    // Returns an object containing values that should be added to the component's state based on the new props. 
    // In this case, the returned object contains the values of the id, name and url props, with default values used
    // if the props are not defined.
    static getDerivedStateFromProps(props) {
        return {
            id: props.id,
            availableSources: props.availableSources,
            name: props.initialState.name || 'Plot Viewer',
            source: props.initialState.source || 'Select source',
            verticalGrid: props.initialState.verticalGrid || true,
            horizontalGrid: props.initialState.horizontalGrid || true,
            xAxis: props.initialState.xAxis || true,
            yAxis: props.initialState.yAxis || true,
            legend: props.initialState.legend || true,
            legendPosition: props.initialState.legendPosition || 'topRight',
            maxValues: props.initialState.maxValues || -1,
            names: props.initialState.names || ['Plot 1'],
            types: props.initialState.types || ['line'],
            topics: props.initialState.topics || [''],
            variables: props.initialState.variables || [''],
            colors: props.initialState.colors || ['#FF9D66'],
            smooths: props.initialState.smooths || [false]
        };
    }

    // eslint-disable-next-line class-methods-use-this
    generateValues() {
        const today = new Date();
        const data = [];
        for (let i = 0; i < Math.floor(Math.random() * (10 - 5) + 5); i += 1) {
            data.push({x: (new Date(today.getTime() + (Math.floor(Math.random() * (10 - 5) + 5) * 60 * 1000))).getTime(), y: Math.random()});
        }
        return data;
    }

    // Appears to take in a key and a value argument and call the updateItem function with the
    // component's id state variable, the key and the value as arguments.
    sendUpdate(key, value) {
        const {id} = this.state;
        this.updateItem(id, key, value);
    }

    // Sets the deletePopupOpen state variable to false and then calls the deleteItem function with the component's 
    // id state variable as an argument.
    delete() {
        const {id} = this.state;
        this.setState({deletePopupOpen: false});
        this.deleteItem(id);
    }

    // Updates the name 
    changeName(value) {
        this.sendUpdate('name', value);
    }

    // Opens the pop up and sets values to popoverOpen and tempUrl etc.
    openPopup() {
        const {source, verticalGrid, horizontalGrid, xAxis, yAxis, legend, legendPosition, maxValues, names, types, topics, variables, colors, smooths} = this.state;
        this.setState({
            popoverOpen: true,
            tempSource: source,
            tempVerticalGrid: verticalGrid,
            tempHorizontalGrid: horizontalGrid,
            tempXAxis: xAxis,
            tempYAxis: yAxis,
            tempLegend: legend,
            tempLegendPosition: legendPosition,
            tempMaxValues: maxValues,
            tempNames: [...names],
            tempTypes: [...types],
            tempTopics: [...topics],
            tempVariables: [...variables],
            tempColors: [...colors],
            tempSmooths: [...smooths]
        });
    }

    // Closes the pop up and sets values to popoverOpen and tempUrl etc.
    closePopup() {
        this.setState({
            popoverOpen: false,
            plotPopoverOpen: false,
            plotSelected: null,
            tempSource: 'Select source',
            tempVerticalGrid: true,
            tempHorizontalGrid: true,
            tempXAxis: true,
            tempYAxis: true,
            tempLegend: true,
            tempLegendPosition: 'topRight',
            tempMaxValues: -1,
            tempNames: ['Plot 1'],
            tempTypes: 'line',
            tempTopics: [''],
            tempVariables: [''],
            tempColors: ['#FF9D66'],
            tempSmooths: [false]
        });
    }

    // Update the url state variable based on the value of the tempUrl state variable and set the popoverOpen state variable to false etc.
    closeConfirmPopup() {
        const {tempSource, tempVerticalGrid, tempHorizontalGrid, tempXAxis, tempYAxis, tempLegend, tempLegendPosition, tempMaxValues, tempNames, tempTypes, tempTopics, tempVariables, tempColors, tempSmooths} = this.state;
        this.sendUpdate('source', tempSource);
        this.sendUpdate('verticalGrid', tempVerticalGrid);
        this.sendUpdate('horizontalGrid', tempHorizontalGrid);
        this.sendUpdate('xAxis', tempXAxis);
        this.sendUpdate('yAxis', tempYAxis);
        this.sendUpdate('legend', tempLegend);
        this.sendUpdate('legendPosition', tempLegendPosition);
        this.sendUpdate('maxValues', tempMaxValues);
        this.sendUpdate('names', tempNames);
        this.sendUpdate('types', tempTypes);
        this.sendUpdate('topics', tempTopics);
        this.sendUpdate('variables', tempVariables);
        this.sendUpdate('colors', tempColors);
        this.sendUpdate('smooths', tempSmooths);
        this.setState({popoverOpen: false, plotPopoverOpen: false, plotSelected: null});
    }

    // Sets the deletePopupOpen state variable to true.
    openDelete() {
        this.setState({deletePopupOpen: true});
    }

    // Sets the deletePopupOpen state variable to false
    closeDelete() {
        this.setState({deletePopupOpen: false});
    }

    // Sets the plotPopoverOpen and plotSelected properties of the component's state and sets the popoverOpen property to false
    openPlotPopup(ind) {
        this.setState({popoverOpen: false, plotPopoverOpen: true, plotSelected: ind});
    }

    // Updates the tempSource property in the component's state
    changeSource(value) {
        this.setState({tempSource: value});
    }

    // Toggles the tempVerticalGrid property in the component's state
    changeVerticalGrid() {
        const {tempVerticalGrid} = this.state;
        this.setState({tempVerticalGrid: !tempVerticalGrid});
    }

    // Toggles the tempHorizontalGrid property in the component's state
    changeHorizontalGrid() {
        const {tempHorizontalGrid} = this.state;
        this.setState({tempHorizontalGrid: !tempHorizontalGrid});
    }

    // Toggles the tempXAxis property in the component's state
    changeXAxis() {
        const {tempXAxis} = this.state;
        this.setState({tempXAxis: !tempXAxis});
    }

    // Toggles the tempYAxis property in the component's state
    changeYAxis() {
        const {tempYAxis} = this.state;
        this.setState({tempYAxis: !tempYAxis});
    }

    // Toggles the tempLegend property in the component's state
    changeLegend() {
        const {tempLegend} = this.state;
        this.setState({tempLegend: !tempLegend});
    }
    // Updates the tempLegendPosition property in the component's state
    changeLegendPosition(position) {
        this.setState({tempLegendPosition: position});
    }

    // Updates the tempMaxValues property in the component's state
    changeMaxValues(value) {
        this.setState({tempMaxValues: value});
    }

    // Updates the value of an element in the tempNames array in the component's state
    changeNames(event, ind) {
        const {tempNames} = this.state;
        tempNames[ind] = event.target.value;
        this.setState({tempNames});
    }

    // Updates the value of an element in the tempTypes array in the component's state
    changeTypes(value, ind) {
        const {tempTypes} = this.state;
        tempTypes[ind] = value;
        this.setState({tempTypes});
    }

    // Change the state based on user input.
    changeTopics(event, ind) {
        const {tempTopics} = this.state;
        tempTopics[ind] = event.target.value;
        this.setState({tempTopics});
    }

    // Change the state variables based on user input.
    changeVariables(event, ind) {
        const {tempVariables} = this.state;
        tempVariables[ind] = event.target.value;
        this.setState({tempVariables});
    }

    // Updates the value of an element in the tempColors array in the component's state with the value of an event target
    changeColors(event, ind) {
        const {tempColors} = this.state;
        tempColors[ind] = event.target.value;
        this.setState({tempColors});
    }

    // Toggles the value of an element in the tempSmooths array in the component's state
    changeSmooths(ind) {
        const {tempSmooths} = this.state;
        tempSmooths[ind] = !(tempSmooths[ind]);
        this.setState({tempSmooths});
    }

    // Close a popup and call the cloneComponent function with the value of the id state variable as an argument.
    clone() {
        const {id} = this.state;
        this.closePopup();
        this.cloneComponent(id);
    }

    // Resize the state according to width and height
    resize(width, height) {
        this.setState({width, height});
    }

    // Adds a new plot to the plot viewer component by appending to the tempNames, tempTypes, tempTopics, tempVariables, tempColors
    // and tempSmooths arrays in the component's state and then closes the confirm popup
    addPlot() {
        const {tempNames, tempTypes, tempTopics, tempVariables, tempColors, tempSmooths} = this.state;
        tempNames.push(`Plot ${tempNames.length + 1}`);
        tempTypes.push('line');
        tempTopics.push('');
        tempVariables.push('');
        tempColors.push('#FF9D66');
        tempSmooths.push(false);
        this.setState({
            tempNames,
            tempTypes,
            tempTopics,
            tempVariables,
            tempColors,
            tempSmooths
        }, this.closeConfirmPopup);
    }

    // Removes a plot from the plot viewer component by splicing the corresponding elements from the tempNames, 
    // tempTypes, tempTopics, tempVariables, tempColors and tempSmooths arrays in the component's state and then closes the confirm popup
    removePlot(ind) {
        const {tempNames, tempTypes, tempTopics, tempVariables, tempColors, tempSmooths} = this.state;
        tempNames.splice(ind, 1);
        tempTypes.splice(ind, 1);
        tempTopics.splice(ind, 1);
        tempVariables.splice(ind, 1);
        tempColors.splice(ind, 1);
        tempSmooths.splice(ind, 1);
        this.setState({
            tempNames,
            tempTypes,
            tempTopics,
            tempVariables,
            tempColors,
            tempSmooths
        }, this.closeConfirmPopup);
    }

    // Sets the plotPopoverOpen property to false and the plotSelected property to null and sets the popoverOpen property to true
    back() {
        this.setState({popoverOpen: true, plotPopoverOpen: false, plotSelected: null});
    }

    // Render the plot. First by getting some values from this.state, which is an object that contains several pieces of state for the component.
    // These values are then used in the JSX element that is returned, which is a div element with several nested elements inside it. Some of 
    // these elements are custom or external components and style it. The timeSpan, minint, meanint and maxint states are used to render a Tooltip 
    // component, which is a custom or external component that displays additional information when hovered over. 
    render() {
        const {id, availableSources, name, verticalGrid, horizontalGrid, xAxis, yAxis, legend, legendPosition, names, types, colors, smooths, popoverOpen, plotPopoverOpen, plotSelected, deletePopupOpen, tempSource, tempVerticalGrid, tempHorizontalGrid, tempXAxis, tempYAxis, tempLegend, tempLegendPosition, tempMaxValues, tempNames, tempTypes, tempTopics, tempVariables, tempColors, tempSmooths, width, height, lastDrawLocation} = this.state;

        const legendItems = [];
        names.forEach((n, ind) => {
            legendItems.push({title: n, color: colors[ind]});
        });

        const plotValues = [];
        names.forEach(() => {
            plotValues.push(this.generateValues());
        });

        const xTickValues = [];
        plotValues.forEach((pV) => {
            pV.forEach((v) => {
                xTickValues.push(v.x);
            });
        });

        const plots = [];
        names.forEach((__n, ind) => {
            switch (types[ind]) {
            case 'line':
                plots.push(<LineSeries data={plotValues[ind].sort((a, b) => (a.x - b.x))} color={colors[ind]} animation="gentle" curve={smooths[ind] ? 'curveMonotoneX' : ''} />);
                break;
            case 'bar':
                plots.push(<VerticalBarSeries data={plotValues[ind]} color={colors[ind]} animation="gentle" barWidth={0.2} />);
                break;
            default:
            }
        });

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
                    <div onMouseDown={(e) => e.stopPropagation()}>
                        <EditableText className="name-edit" onChange={this.changeName} onMouseDown={(e) => e.stopPropagation()} placeholder="Component Name" value={name} />
                    </div>
                    <div
                        style={{
                            height: '100%',
                            position: 'absolute',
                            top: '0px',
                            right: '2%',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{paddingRight: '5px'}}>
                            <Tooltip content="Clone component" popoverClassName="item-info-tooltip">
                                <FontAwesomeIcon icon={faClone} style={{color: 'white', fontSize: '13px', cursor: 'pointer'}} onClick={this.clone} />
                            </Tooltip>
                        </div>
                        <FontAwesomeIcon icon={faCog} style={{color: 'white', cursor: 'pointer'}} onClick={this.openPopup} />
                    </div>
                    <div
                        style={{
                            height: '100%',
                            position: 'absolute',
                            top: '0px',
                            left: '2%',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <FontAwesomeIcon icon={faTrashAlt} style={{color: '#DE162F', cursor: 'pointer'}} onClick={this.openDelete} />
                    </div>
                </div>
                <ReactResizeDetector onResize={this.resize}>
                    {() => (
                        <div
                            id={`plotDiv_${id}`}
                            style={{
                                width: '100%',
                                height: 'calc(100% - 35px)',
                                marginTop: '10px',
                                overflowY: 'auto'
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <XYPlot
                                height={height}
                                width={width}
                                margin={{bottom: 60}}
                                xDomain={
                                    lastDrawLocation && [
                                        lastDrawLocation.left,
                                        lastDrawLocation.right
                                    ]
                                }
                                yDomain={
                                    lastDrawLocation && [
                                        lastDrawLocation.bottom,
                                        lastDrawLocation.top
                                    ]
                                }
                            >
                                {verticalGrid && <VerticalGridLines />}
                                {horizontalGrid && <HorizontalGridLines />}
                                {plots}
                                <Borders style={{
                                    bottom: {fill: '#fff'},
                                    left: {fill: '#fff'},
                                    right: {fill: '#fff'},
                                    top: {fill: '#fff'}
                                }}
                                />
                                {xAxis && <XAxis tickFormat={(v) => formatDate(v)} tickLabelAngle={-45} tickValues={xTickValues} />}
                                {yAxis && <YAxis />}
                                {legend
                                && (
                                    <DiscreteColorLegend
                                        items={legendItems}
                                        style={{
                                            position: 'absolute',
                                            top: ((legendPosition === 'topRight') || (legendPosition === 'topLeft')) ? '0px' : '',
                                            bottom: ((legendPosition === 'bottomRight') || (legendPosition === 'bottomLeft')) ? '0px' : '',
                                            left: ((legendPosition === 'topLeft') || (legendPosition === 'bottomLeft')) ? '0px' : '',
                                            right: ((legendPosition === 'topRight') || (legendPosition === 'bottomRight')) ? '0px' : ''
                                        }}
                                    />
                                )}
                                <Highlight
                                    onBrushEnd={(area) => this.setState({lastDrawLocation: area})}
                                    onDrag={(area) => {
                                        this.setState({
                                            lastDrawLocation: {
                                                bottom: lastDrawLocation.bottom + (area.top - area.bottom),
                                                left: lastDrawLocation.left - (area.right - area.left),
                                                right: lastDrawLocation.right - (area.right - area.left),
                                                top: lastDrawLocation.top + (area.top - area.bottom)
                                            }
                                        });
                                    }}
                                />
                            </XYPlot>
                        </div>
                    )}
                </ReactResizeDetector>
            </div>,
            <PortalOverflowOverlay key="settings" id="settings" isOpen={popoverOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    {`${name} Settings`}
                </FormHeader>
                <SettingsDiv>
                    <Popover popoverClassName="custom-popover">
                        <BlueBorderButton type="button" width="410px" rightIcon="caret-down">
                            {tempSource}
                        </BlueBorderButton>
                        <Menu>
                            {availableSources.map((s) => (
                                <MenuItem text={s} onClick={() => this.changeSource(s)} />
                            ))}
                        </Menu>
                    </Popover>
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <div
                            style={{
                                width: '70%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            Vertical Grid:
                        </div>
                        <div
                            style={{
                                width: '30%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Switch
                                className="custom-switch"
                                large
                                checked={tempVerticalGrid}
                                onChange={this.changeVerticalGrid}
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <div
                            style={{
                                width: '70%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            Horizontal Grid:
                        </div>
                        <div
                            style={{
                                width: '30%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Switch
                                className="custom-switch"
                                large
                                checked={tempHorizontalGrid}
                                onChange={this.changeHorizontalGrid}
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <div
                            style={{
                                width: '70%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            x-Axis:
                        </div>
                        <div
                            style={{
                                width: '30%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Switch
                                className="custom-switch"
                                large
                                checked={tempXAxis}
                                onChange={this.changeXAxis}
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <div
                            style={{
                                width: '70%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            y-Axis:
                        </div>
                        <div
                            style={{
                                width: '30%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Switch
                                className="custom-switch"
                                large
                                checked={tempYAxis}
                                onChange={this.changeYAxis}
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <div
                            style={{
                                width: '70%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            Show Legend:
                        </div>
                        <div
                            style={{
                                width: '30%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Switch
                                className="custom-switch"
                                large
                                checked={tempLegend}
                                onChange={this.changeLegend}
                            />
                        </div>
                    </div>
                    {tempLegend
                    && (
                        <div
                            style={{
                                width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                            }}
                        >
                            <div
                                style={{
                                    width: '70%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                                }}
                            >
                                Legend Position:
                            </div>
                            <div
                                style={{
                                    width: '30%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Popover popoverClassName="custom-popover">
                                    <BlueBorderButton type="button" width="100%" rightIcon="caret-down">
                                        {legendPositions[tempLegendPosition]}
                                    </BlueBorderButton>
                                    <Menu>
                                        {Object.keys(legendPositions).map((lP) => (
                                            <MenuItem text={legendPositions[lP]} onClick={() => this.changeLegendPosition(lP)} />
                                        ))}
                                    </Menu>
                                </Popover>
                            </div>
                        </div>
                    )}
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <div
                            style={{
                                width: '70%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            Max number of values (-1 for no limit):
                        </div>
                        <div
                            style={{
                                width: '30%', height: '100%', marginLeft: 'auto', display: 'flex', alignItems: 'center'
                            }}
                        >
                            <NumericInput
                                className="numeric-input"
                                clampValueOnBlur
                                minorStepSize={1}
                                onValueChange={this.changeMaxValues}
                                placeholder="Max"
                                stepSize={1}
                                majorStepSize={10}
                                min={-1}
                                defaultValue={+tempMaxValues.toFixed(0)}
                                fill
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', display: 'flex', alignItems: 'center', marginTop: '10px', justifyContent: 'center'
                        }}
                    >
                        <Popover popoverClassName="custom-popover">
                            <BlueBorderButton type="button" width="100%" rightIcon="caret-down">
                                Change Plot Settings
                            </BlueBorderButton>
                            <Menu>
                                {names.map((t, ind) => (
                                    <MenuItem text={t} onClick={() => this.openPlotPopup(ind)} />
                                ))}
                            </Menu>
                        </Popover>
                    </div>
                    <div
                        style={{
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <OrangeButton
                            id="add"
                            type="button"
                            onClick={this.addPlot}
                        >
                            Add Plot
                        </OrangeButton>
                    </div>
                    <div
                        style={{
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <BlueBorderButton
                            id="cancel"
                            type="button"
                            onClick={this.closePopup}
                        >
                            Cancel
                        </BlueBorderButton>
                        <BlueButton
                            id="save"
                            type="button"
                            onClick={this.closeConfirmPopup}
                        >
                            Save
                        </BlueButton>
                    </div>
                </SettingsDiv>
            </PortalOverflowOverlay>,
            <PortalOverflowOverlay key="plot-settings" id="plot-settings" isOpen={plotPopoverOpen} width="450px" height="auto" background="white" borderRadius="10px" padding="20px" marginLeft="auto" marginRight="auto" color="black">
                <FormHeader>
                    {`${name} Settings`}
                </FormHeader>
                <FormSubHeader>
                    {names[plotSelected]}
                </FormSubHeader>
                <SettingsDiv>
                    <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
                        <div
                            style={{
                                width: '50%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                            }}
                        >
                            Plot Name:
                        </div>
                        <div style={{width: '50%', height: '100%', display: 'flex', alignItems: 'center'}}>
                            <InputGroup
                                leftIcon="label"
                                placeholder="Plot Name"
                                onChange={(event) => this.changeNames(event, plotSelected)}
                                value={tempNames[plotSelected]}
                                fill
                                large
                            />
                        </div>
                    </div>
                    <Popover popoverClassName="custom-popover">
                        <BlueBorderButton type="button" width="410px" rightIcon="caret-down" marginTop="10px">
                            {plotTypes[tempTypes[plotSelected]]}
                        </BlueBorderButton>
                        <Menu>
                            {Object.keys(plotTypes).map((plT) => (
                                <MenuItem text={plotTypes[plT]} onClick={() => this.changeTypes(plT, plotSelected)} />
                            ))}
                        </Menu>
                    </Popover>
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <InputGroup
                            leftIcon="tag"
                            placeholder="Topic"
                            onChange={(event) => this.changeTopics(event, plotSelected)}
                            value={tempTopics[plotSelected]}
                            fill
                            large
                        />
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <InputGroup
                            leftIcon="tag"
                            placeholder="Variable"
                            onChange={(event) => this.changeVariables(event, plotSelected)}
                            value={tempVariables[plotSelected]}
                            fill
                            large
                        />
                    </div>
                    <div
                        style={{
                            width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <InputGroup
                            leftIcon="tag"
                            placeholder="Color"
                            onChange={(event) => this.changeColors(event, plotSelected)}
                            value={tempColors[plotSelected]}
                            fill
                            large
                        />
                    </div>
                    {tempTypes[plotSelected] === 'line'
                    && (
                        <div
                            style={{
                                width: '100%', height: '100%', marginTop: '10px', display: 'flex', alignItems: 'center'
                            }}
                        >
                            <div
                                style={{
                                    width: '60%', height: '100%', display: 'flex', alignItems: 'center', color: '#16335B', fontSize: '16px'
                                }}
                            >
                                Smooth line:
                            </div>
                            <div
                                style={{
                                    width: '40%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Switch
                                    className="custom-switch"
                                    large
                                    checked={tempSmooths[plotSelected]}
                                    onChange={() => this.changeSmooths(plotSelected)}
                                />
                            </div>
                        </div>
                    )}
                    <div
                        style={{
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <OrangeButton
                            id="add"
                            type="button"
                            width="150px"
                            onClick={() => this.removePlot(plotSelected)}
                        >
                            Remove Plot
                        </OrangeButton>
                    </div>
                    <div
                        style={{
                            width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginTop: '10px'
                        }}
                    >
                        <BlueBorderButton
                            id="cancel"
                            type="button"
                            onClick={this.closePopup}
                        >
                            Cancel
                        </BlueBorderButton>
                        <BlueBorderButton
                            id="back"
                            type="button"
                            marginLeft="10px"
                            onClick={this.back}
                        >
                            Back
                        </BlueBorderButton>
                        <BlueButton
                            id="save"
                            type="button"
                            marginLeft="10px"
                            onClick={this.closeConfirmPopup}
                        >
                            Save
                        </BlueButton>
                    </div>
                </SettingsDiv>
            </PortalOverflowOverlay>,
            <Alert key="delete-alert" style={{background: 'white', color: 'black'}} usePortal cancelButtonText="Cancel" confirmButtonText="Delete" icon="trash" intent="danger" isOpen={deletePopupOpen} onCancel={this.closeDelete} onConfirm={this.delete}>
                <p>
                    Are you sure you want to delete the component
                    <b style={{marginLeft: '5px'}}>{name}</b>
                    ?
                </p>
            </Alert>
        ]);
    }
}

// Takes the arguments id, type, initialState etc and pass them to Plot. The values are determined by the values 
// of the properties in the object passed to createPlot.
const createPlot = ({id, type, initialState, updateItem, deleteItem, cloneComponent, sources}) => (
    <Plot
        id={id}
        type={type}
        initialState={initialState}
        updateItem={updateItem}
        deleteItem={deleteItem}
        cloneComponent={cloneComponent}
        availableSources={sources}
    />
);

// Default export createImage
export default createPlot;
