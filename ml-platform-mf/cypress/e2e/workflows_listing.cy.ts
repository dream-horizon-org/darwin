import {login} from './login.cy'

describe('Workflows Listing Page Test', () => {
  beforeEach(() => {
    login('all', 'all')
    cy.visit('http://localhost:7700/workflows')
  })

  it('Should take the user to workflow listing page', () => {
    cy.get('[data-testid=menu-Workflows]').should('be.visible').click()
    cy.location('pathname').should('include', '/workflows')
    cy.get('body').trigger('mousemove', 'center')
  })

  it('Should take the user to workflow creation page', () => {
    cy.get('[data-testid=workflows-create-button]').should('be.visible').click()
    cy.location('pathname').should('include', '/workflows/create')
    cy.get('body').trigger('mousemove', 'center')
  })

  it('Should match the total number of workflows', () => {
    cy.wait(5000)
    cy.scrollTo('bottom')
    while (Cypress.$('[data-testid=workflows-scroll-loading]').length > 0) {
      cy.scrollTo('bottom')
      cy.wait(5000)
    }
    cy.get('[data-testid=workflows-scroll-loading]').should('not.exist')

    let count = 0
    cy.get('[data-testid=workflow-row]')
      .each(() => {
        count++
      })
      .then(() => {
        cy.get('[data-testid=total-workflows-count]').should('contain', count)
      })
  })

  it('Should take the user to workflow details page', () => {
    cy.wait(5000)
    cy.get('[data-testid=workflow-row]').first().click()
    cy.wait(5000)
    cy.get('[data-testid=workflow-details-page-workflow-id]').then(($el) => {
      cy.log($el.text())
      cy.location('pathname').should('include', `/workflows/${$el.text()}/runs`)
    })
  })
  it('Should show in recently visited workflows', () => {
    cy.wait(5000)
    cy.get('[data-testid=workflow-row]').then(($el) => {
      const random = Math.floor(Math.random() * $el.length)
      cy.get('[data-testid=workflow-row]').eq(random).click()
      cy.wait(5000)
      cy.get('[data-testid=workflow-details-page-back-button]').click()
      cy.wait(5000)
      cy.scrollTo('top')
      cy.get('[data-testid=workflow-row-name]')
        .eq(random)
        .then(($el) => {
          const workflowName = $el.text()
          cy.get(
            `[data-testid=recently-visited-workflow-tooltip-${workflowName}]`
          ).should('exist')
        })
    })
  })
  it('Should update the query params on search', () => {
    const searchTerm = 'test'
    const encrypedSearchTerm = encodeURIComponent(searchTerm)
    cy.wait(5000)
    cy.get('[data-testid=workflows-search-bar]').type('test')
    cy.location('search').should('include', `q=${encrypedSearchTerm}`)
  })

  it('Should update the query params on filter change', () => {
    cy.wait(5000)
    cy.get('[data-testid=workflows-filter]').first().click()
    cy.get('[data-testid=filter-drop-option]').first().click()
    cy.get('[data-testid=filter-drop-option-text]')
      .first()
      .then(($el) => {
        const filter = $el.text()
        const filterObject = {
          users: [],
          status: [filter]
        }
        const encrypedFilter = encodeURIComponent(JSON.stringify(filterObject))
        cy.get('body').click()
        cy.location('search').should('include', `filters=${encrypedFilter}`)
      })
  })
  it('Should show data with the search term', () => {
    cy.wait(5000)
    cy.get('[data-testid=workflow-row-name]')
      .first()
      .then(($el) => {
        const workflowName = $el.text().slice(0, 5)
        cy.get('[data-testid=workflows-search-bar]').type(workflowName)
        cy.wait(8000)
        cy.get('[data-testid=workflow-row-name]').should(
          'contain',
          workflowName
        )
      })
  })
  it('Should show data with the filter', () => {
    let filter = ''
    cy.wait(5000)
    cy.get('[data-testid=workflows-filter]').first().click()
    cy.get('[data-testid=filter-drop-option-text]')
      .first()
      .then(($el) => {
        filter = $el.text()
        cy.get('[data-testid=filter-drop-option]').first().click()
        cy.log('Filter is ' + filter)
        cy.get('body').click()
        cy.wait(5000)
        cy.get(`[data-testid=workflow-row-status-${filter}]`).should('exist')
      })
  })

  it('Should have more options based on status', () => {
    const ACTIVE_ACTIONS = [
      'Run Now',
      'Delete',
      'Pause Schedule',
      'Edit Workflow'
    ]
    const INACTIVE_ACTIONS = ['Delete', 'Restart Schedule', 'Edit Workflow']
    const actions = {
      Active: ACTIVE_ACTIONS,
      Inactive: INACTIVE_ACTIONS
    }
    cy.wait(5000)
    cy.get('[data-testid=workflow-row-name]').then(($el) => {
      const randomIndex = Math.floor(Math.random() * $el.length)
      const status = Cypress.$('[data-cy=workflow-row-status]')
        .eq(randomIndex)
        .text()
      cy.log(status)
      cy.get('[data-testid=workflow-list-row-action-button]')
        .eq(randomIndex)
        .click()
      cy.get('[data-cy=workflow-list-row-action]')
        .should('exist')
        .each(($el) => {
          actions[status].includes($el.text())
            ? cy
                .get(
                  `[data-testid=workflow-list-row-action-${$el
                    .text()
                    .replace(' ', '-')}]`
                )
                .should('exist')
            : cy
                .get(
                  `[data-testid=workflow-list-row-action-${$el
                    .text()
                    .replace(' ', '-')}]`
                )
                .should('not.exist')
        })
    })
  })
})
