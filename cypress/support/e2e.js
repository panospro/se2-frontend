/* eslint-disable no-undef */
/// <reference types="cypress" />

Cypress.on('window:before:load', (win) => {
    cy.stub(win.console, 'error').callsFake((msg) => !msg?.startsWith('Warning:') && console.error(msg));
});
