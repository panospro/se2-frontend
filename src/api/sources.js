/* eslint-disable max-len */
import {api, prefixUrl} from '../lib/api-adapter';

const sourcesApi = api.extend({prefixUrl: prefixUrl('sources')});

// Sends a GET request to sources to retrieve a list of sources.
export const getSources = () => sourcesApi.get('sources').json();

// Sends a POST request to create-source, with a JSON body containing data for the new source, to create a new source.
export const createSource = (data) => sourcesApi.post('create-source', {json: data}).json();

// Sends a POST request to change-source, with a JSON body containing data for the source and the old ID of the source, to change an existing source.
export const changeSource = (data, oldId) => sourcesApi.post('change-source', {json: {...data, id: oldId}}).json();

// Sends a POST request to delete-source, with a JSON body containing the ID of the source to delete, to delete a source.
export const deleteSource = (id) => sourcesApi.post('delete-source', {json: {id}}).json();

// Sends a POST request to source, with a JSON body containing the name, owner and user of the source to find, to find a specific source.
export const findSource = (name, owner, user) => sourcesApi.post('source', {json: {name, owner, user}}).json();

// Sends a POST request to check-sources, with a JSON body containing a list of sources to check, to check the status of a list of sources.
export const checkSource = (sources) => sourcesApi.post('check-sources', {json: {sources}}).json();