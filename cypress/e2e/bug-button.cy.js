describe('Bug Button', () => {
    before(() => {
        //Goes to login screen
        cy.visit('/');
        //Type username and password
        cy.get('#test-username').focus().clear().type('karanikio');
        cy.get('#test-password').focus().clear().type('12345');
        //Click signin button
        cy.get('button[type="submit"]').click();
        //Assert that you've succesfully logged in
        cy.contains(/HELLO karanikio/i).should('exist');
    })
    it('checks that you stay on home page when clicking bug button', () => {
        cy.get('img[id="bugImg"]')
            .should('be.visible')
            .click()
        cy.url().should('eq', 'http://localhost:3002/home')
    })
})