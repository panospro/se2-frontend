describe('Login page', () => {

    beforeEach(() => {
        //Visit login page
        cy.visit(`/`)
        cy.contains(/WELCOME/i)
    })

    it('checks forgot pass button', () => {
        //Click forgot password button 
        cy.get(`a[href="/forgot-password"]`).click()

        //Check you redirected to correct page
        cy.url().should('eq', 'http://localhost:3002/forgot-password')
        cy.contains(/Trouble Signing in?/i)

        //Type fake username
        cy.get('input[name=username').focus().click().clear().type('asjdfhkajf')

        //Click send
        cy.get('button[type=submit').click()

        //Email was not sent
        cy.contains(/There was an error sending the email/i)

        //Type real username
        cy.get('input[name=username').focus().click().clear().type('karanikio')

        //Click send
        cy.get('button[type=submit').click()

        //Email was sent
        cy.contains(/Forgot password e-mail sent/i)

        //Check that you were redirected to login page
        cy.url().should('eq', 'http://localhost:3002/')
        cy.contains(/WELCOME/i)
    })

    it('checks signup button', () => {
        //Click signup button
        cy.get(`a[href="/sign-up"]`).click()
        //Check that you were redirected to correct page
        cy.url().should('eq', 'http://localhost:3002/sign-up')
        cy.contains(/Sign Up/i)

        //Complete form
        cy.get('input[name="username"]').focus().click().clear().type('testuser')
        cy.get('input[name="password"]').focus().click().clear().type('pass')
        cy.get('input[name="username"]').focus().click()
        cy.contains(/Password should contain at least 5 characters/i)
        cy.get('input[name="password"]').focus().click().clear().type('pass123')
        cy.get('input[name="confirm"]').focus().click().clear().type('ps')
        cy.get('input[name="username"]').focus().click()
        cy.contains(/Password should contain at least 5 characters/i)
        cy.get('input[name="confirm"]').focus().click().clear().type('pass124')
        cy.get('input[name="username"]').focus().click()
        cy.contains(/Passwords don't match/i)
        cy.get('input[name="confirm"]').focus().click().clear().type('pass123')
        cy.get('input[name="email"]').focus().click().clear().type('testemail@testemail.com')

        //Click send
        cy.get('button[type=submit').click()

        //Assert that new user was created
        cy.contains(/New user was created successfully/i)

        //Check that you were redirected to login page
        cy.url().should('eq', 'http://localhost:3002/')
        cy.contains(/WELCOME/i)

    })

    it('doesnt log in', () => {
        //Type wrong username and password
        cy.get('#test-username').focus().blur()
        cy.contains(/Username is required/i)
        cy.get('#test-username').focus().clear().type('testuser')
        cy.get('#test-password').focus().blur()
        cy.contains(/Password is required/i)
        cy.get('#test-password').focus().click().clear().type('pass')
        cy.contains(/Password should contain at least 5 characters/i)
        cy.get('#test-password').focus().click().clear().type('1234567')

        //Click signin button
        cy.get('button[type="submit"]').click();

        //Check that you were redirected to login page
        cy.url().should('eq', 'http://localhost:3002/')
        cy.contains(/WELCOME/i)
    })

    it('logs in', () => {
        //Type username and password
        cy.get('#test-username').focus().clear().type('karanikio');
        cy.get('#test-password').focus().clear().type('12345');

        //Click signin button
        cy.get('button[type="submit"]').click()

        //Assert that you've succesfully logged in
        cy.url().should('eq', 'http://localhost:3002/home')
        cy.contains(/HELLO karanikio/i).should('exist')
    })

})