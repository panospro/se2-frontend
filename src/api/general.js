/* eslint-disable max-len */
import {api, prefixUrl} from '../lib/api-adapter';

const generalApi = api.extend({prefixUrl: prefixUrl('general')});

export const getStatistics = () => generalApi.get('statistics').json();

export const getRestStatus = (url) => generalApi.get('test-url', {searchParams: {url}}).json();

export const getRestRequestStatus = (url, type, headers, body, params) => generalApi.get('test-url-request', {
    searchParams: {
        url, type, headers, body, params
    }
}).json();
