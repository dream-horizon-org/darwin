export const login = (email, password) =>
  cy.session('login', () => {
    cy.visit('http://localhost:7700')
    cy.get('input[name="username"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.location('pathname').should('eq', '/dashboard')
  })
