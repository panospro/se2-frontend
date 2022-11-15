/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable max-len */
import React from 'react';
import {
    Route, Switch, Redirect
} from 'react-router-dom';
import {connect} from 'react-redux';
import propTypes from 'prop-types';
import SignInPage from '../sign-in';
import SignUpPage from '../sign-up';
import ForgotPasswordPage from '../forgot-password';
import ResetPasswordPage from '../reset-password';
import HomePage from '../home-page';
import SourcesPage from '../sources';
import DashboardsPage from '../dashboards';
import EditDashboardPage from '../edit-dashboard';
import DashboardPage from '../dashboard';
import {checkIsAuthenticated} from '../../lib/utilities';

const OnlyForAuthenticatedRoute = ({component: Component, isAuthenticated, ...rest}) => (
    <Route
        {...rest}
        render={(props) =>
            (isAuthenticated ? <Component {...props} /> : <Redirect to="/" />)}
    />
);

const OnlyForGuestRoute = ({component: Component, isAuthenticated, ...rest}) => (
    <Route
        {...rest}
        render={(props) =>
            (isAuthenticated ? <Redirect to="/home" /> : <Component {...props} />)}
    />
);

const PublicRoute = ({component: Component, ...rest}) => (
    <Route
        {...rest}
        render={(props) => <Component {...props} />}
    />
);

export const CustomRouter = ({isAuthenticated}) => (
    <Switch>
        <OnlyForGuestRoute
            exact
            path="/"
            isAuthenticated={isAuthenticated}
            component={SignInPage}
        />
        <OnlyForGuestRoute
            exact
            path="/sign-up"
            isAuthenticated={isAuthenticated}
            component={SignUpPage}
        />
        <OnlyForGuestRoute
            exact
            path="/forgot-password"
            isAuthenticated={isAuthenticated}
            component={ForgotPasswordPage}
        />
        <OnlyForGuestRoute
            exact
            path="/reset-password"
            isAuthenticated={isAuthenticated}
            component={ResetPasswordPage}
        />
        <OnlyForAuthenticatedRoute
            exact
            path="/home"
            isAuthenticated={isAuthenticated}
            component={HomePage}
        />
        <OnlyForAuthenticatedRoute
            exact
            path="/sources"
            isAuthenticated={isAuthenticated}
            component={SourcesPage}
        />
        <OnlyForAuthenticatedRoute
            exact
            path="/dashboards"
            isAuthenticated={isAuthenticated}
            component={DashboardsPage}
        />
        <OnlyForAuthenticatedRoute
            exact
            path="/dashboards/edit/:dashboardId"
            isAuthenticated={isAuthenticated}
            component={EditDashboardPage}
        />
        <PublicRoute
            exact
            path="/dashboards/:dashboardId"
            component={DashboardPage}
        />
        <Redirect from="*" to="/" />
    </Switch>
);

CustomRouter.propTypes = {isAuthenticated: propTypes.bool.isRequired};

export const mapState = (state) => ({isAuthenticated: checkIsAuthenticated(state)});

export default connect(
    mapState
)(CustomRouter);
