const testName = `test${Cypress._.random(100, 1000)}`

//Login before each test
beforeEach(() => {
    cy.visit('/');
    cy.get('#test-username').type('karanikio');
    cy.get('#test-password').type('12345');
    cy.get('button[type="submit"]').click();
    cy.contains(/HELLO karanikio/i).should('exist');
})

describe('Dashboard', () => {

    it('creates new dashboard', () => {
        //Visit homepage
        cy.visit(`/home`)
        //Open Dashboards
        cy.get('[id="button_My Dashboards"]').click()
        //Create new dashboard with unique name
        cy.get('[class="sc-gsGlKL cJICHO"]').click()
        cy.get('[placeholder="Name"]').focus().type(testName)
        cy.get('button[type="submit"]').click()
        //Assert that dashboard was created
        cy.contains(/Dashboard created successfully/i).should('exist');
    })

    it('deletes dashboard', () => {
        //Visit Dashboards
        cy.visit(`/dashboards`)
        //Delete new dashboard
        cy.get('[class="sc-fvEvSO iAhaSN"]').contains(testName).parent().children().children().eq(1).children().eq(2).should('have.attr', 'data-icon', 'trash-alt').click()
        cy.contains('Delete').click()
        //Assert that dashboard was deleted
        cy.contains(/Dashboard deleted successfully/i).should('exist');
        cy.get('[class="sc-fvEvSO iAhaSN"]').should('not.contain', testName)
    })
})
