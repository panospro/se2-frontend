/* eslint-disable no-undef */
describe('Initial visit', () => {
    it('navigates to sign in screen', () => {
        cy.visit('http://localhost:3002');
        cy.get('#test-username').type('karanikio');
        cy.get('#test-password').type('12345');
    });
});

describe('Log in', () => {
    beforeEach(() => {
        const token = JSON.stringify({
            token: JSON.stringify(Cypress.env('TEST_TOKEN')),
            user: JSON.stringify({
                username: Cypress.env('TEST_USERNAME'),
                id: Cypress.env('TEST_ID'),
                email: Cypress.env('TEST_EMAIL')
            }),
            _persist: JSON.stringify({version: -1, rehydrated: true})
        });
        cy.visit('http://localhost:3002');
        cy.window().then((win) => win.localStorage.setItem('persist:codin-auth', token));
    });

    it('navigates to project screen if user is already authenticated', () => {
        cy.visit('http://localhost:3002/home');
        cy.contains(/HELLO karanikio/i).should('exist');
    });
});
