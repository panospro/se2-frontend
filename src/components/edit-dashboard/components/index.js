import iframeIcon from '../../../assets/components/iframe.png';
import iframeHoverIcon from '../../../assets/components/iframeHover.png';
import gaugeIcon from '../../../assets/components/gauge.png';
import gaugeHoverIcon from '../../../assets/components/gaugeHover.png';
import imageIcon from '../../../assets/components/image.png';
import imageHoverIcon from '../../../assets/components/imageHover.png';
import logsIcon from '../../../assets/components/logs.png';
import logsHoverIcon from '../../../assets/components/logsHover.png';
import buttonsIcon from '../../../assets/components/buttons.png';
import buttonsHoverIcon from '../../../assets/components/buttonsHover.png';
import valueIcon from '../../../assets/components/value.png';
import valueHoverIcon from '../../../assets/components/valueHover.png';
import aliveIcon from '../../../assets/components/alive.png';
import aliveHoverIcon from '../../../assets/components/aliveHover.png';
import navigationIcon from '../../../assets/components/navigation.png';
import navigationHoverIcon from '../../../assets/components/navigationHover.png';
import jsonIcon from '../../../assets/components/json.png';
import jsonHoverIcon from '../../../assets/components/jsonHover.png';
import plotIcon from '../../../assets/components/plot.png';
import plotHoverIcon from '../../../assets/components/plotHover.png';
import textIcon from '../../../assets/components/text.png';
import textHoverIcon from '../../../assets/components/textHover.png';
import urlIcon from '../../../assets/components/url.png';
import urlHoverIcon from '../../../assets/components/urlHover.png';
import restIcon from '../../../assets/components/rest.png';
import restHoverIcon from '../../../assets/components/restHover.png';
import restRequestIcon from '../../../assets/components/restRequest.png';
import restRequestHoverIcon from '../../../assets/components/restRequestHover.png';
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

const components = {
    iframe: {
        icon: iframeIcon,
        iconHover: iframeHoverIcon,
        component: createIframe,
        props: {
            name: 'Iframe',
            url: ''
        },
        header: 'Iframe',
        text: 'An iframe in which you can pass any url to display',
        minW: 1,
        minH: 1,
        startW: 6,
        startH: 4,
        category: 'web'
    },
    gauge: {
        icon: gaugeIcon,
        iconHover: gaugeHoverIcon,
        component: createGauge,
        props: {
            name: 'Gauge',
            source: 'Select source',
            topic: '',
            variable: '',
            minValue: 0,
            maxValue: 100,
            leftColor: '#7ABF43',
            rightColor: '#DE162F',
            levels: 20,
            hideText: false,
            unit: '%'
        },
        header: 'Gauge',
        text: 'A gauge in which you can preview a value from a broker topic',
        minW: 1,
        minH: 1,
        startW: 5,
        startH: 4,
        category: 'broker'
    },
    image: {
        icon: imageIcon,
        iconHover: imageHoverIcon,
        component: createImage,
        props: {
            name: 'Image',
            source: 'Select source',
            topic: '',
            variable: '',
        },
        header: 'Image',
        text: 'A component in which you can preview an image from a broker topic',
        minW: 1,
        minH: 1,
        startW: 5,
        startH: 4,
        category: 'broker'
    },
    logs: {
        icon: logsIcon,
        iconHover: logsHoverIcon,
        component: createLogs,
        props: {
            name: 'Logs',
            source: 'Select source',
            topic: '',
            variable: '',
            maxMessages: -1,
            colorKeys: [],
            colorValues: []
        },
        header: 'Logs',
        text: 'A component in which you can preview logs coming from a broker topic',
        minW: 1,
        minH: 1,
        startW: 5,
        startH: 4,
        category: 'broker'
    },
    buttons: {
        icon: buttonsIcon,
        iconHover: buttonsHoverIcon,
        component: createButtons,
        props: {
            name: 'Buttons',
            alignText: 'center',
            buttonsAlign: 'horizontal',
            texts: ['Button 1'],
            sources: ['Select source'],
            topics: [''],
            payloads: ['{}'],
            isDynamic: [false],
            colors: ['white'],
            backgrounds: ['#FF9D66'],
            backgroundsHover: ['#ff7e33']
        },
        header: 'Buttons',
        text: 'A set of buttons with which you can send messages through a broker topic',
        minW: 1,
        minH: 1,
        startW: 3,
        startH: 3,
        category: 'broker'
    },
    value: {
        icon: valueIcon,
        iconHover: valueHoverIcon,
        component: createValue,
        props: {
            name: 'Value',
            source: 'Select source',
            topic: '',
            variable: '',
            unit: '%'
        },
        header: 'Value',
        text: 'A component in which you can preview a value from a broker topic',
        minW: 1,
        minH: 1,
        startW: 3,
        startH: 3,
        category: 'broker'
    },
    alive: {
        icon: aliveIcon,
        iconHover: aliveHoverIcon,
        component: createAlive,
        props: {
            name: 'Alive',
            source: 'Select source',
            topic: '',
            timeout: 1000
        },
        header: 'Alive',
        text: 'A component in which you can check if a broker topic is alive',
        minW: 1,
        minH: 1,
        startW: 3,
        startH: 3,
        category: 'broker'
    },
    navigationRoute: {
        icon: navigationIcon,
        iconHover: navigationHoverIcon,
        component: createNavigationRoute,
        props: {
            name: 'Navigation Route',
            source: 'Select source',
            mapTopic: '',
            requestMapTopic: '',
            changeAnnotationsTopic: '',
            setAnnotationGoalTopic: '',
            setGoalTopic: '',
            getAnnotationsTopic: '',
            requestAnnotationsTopic: '',
            cancelGoalTopic: '',
            poseTopic: '',
            pathTopic: ''
        },
        header: 'Navigation Route',
        text: 'A component in which you can preview a map from a broker topic and navigate the robot on it',
        minW: 1,
        minH: 1,
        startW: 5,
        startH: 4,
        category: 'navigation'
    },
    json: {
        icon: jsonIcon,
        iconHover: jsonHoverIcon,
        component: createJson,
        props: {
            name: 'Json Viewer',
            source: 'Select source',
            topic: '',
            variable: ''
        },
        header: 'Json Viewer',
        text: 'A component in which you can preview a json object from a broker topic',
        minW: 1,
        minH: 1,
        startW: 5,
        startH: 4,
        category: 'broker'
    },
    plot: {
        icon: plotIcon,
        iconHover: plotHoverIcon,
        component: createPlot,
        props: {
            name: 'Plot Viewer',
            source: 'Select source',
            verticalGrid: true,
            horizontalGrid: true,
            xAxis: true,
            yAxis: true,
            legend: true,
            legendPosition: 'topRight',
            maxValues: -1,
            names: ['Plot 1'],
            types: ['line'],
            topics: [''],
            variables: [''],
            colors: ['#FF9D66'],
            smooths: [false]
        },
        header: 'Plot Viewer',
        text: 'A component in which you can preview a value from a broker topic over time',
        minW: 1,
        minH: 1,
        startW: 5,
        startH: 4,
        category: 'broker'
    },
    text: {
        icon: textIcon,
        iconHover: textHoverIcon,
        component: createText,
        props: {
            name: 'Text',
            text: ''
        },
        header: 'Text Box',
        text: 'A component in which you can preview a text',
        minW: 1,
        minH: 1,
        startW: 2,
        startH: 2,
        category: 'web'
    },
    url: {
        icon: urlIcon,
        iconHover: urlHoverIcon,
        component: createUrl,
        props: {
            name: 'Url',
            url: ''
        },
        header: 'Url Box',
        text: 'A component in which you can preview and use a url',
        minW: 1,
        minH: 1,
        startW: 2,
        startH: 2,
        category: 'web'
    },
    rest: {
        icon: restIcon,
        iconHover: restHoverIcon,
        component: createRest,
        props: {
            name: 'Rest Status',
            url: '',
            interval: 5000
        },
        header: 'Rest Status',
        text: 'Preview the status of a REST Get request',
        minW: 1,
        minH: 1,
        startW: 3,
        startH: 3,
        category: 'web'
    },
    restRequest: {
        icon: restRequestIcon,
        iconHover: restRequestHoverIcon,
        component: createRestRequest,
        props: {
            name: 'Rest Request',
            url: '',
            requestType: 'GET',
            fire: 'once',
            interval: 5000,
            headers: '',
            body: '',
            params: ''
        },
        header: 'Rest Request',
        text: 'Preview the response of a REST request',
        minW: 3,
        minH: 3,
        startW: 4,
        startH: 4,
        category: 'web'
    },
};

export default components;
