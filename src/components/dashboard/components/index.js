/*
*
* Importing the necessary modules
* e.g. React, modules from our code,
* external modules and etc.
*
*/ 
import createIframe from './iframe';
import createGauge from './gauge';
import createImage from './image';
import createLogs from './logs';
import createButtons from './buttons';
import createValue from './value';
import createAlive from './alive';
import createNavigationRoute from './navigation-route';
import createJson from './json';
import createPlot from './plot';
import createText from './text';
import createUrl from './url';
import createRest from './rest';
import createRestRequest from './rest-request';

// Set the values of the object components to the ones imported
const components = {
    iframe: {component: createIframe},
    gauge: {component: createGauge},
    image: {component: createImage},
    logs: {component: createLogs},
    buttons: {component: createButtons},
    value: {component: createValue},
    alive: {component: createAlive},
    navigationRoute: {component: createNavigationRoute},
    json: {component: createJson},
    plot: {component: createPlot},
    text: {component: createText},
    url: {component: createUrl},
    rest: {component: createRest},
    restRequest: {component: createRestRequest}
};

/*
*
* Default export
*
*/
// The export constant is: 
// components
export default components;
