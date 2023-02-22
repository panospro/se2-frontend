/* eslint-disable max-len */
import { api, prefixUrl } from '../lib/api-adapter';

// Initialize the sources API with the appropriate prefix URL.
const sourcesApi = api.extend({ prefixUrl: prefixUrl('sources') });

/*
 * Retrieves a list of sources.
 * Returns a promise that resolves with the list of sources.
 */
export const getSources = () => sourcesApi.get('sources').json();

/*
 * Creates a new source.
 * data - The data for the new source.
 * Returns a promise that resolves with the new source.
 */
export const createSource = (data) => sourcesApi.post('create-source', {json: data}).json();

/*
 * Changes an existing source.
 * data - The data for the source.
 * oldId - The old ID of the source.
 * Returns a promise that resolves with the changed source.
 */
export const changeSource = (data, oldId) => sourcesApi.post('change-source', {json: {...data, id: oldId}}).json();

/*
 * Deletes a source.
 * id - The ID of the source to delete.
 * Returns a promise that resolves with the deleted source.
 */
export const deleteSource = (id) => sourcesApi.post('delete-source', {json: {id}}).json();

/*
 * Finds a specific source.
 * name - The name of the source to find.
 * owner - The owner of the source to find.
 * user - The user of the source to find.
 * Returns a promise that resolves with the specified source.
 */
export const findSource = (name, owner, user) => sourcesApi.post('source', {json: {name, owner, user}}).json();

/*
 * Checks the status of a list of sources.
 * @param {Array} sources - The list of sources to check.
 * Returns a promise that resolves with the status of the sources.
 */
export const checkSource = (sources) => sourcesApi.post('check-sources', {json: {sources}}).json();