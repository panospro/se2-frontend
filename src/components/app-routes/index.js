/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable max-len */

/*
* Import some modules in some variables
*/ 
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


// Takes in component, isAuthenticated and rest props and returns a Route element from the react-router-dom library. 
// The Route element depends on the value of the isAuthenticated prop. If isAuthenticated is true, the function will return a Component element with the props object spread as props.
//  If isAuthenticated is false, the function will return a Redirect element that will redirect the user to the root route (/).
const OnlyForAuthenticatedRoute = ({component: Component, isAuthenticated, ...rest}) => (
    <Route
        {...rest}
        render={(props) =>
            (isAuthenticated ? <Component {...props} /> : <Redirect to="/" />)}
    />
);

// This is similar to the OnlyForAuthenticatedRoute component, but the behavior is reversed. If isAuthenticated is true, the function will return a Redirect element 
// that will redirect the user to the /home route. If isAuthenticated is false, the function will return a Component element with the props object spread as props.
const OnlyForGuestRoute = ({component: Component, isAuthenticated, ...rest}) => (
    <Route
        {...rest}
        render={(props) =>
            (isAuthenticated ? <Redirect to="/home" /> : <Component {...props} />)}
    />
);

// This is similar to the OnlyForAuthenticatedRoute component, returns the Route element, but doesn't redirect it.
const PublicRoute = ({component: Component, ...rest}) => (
    <Route
        {...rest}
        render={(props) => <Component {...props} />}
    />
);

// Create a custom router, that is using a Switch component to render different components depending on the route path and whether the user is authenticated.
// It takes as argument isAuthenticated, which is a boolean value that indicates whether the user is authenticated. This value is passed down to the different routes,
// that are being rendered, such as OnlyForGuestRoute, OnlyForAuthenticatedRoute, and PublicRoute. 
// These routes are responsible for rendering the respective components if the user is either a guest (not authenticated), an authenticated user, or if the route is public.
// If none of these conditions are met, the Redirect component at the bottom will redirect the user to the root path (/).
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

// Setting the prop types for the CustomRouter.
CustomRouter.propTypes = {isAuthenticated: propTypes.bool.isRequired};

// Takes in the global state object and returns an object that maps the state to props that will be passed down to the CustomRouter.
//  isAuthenticated will be set to the value returned by checkIsAuthenticated, which is passed the global state object as an argument.
export const mapState = (state) => ({isAuthenticated: checkIsAuthenticated(state)});

// Takes two arguments: A function called mapState and a component that we want to connect to the store, the CustomRouter.
export default connect(
    mapState
)(CustomRouter);
