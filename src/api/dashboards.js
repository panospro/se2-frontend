/* eslint-disable max-len*/

// import {api, prefixUrl} from '../lib/api-adapter';

// const dashboardsApi = api.extend({prefixUrl: prefixUrl('dashboards')});

// // Sends a GET request to dashboards to retrieve a list of dashboards.
// export const getDashboards = () => dashboardsApi.get('dashboards').json();

// // Sends a POST request to create-dashboard, with a JSON body containing data for the new dashboard, to create a new dashboard.
// export const createDashboard = (data) => dashboardsApi.post('create-dashboard', {json: data}).json();

// // Sends a POST request to delete-dashboard, with a JSON body containing the ID of the dashboard to delete, to delete a dashboard.
// export const deleteDashboard = (id) => dashboardsApi.post('delete-dashboard', {json: {id}}).json();

// // Sends a GET request to dashboard, with a query parameter containing the ID of the dashboard to retrieve, to get a specific dashboard.
// export const getDashboard = (id) => dashboardsApi.get('dashboard', {searchParams: {id}}).json();

// // Sends a POST request to save-dashboard, with a JSON body containing the ID, layout, items and next ID of the dashboard to save, to save a dashboard.
// export const saveDashboard = (id, layout, items, nextId) => dashboardsApi.post('save-dashboard', {json: {id, layout, items, nextId}}).json();

// // Sends a POST request to clone-dashboard, with a JSON body containing the ID and name of the dashboard to clone, to clone a dashboard.
// export const cloneDashboard = (dashboardId, name) => dashboardsApi.post('clone-dashboard', {json: {dashboardId, name}}).json();

// // Sends a POST request to check-password-needed, with a JSON body containing the user and dashboard ID, to check if a password is needed to access a dashboard.
// export const checkDashboardPasswordNeeded = (user, dashboardId) => dashboardsApi.post('check-password-needed', {json: {user, dashboardId}}).json();

// // Sends a POST request to check-password, with a JSON body containing the dashboard ID and password, to check if a password is correct for a dashboard.
// export const checkDashboardPassword = (dashboardId, password) => dashboardsApi.post('check-password', {json: {dashboardId, password}}).json();

// // Sends a POST request to share-dashboard, with a JSON body containing the dashboard ID, to select a dashboard to share.
// export const selectShareDashboard = (dashboardId) => dashboardsApi.post('share-dashboard', {json: {dashboardId}}).json();

// // Sends a POST request to change-password, with a JSON body containing the dashboard ID and password, to change the password of a dashboard.
// export const submitPassword = (dashboardId, password) => dashboardsApi.post('change-password', {json: {dashboardId, password}}).json();


import { api, prefixUrl } from '../lib/api-adapter';

// Initialize the dashboards API with the appropriate prefix URL.
const dashboardsApi = api.extend({ prefixUrl: prefixUrl('dashboards') });

/*
 * Retrieves a list of dashboards.
 * @returns {Promise} A promise that resolves with the list of dashboards.
*/
export const getDashboards = () => {
  return dashboardsApi.get('dashboards').json();
};

/*
 * Creates a new dashboard.
 * @param {Object} data - The data for the new dashboard.
 * @returns {Promise} A promise that resolves with the new dashboard.
*/
export const createDashboard = (data) => {
  return dashboardsApi.post('create-dashboard', { json: data }).json();
};

/*
 * Deletes a dashboard.
 * @param {string} id - The ID of the dashboard to delete.
 * @returns {Promise} A promise that resolves with the deleted dashboard.
*/
export const deleteDashboard = (id) => {
  return dashboardsApi.post('delete-dashboard', { json: { id } }).json();
};

/*
 * Retrieves a specific dashboard.
 * @param {string} id - The ID of the dashboard to retrieve.
 * @returns {Promise} A promise that resolves with the specified dashboard.
*/
export const getDashboard = (id) => {
  return dashboardsApi.get('dashboard', { searchParams: { id } }).json();
};

/*
 * Saves a dashboard.
 * @param {string} id - The ID of the dashboard to save.
 * @param {Object} layout - The layout of the dashboard.
 * @param {Array} items - The items on the dashboard.
 * @param {string} nextId - The next ID to use for the dashboard.
 * @returns {Promise} A promise that resolves with the saved dashboard.
*/
export const saveDashboard = (id, layout, items, nextId) => {
  const data = { id, layout, items, nextId };
  return dashboardsApi.post('save-dashboard', { json: data }).json();
};

/*
 * Clones a dashboard.
 * @param {string} dashboardId - The ID of the dashboard to clone.
 * @param {string} name - The name of the cloned dashboard.
 * @returns {Promise} A promise that resolves with the cloned dashboard.
*/
export const cloneDashboard = (dashboardId, name) => {
  const data = { dashboardId, name };
  return dashboardsApi.post('clone-dashboard', { json: data }).json();
};

/*
 * Checks if a password is needed to access a dashboard.
 * @param {string} user - The user attempting to access the dashboard.
 * @param {string} dashboardId - The ID of the dashboard to check.
 * @returns {Promise} A promise that resolves with a boolean indicating if a password is needed.
*/
export const checkDashboardPasswordNeeded = (user, dashboardId) => {
  const data = { user, dashboardId };
  return dashboardsApi.post('check-password-needed', { json: data }).json();
};

/*
 * Checks if a password is correct for a dashboard.
 * @param {string} dashboardId - The ID of the dashboard to check.
 * @param {string} password - The password to check.
 * @returns {Promise} A promise that resolves with a boolean indicating if the password is correct.
*/
export const checkDashboardPassword = (dashboardId, password) => {
    const data = { dashboardId, password };
    return dashboardsApi.post('check-password', { json: data }).json();
  };
  
  /*
   * Sets a password for a dashboard.
   * @param {string} dashboardId - The ID of the dashboard to set the password for.
   * @returns {Promise} A promise that resolves with the updated dashboard.
  */
  export const selectShareDashboard = (dashboardId) => {
    const data = { dashboardId };
    return dashboardsApi.post('share-dashboard', { json: data }).json();
  };
  
  /*
   * Clears the password for a dashboard.
   * @param {string} dashboardId - The ID of the dashboard to clear the password for.
   * @param {string} password - The password to set.
   * @returns {Promise} A promise that resolves with the updated dashboard.
  */
  export const submitPassword = (dashboardId, password) => {
    const data = { dashboardId, password };
    return dashboardsApi.post('change-password', { json: data }).json();
  };
  
