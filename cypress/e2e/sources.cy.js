const webName = `name${Cypress._.random(1, 100)}`
const newWebName = `name${Cypress._.random(1, 100)}`
const mqttName = `name${Cypress._.random(1, 100)}`
const newMqttName = `name${Cypress._.random(1, 100)}`

//Login before each test
beforeEach(function () {
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

describe('Web stomp sources', () => {

    //This test creates a new web source
    it('creates new web source', () => {
        //Go to manage your sources page
        cy.visit(`/sources`)
        cy.contains(/Manage your Sources/i)

        //Click Add New Source button
        cy.contains('Add New Source').parent().click()
        //Assert that add source window opened
        cy.get('#signInForm').should('be.visible')
        //Complete the form
        cy.get('#signInForm').children().eq(0).click().type(webName)
        cy.get('#signInForm').children().eq(1).children().children().click()
        cy.get('div[class="bp3-popover pagination-popover"]').children().eq(1).children().children().eq(0).children().should('contain', 'Web-Stomp').click()
        cy.get('#signInForm').children().eq(3).click().type("ads")
        cy.get('#signInForm').children().eq(4).click().type("asd")
        cy.get('#signInForm').children().eq(5).click().type("host")
        //Click save button
        cy.get('button[type="submit"]').click()
        //Assert that source was created
        cy.contains(/Source created successfully/i).should('exist');
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', webName)
    })

    it('edits web source', () => {
        //Go to manage your sources page
        cy.visit(`/sources`)
        cy.contains(/Manage your Sources/i)

        //Sources page should contain the new source
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', webName)
        //Click edit button
        cy.get('[class="sc-jNJNQp lbHIvL"]').contains(webName).parent().children().children().eq(1).children().eq(0).should('have.attr', 'data-icon', 'edit').click()
        //Clear name form and change the name
        cy.get('#signInForm').children().eq(0).click().clear().type(newWebName)
        //Click save
        cy.get('button[type="submit"]').click()
        //Assert that source was edited
        cy.contains(/Source saved successfully/i).should('exist');
        //Assert that source page does not contain original name but contains new source name
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('not.contain', webName)
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', newWebName)
    })

    it('deletes web source', () => {
        //Go to manage your sources page
        cy.visit(`/sources`)
        cy.contains(/Manage your Sources/i)

        //Assert that source page contains new source name
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', newWebName)
        //Click trash can button
        cy.contains(newWebName).parent().children().eq(0).children().eq(1).children().eq(1).should('have.attr', 'data-icon', 'trash-alt').click()
        //Click Cancel button
        cy.contains('Cancel').click()
        //Click trash can button
        cy.contains(newWebName).parent().children().eq(0).children().eq(1).children().eq(1).should('have.attr', 'data-icon', 'trash-alt').click()
        //Click Delete button
        cy.contains('Delete').click()

        //Assert that source was deleted
        cy.contains(/Source deleted successfully/i).should('exist');
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('not.contain', newWebName)
    })
})

describe('MQTT sources', () => {
    it('creates new mqtt source', () => {
        //Go to manage your sources page
        cy.visit(`/sources`)
        cy.contains(/Manage your Sources/i)

        //Click Add new source
        cy.contains('Add New Source').parent().click()
        //Assert that add source window opened
        cy.get('#signInForm').should('be.visible')
        //Complete the form
        cy.get('#signInForm').children().eq(0).click().type(mqttName)
        cy.get('#signInForm').children().eq(1).children().children().click()
        cy.get('div[class="bp3-popover pagination-popover"]').children().eq(1).children().children().eq(1).children().should('contain', 'MQTT').click()
        cy.get('#signInForm').children().eq(3).click().type("ads")
        cy.get('#signInForm').children().eq(4).click().type("asd")
        //Click Save button
        cy.get('button[type="submit"]').click()

        //Assert that source was created
        cy.contains(/Source created successfully/i).should('exist');
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', mqttName)
    })

    it('edits mqtt source', () => {
        //Go to manage your sources page
        cy.visit(`/sources`)
        cy.contains(/Manage your Sources/i)

        //Page contains source
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', mqttName)
        //Click edit button
        cy.get('[class="sc-jNJNQp lbHIvL"]').contains(mqttName).parent().children().children().eq(1).children().eq(0).should('have.attr', 'data-icon', 'edit').click()
        //Change name
        cy.get('#signInForm').children().eq(0).click().clear().type(newMqttName)
        //Click Save button
        cy.get('button[type="submit"]').click()

        //Assert that source was edited
        cy.contains(/Source saved successfully/i).should('exist');
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('not.contain', webName)
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', newMqttName)
    })

    it('deletes mqtt source', () => {
        //Go to manage your sources page
        cy.visit(`/sources`)
        cy.contains(/Manage your Sources/i)

        //Page should contain new source
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('contain', newMqttName)
        //Click trash can button
        cy.contains(newMqttName).parent().children().eq(0).children().eq(1).children().eq(1).should('have.attr', 'data-icon', 'trash-alt').click()
        //Click cancel button
        cy.contains('Cancel').click()
        //Click trash can button
        cy.contains(newMqttName).parent().children().eq(0).children().eq(1).children().eq(1).should('have.attr', 'data-icon', 'trash-alt').click()
        //Click delete button
        cy.contains('Delete').click()

        //Assert that source was deleted
        cy.contains(/Source deleted successfully/i).should('exist');
        cy.get('[class="sc-jNJNQp lbHIvL"]').should('not.contain', newMqttName)
    })
})