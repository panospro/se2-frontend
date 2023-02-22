/* eslint-disable max-len */
import { api, prefixUrl } from '../lib/api-adapter';

// Initialize the sources API with the appropriate prefix URL.
const sourcesApi = api.extend({ prefixUrl: prefixUrl('sources') });

/**
 * Retrieves a list of sources.
 *
 * @returns {Promise} A Promise that resolves to the list of sources.
 */
export const getSources = () => sourcesApi.get('sources').json();

/**
 * Creates a new source.
 *
 * @param {Object} data - The data for the new source.
 * @returns {Promise} A Promise that resolves to the newly created source.
 */
export const createSource = (data) => sourcesApi.post('create-source', {json: data}).json();

/**
 * Changes an existing source.
 *
 * @param {Object} data - The new data for the source.
 * @param {string} oldId - The ID of the source to change.
 * @returns {Promise} A Promise that resolves to the updated source.
 */
export const changeSource = (data, oldId) => sourcesApi.post('change-source', {json: {...data, id: oldId}}).json();

/**
 * Deletes a source.
 *
 * @param {string} id - The ID of the source to delete.
 * @returns {Promise} A Promise that resolves to the deleted source.
 */
export const deleteSource = (id) => sourcesApi.post('delete-source', {json: {id}}).json();

/**
 * Finds a specific source.
 *
 * @param {string} name - The name of the source to find.
 * @param {string} owner - The owner of the source to find.
 * @param {string} user - The user of the source to find.
 * @returns {Promise} A Promise that resolves to the found source.
 */
export const findSource = (name, owner, user) => sourcesApi.post('source', {json: {name, owner, user}}).json();

/**
 * Checks the status of a list of sources.
 *
 * @param {Array} sources - The list of sources to check.
 * @returns {Promise} A Promise that resolves to the status of the sources.
 */
export const checkSource = (sources) => sourcesApi.post('check-sources', {json: {sources}}).json();