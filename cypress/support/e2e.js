/* eslint-disable no-undef /*/
/// <reference types="cypress" />

// Prevents the Cypress test from logging error messages that start with "Warning:".
Cypress.on('window:before:load', (win) => {
    cy.stub(win.console, 'error').callsFake((msg) => !msg?.startsWith('Warning:') && console.error(msg));
});
