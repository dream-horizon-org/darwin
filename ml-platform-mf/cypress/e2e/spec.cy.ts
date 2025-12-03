describe('Login test', () => {
  it('Should login to the local app', () => {
    cy.visit('http://localhost:7700')

    cy.get('input[name="username"]').type('all')
    cy.get('input[name="password"]').type('all')
    cy.get('button[type="submit"]').click()
    cy.location('pathname').should('eq', '/dashboard/')
  })
})
