const webName = `name${Cypress._.random(1, 100)}`
const newWebName = `name${Cypress._.random(1, 100)}`
const mqttName = `name${Cypress._.random(1, 100)}`
const newMqttName = `name${Cypress._.random(1, 100)}`

//Login before each test
beforeEach(function () {
    cy.visit('/');
    cy.get('#test-username').type('karanikio');
    cy.get('#test-password').type('12345');
    cy.get('button[type="submit"]').click();
    cy.contains(/HELLO karanikio/i).should('exist');
})

describe('Web stomp sources', () => {
    it('creates new web source', () => {
        cy.visit(`/sources`)
        cy.contains('Add New Source').parent().click()
        cy.get('#signInForm').children().eq(0).click().type(webName)
        cy.get('#signInForm').children().eq(3).click().type("ads")
        cy.get('#signInForm').children().eq(4).click().type("asd")
        cy.get('#signInForm').children().eq(5).click().type("host")
        cy.get('button[type="submit"]').click()
        //Assert that source was created
        cy.contains(/Source created successfully/i).should('exist');
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', webName)
    })

    it('edits web source', () => {
        cy.visit(`/sources`)
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', webName)
        cy.get('[class="sc-jNJNQp lbHIvL"]').contains(webName).parent().children().children().eq(1).children().eq(0).should('have.attr', 'data-icon', 'edit').click()
        cy.get('#signInForm').children().eq(0).click().clear().type(newWebName)
        cy.get('button[type="submit"]').click()
        //Assert that source was edited
        cy.contains(/Source saved successfully/i).should('exist');
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('not.contain', webName)
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', newWebName)
    })

    it('deletes web source', () => {
        cy.visit(`/sources`)
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', newWebName)
        cy.contains(newWebName).parent().children().eq(0).children().eq(1).children().eq(1).should('have.attr', 'data-icon', 'trash-alt').click()
        cy.contains('Delete').click()
        //Assert that source was deleted
        cy.contains(/Source deleted successfully/i).should('exist');
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('not.contain', newWebName)
    })
})

describe('MQTT sources', () => {
    it('creates new mqtt source', () => {
        cy.visit(`/sources`)
        cy.contains('Add New Source').parent().click()
        cy.get('#signInForm').children().eq(0).click().type(mqttName)
        cy.get('#signInForm').children().eq(1).children().children().click()
        cy.get('div[class="bp3-popover pagination-popover"]').children().eq(1).children().children().eq(1).children().should('contain', 'MQTT').click()
        cy.get('#signInForm').children().eq(3).click().type("ads")
        cy.get('#signInForm').children().eq(4).click().type("asd")
        cy.get('button[type="submit"]').click()
        //Assert that source was created
        cy.contains(/Source created successfully/i).should('exist');
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', mqttName)
    })

    it('edits mqtt source', () => {
        cy.visit(`/sources`)
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', mqttName)
        cy.get('[class="sc-jNJNQp lbHIvL"]').contains(mqttName).parent().children().children().eq(1).children().eq(0).should('have.attr', 'data-icon', 'edit').click()
        cy.get('#signInForm').children().eq(0).click().clear().type(newMqttName)
        cy.get('button[type="submit"]').click()
        //Assert that source was edited
        cy.contains(/Source saved successfully/i).should('exist');
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('not.contain', webName)
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', newMqttName)
    })

    it('deletes mqtt source', () => {
        cy.visit(`/sources`)
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', newMqttName)
        cy.contains(newMqttName).parent().children().eq(0).children().eq(1).children().eq(1).should('have.attr', 'data-icon', 'trash-alt').click()
        cy.contains('Delete').click()
        //Assert that source was deleted
        cy.contains(/Source deleted successfully/i).should('exist');
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('not.contain', newMqttName)
    })
})