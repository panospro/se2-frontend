/* eslint-disable max-len */

import {api, prefixUrl} from '../lib/api-adapter';

const dashboardsApi = api.extend({prefixUrl: prefixUrl('dashboards')});

// Sends a GET request to dashboards to retrieve a list of dashboards.
export const getDashboards = () => dashboardsApi.get('dashboards').json();

// Sends a POST request to create-dashboard, with a JSON body containing data for the new dashboard, to create a new dashboard.
export const createDashboard = (data) => dashboardsApi.post('create-dashboard', {json: data}).json();

// Sends a POST request to delete-dashboard, with a JSON body containing the ID of the dashboard to delete, to delete a dashboard.
export const deleteDashboard = (id) => dashboardsApi.post('delete-dashboard', {json: {id}}).json();

// Sends a GET request to dashboard, with a query parameter containing the ID of the dashboard to retrieve, to get a specific dashboard.
export const getDashboard = (id) => dashboardsApi.get('dashboard', {searchParams: {id}}).json();

// Sends a POST request to save-dashboard, with a JSON body containing the ID, layout, items and next ID of the dashboard to save, to save a dashboard.
export const saveDashboard = (id, layout, items, nextId) => dashboardsApi.post('save-dashboard', {json: {id, layout, items, nextId}}).json();

// Sends a POST request to clone-dashboard, with a JSON body containing the ID and name of the dashboard to clone, to clone a dashboard.
export const cloneDashboard = (dashboardId, name) => dashboardsApi.post('clone-dashboard', {json: {dashboardId, name}}).json();

// Sends a POST request to check-password-needed, with a JSON body containing the user and dashboard ID, to check if a password is needed to access a dashboard.
export const checkDashboardPasswordNeeded = (user, dashboardId) => dashboardsApi.post('check-password-needed', {json: {user, dashboardId}}).json();

// Sends a POST request to check-password, with a JSON body containing the dashboard ID and password, to check if a password is correct for a dashboard.
export const checkDashboardPassword = (dashboardId, password) => dashboardsApi.post('check-password', {json: {dashboardId, password}}).json();

// Sends a POST request to share-dashboard, with a JSON body containing the dashboard ID, to select a dashboard to share.
export const selectShareDashboard = (dashboardId) => dashboardsApi.post('share-dashboard', {json: {dashboardId}}).json();

// Sends a POST request to change-password, with a JSON body containing the dashboard ID and password, to change the password of a dashboard.
export const submitPassword = (dashboardId, password) => dashboardsApi.post('change-password', {json: {dashboardId, password}}).json();