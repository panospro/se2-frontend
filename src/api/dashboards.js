/* eslint-disable max-len*/

import {api, prefixUrl} from '../lib/api-adapter';

// Initialize the dashboards API with the appropriate prefix URL.
const dashboardsApi = api.extend({prefixUrl: prefixUrl('dashboards')});

/*
 * Retrieves a list of dashboards.
 * @returns {Promise} A promise that resolves with the list of dashboards.
*/
export const getDashboards = () => dashboardsApi.get('dashboards').json();

/*
 * Creates a new dashboard.
 * @param {Object} data - The data for the new dashboard.
 * @returns {Promise} A promise that resolves with the new dashboard.
*/
export const createDashboard = (data) => dashboardsApi.post('create-dashboard', {json: data}).json();

/*
 * Deletes a dashboard.
 * @param {string} id - The ID of the dashboard to delete.
 * @returns {Promise} A promise that resolves with the deleted dashboard.
*/
export const deleteDashboard = (id) => dashboardsApi.post('delete-dashboard', {json: {id}}).json();

/*
 * Retrieves a specific dashboard.
 * @param {string} id - The ID of the dashboard to retrieve.
 * @returns {Promise} A promise that resolves with the specified dashboard.
*/
export const getDashboard = (id) => dashboardsApi.get('dashboard', {searchParams: {id}}).json();

/*
 * Saves a dashboard.
 * @param {string} id - The ID of the dashboard to save.
 * @param {Object} layout - The layout of the dashboard.
 * @param {Array} items - The items on the dashboard.
 * @param {string} nextId - The next ID to use for the dashboard.
 * @returns {Promise} A promise that resolves with the saved dashboard.
*/
export const saveDashboard = (id, layout, items, nextId) => dashboardsApi.post('save-dashboard', {json: {id, layout, items, nextId}}).json();

/*
 * Clones a dashboard.
 * @param {string} dashboardId - The ID of the dashboard to clone.
 * @param {string} name - The name of the cloned dashboard.
 * @returns {Promise} A promise that resolves with the cloned dashboard.
*/
export const cloneDashboard = (dashboardId, name) => dashboardsApi.post('clone-dashboard', {json: {dashboardId, name}}).json();

/*
 * Checks if a password is needed to access a dashboard.
 * @param {string} user - The user attempting to access the dashboard.
 * @param {string} dashboardId - The ID of the dashboard to check.
 * @returns {Promise} A promise that resolves with a boolean indicating if a password is needed.
*/
export const checkDashboardPasswordNeeded = (user, dashboardId) => dashboardsApi.post('check-password-needed', {json: {user, dashboardId}}).json();

/*
 * Checks if a password is correct for a dashboard.
 * @param {string} dashboardId - The ID of the dashboard to check.
 * @param {string} password - The password to check.
 * @returns {Promise} A promise that resolves with a boolean indicating if the password is correct.
*/
export const checkDashboardPassword = (dashboardId, password) => dashboardsApi.post('check-password', {json: {dashboardId, password}}).json();

/*
* Sets a password for a dashboard.
* @param {string} dashboardId - The ID of the dashboard to set the password for.
* @returns {Promise} A promise that resolves with the updated dashboard.
*/
export const selectShareDashboard = (dashboardId) => dashboardsApi.post('share-dashboard', {json: {dashboardId}}).json();

/*
* Clears the password for a dashboard.
* @param {string} dashboardId - The ID of the dashboard to clear the password for.
* @param {string} password - The password to set.
* @returns {Promise} A promise that resolves with the updated dashboard.
*/
export const submitPassword = (dashboardId, password) => dashboardsApi.post('change-password', {json: {dashboardId, password}}).json();

