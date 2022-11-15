/* eslint-disable max-len */
import {api, prefixUrl} from '../lib/api-adapter';

const sourcesApi = api.extend({prefixUrl: prefixUrl('sources')});

export const getSources = () => sourcesApi.get('sources').json();

export const createSource = (data) => sourcesApi.post('create-source', {json: data}).json();

export const changeSource = (data, oldId) => sourcesApi.post('change-source', {json: {...data, id: oldId}}).json();

export const deleteSource = (id) => sourcesApi.post('delete-source', {json: {id}}).json();

export const findSource = (name, owner, user) => sourcesApi.post('source', {json: {name, owner, user}}).json();

export const checkSource = (sources) => sourcesApi.post('check-sources', {json: {sources}}).json();
