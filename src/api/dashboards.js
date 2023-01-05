/* eslint-disable max-len */
import {api, prefixUrl} from '../lib/api-adapter';

const dashboardsApi = api.extend({prefixUrl: prefixUrl('dashboards')});

export const getDashboards = () => dashboardsApi.get('dashboards').json();

export const createDashboard = (data) => dashboardsApi.post('create-dashboard', {json: data}).json();

export const deleteDashboard = (id) => dashboardsApi.post('delete-dashboard', {json: {id}}).json();

export const getDashboard = (id) => dashboardsApi.get('dashboard', {searchParams: {id}}).json();

export const saveDashboard = (id, layout, items, nextId) => dashboardsApi.post('save-dashboard', {json: {id, layout, items, nextId}}).json();

export const cloneDashboard = (dashboardId, name) => dashboardsApi.post('clone-dashboard', {json: {dashboardId, name}}).json();

export const checkDashboardPasswordNeeded = (user, dashboardId) => dashboardsApi.post('check-password-needed', {json: {user, dashboardId}}).json();

export const checkDashboardPassword = (dashboardId, password) => dashboardsApi.post('check-password', {json: {dashboardId, password}}).json();

export const selectShareDashboard = (dashboardId) => dashboardsApi.post('share-dashboard', {json: {dashboardId}}).json();

export const submitPassword = (dashboardId, password) => dashboardsApi.post('change-password', {json: {dashboardId, password}}).json();
