/* eslint-disable max-len*/
import { api, prefixUrl } from '../lib/api-adapter';

// Initialize the dashboards API with the appropriate prefix URL.
const dashboardsApi = api.extend({ prefixUrl: prefixUrl('dashboards') });

/*
 * Retrieves a list of dashboards.
 * returns a promise that resolves with the list of dashboards.
*/
export const getDashboards = () => {
  return dashboardsApi.get('dashboards').json();
};

/*
 * Creates a new dashboard.
 * data - The data for the new dashboard.
 * returns a promise that resolves with the new dashboard.
*/
export const createDashboard = (data) => {
  return dashboardsApi.post('create-dashboard', { json: data }).json();
};

/*
 * Deletes a dashboard.
 * id - The ID of the dashboard to delete.
 * returns a promise that resolves with the deleted dashboard.
*/
export const deleteDashboard = (id) => {
  return dashboardsApi.post('delete-dashboard', { json: { id } }).json();
};

/*
 * Retrieves a specific dashboard.
 * id - The ID of the dashboard to retrieve.
 * returns a promise that resolves with the specified dashboard.
*/
export const getDashboard = (id) => {
  return dashboardsApi.get('dashboard', { searchParams: { id } }).json();
};

/*
 * Saves a dashboard.
 * id - The ID of the dashboard to save.
 * layout - The layout of the dashboard.
 * items - The items on the dashboard.
 * nextId - The next ID to use for the dashboard.
 * returns a promise that resolves with the saved dashboard.
*/
export const saveDashboard = (id, layout, items, nextId) => {
  const data = { id, layout, items, nextId };
  return dashboardsApi.post('save-dashboard', { json: data }).json();
};

/*
 * Clones a dashboard.
 * dashboardId - The ID of the dashboard to clone.
 * name - The name of the cloned dashboard.
 * returns a promise that resolves with the cloned dashboard.
*/
export const cloneDashboard = (dashboardId, name) => {
  const data = { dashboardId, name };
  return dashboardsApi.post('clone-dashboard', { json: data }).json();
};

/*
 * Checks if a password is needed to access a dashboard.
 * user - The user attempting to access the dashboard.
 * dashboardId - The ID of the dashboard to check.
 * returns a promise that resolves with a boolean indicating if a password is needed.
*/
export const checkDashboardPasswordNeeded = (user, dashboardId) => {
  const data = { user, dashboardId };
  return dashboardsApi.post('check-password-needed', { json: data }).json();
};

/*
 * Checks if a password is correct for a dashboard.
 * dashboardId - The ID of the dashboard to check.
 * password - The password to check.
 * returns a promise that resolves with a boolean indicating if the password is correct.
*/
export const checkDashboardPassword = (dashboardId, password) => {
    const data = { dashboardId, password };
    return dashboardsApi.post('check-password', { json: data }).json();
  };
  
/*
* Sets a password for a dashboard.
* dashboardId - The ID of the dashboard to set the password for.
* returns a promise that resolves with the updated dashboard.
*/
export const selectShareDashboard = (dashboardId) => {
const data = { dashboardId };
return dashboardsApi.post('share-dashboard', { json: data }).json();
};

/*
* Clears the password for a dashboard.
* dashboardId - The ID of the dashboard to clear the password for.
* password - The password to set.
* returns a promise that resolves with the updated dashboard.
*/
export const submitPassword = (dashboardId, password) => {
const data = { dashboardId, password };
return dashboardsApi.post('change-password', { json: data }).json();
};

