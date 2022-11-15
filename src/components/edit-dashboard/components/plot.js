/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */
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

const FormSubHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    font-size: 18px;
    color: #16335B;
`;

const SettingsDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const legendPositions = {
    topLeft: 'Top-Left',
    topRight: 'Top-Right',
    bottomLeft: 'Bottom-Left',
    bottomRight: 'Bottom-Right'
};

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

const plotTypes = {
    line: 'Line chart',
    bar: 'Bar chart'
};

class Plot extends React.Component {
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

    sendUpdate(key, value) {
        const {id} = this.state;
        this.updateItem(id, key, value);
    }

    delete() {
        const {id} = this.state;
        this.setState({deletePopupOpen: false});
        this.deleteItem(id);
    }

    changeName(value) {
        this.sendUpdate('name', value);
    }

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

    openDelete() {
        this.setState({deletePopupOpen: true});
    }

    closeDelete() {
        this.setState({deletePopupOpen: false});
    }

    openPlotPopup(ind) {
        this.setState({popoverOpen: false, plotPopoverOpen: true, plotSelected: ind});
    }

    changeSource(value) {
        this.setState({tempSource: value});
    }

    changeVerticalGrid() {
        const {tempVerticalGrid} = this.state;
        this.setState({tempVerticalGrid: !tempVerticalGrid});
    }

    changeHorizontalGrid() {
        const {tempHorizontalGrid} = this.state;
        this.setState({tempHorizontalGrid: !tempHorizontalGrid});
    }

    changeXAxis() {
        const {tempXAxis} = this.state;
        this.setState({tempXAxis: !tempXAxis});
    }

    changeYAxis() {
        const {tempYAxis} = this.state;
        this.setState({tempYAxis: !tempYAxis});
    }

    changeLegend() {
        const {tempLegend} = this.state;
        this.setState({tempLegend: !tempLegend});
    }

    changeLegendPosition(position) {
        this.setState({tempLegendPosition: position});
    }

    changeMaxValues(value) {
        this.setState({tempMaxValues: value});
    }

    changeNames(event, ind) {
        const {tempNames} = this.state;
        tempNames[ind] = event.target.value;
        this.setState({tempNames});
    }

    changeTypes(value, ind) {
        const {tempTypes} = this.state;
        tempTypes[ind] = value;
        this.setState({tempTypes});
    }

    changeTopics(event, ind) {
        const {tempTopics} = this.state;
        tempTopics[ind] = event.target.value;
        this.setState({tempTopics});
    }

    changeVariables(event, ind) {
        const {tempVariables} = this.state;
        tempVariables[ind] = event.target.value;
        this.setState({tempVariables});
    }

    changeColors(event, ind) {
        const {tempColors} = this.state;
        tempColors[ind] = event.target.value;
        this.setState({tempColors});
    }

    changeSmooths(ind) {
        const {tempSmooths} = this.state;
        tempSmooths[ind] = !(tempSmooths[ind]);
        this.setState({tempSmooths});
    }

    clone() {
        const {id} = this.state;
        this.closePopup();
        this.cloneComponent(id);
    }

    resize(width, height) {
        this.setState({width, height});
    }

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

    back() {
        this.setState({popoverOpen: true, plotPopoverOpen: false, plotSelected: null});
    }

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

export default createPlot;
