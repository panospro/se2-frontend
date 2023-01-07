/* eslint-disable max-len */

import {api, prefixUrl} from '../lib/api-adapter';

const generalApi = api.extend({prefixUrl: prefixUrl('general')});

// Sends a GET request to statistics to retrieve statistics data.
export const getStatistics = () => generalApi.get('statistics').json();

// Sends a GET request to test-url, with a query parameter containing a URL, to test the status of a URL.
export const getRestStatus = (url) => generalApi.get('test-url', {searchParams: {url}}).json();

// Sends a GET request to test-url-request, with query parameters containing a URL, type, headers, body, and params, 
// to test the status of a URL using a specific request type, headers, body, and params.
export const getRestRequestStatus = (url, type, headers, body, params) => generalApi.get('test-url-request', {
    searchParams: {
        url, type, headers, body, params
    }
}).json();
