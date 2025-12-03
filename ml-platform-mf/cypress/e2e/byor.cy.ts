import {
  aliasMutation,
  aliasQuery,
  GraphQLCall,
  GRAPHQL_ENDPOINT
} from '../utils/graphql-test-utils'
import {login} from './login.cy'

const generateRandomUUID = () => {
  return Cypress._.random(0, 1e6)
}

describe('BYOR Test', () => {
  beforeEach(() => {
    login('all', 'all')
    GraphQLCall.interceptCall('GetRuntimesInformation', 'query')
    cy.visit('http://localhost:7700/settings/runtimes')
  })

  it('Should render the BYOR listing page', () => {
    cy.url().should('include', '/settings/runtimes')
  })

  it('Should render all the runtimes', () => {
    GraphQLCall.waitForCall('GetRuntimesInformation', 'query').then((call) => {
      cy.get('[data-test-id="byor-listing-runtime-name"]').should(
        'have.length',
        call.response.body.data.getRuntimesInformation.data.length
      )
      cy.get('[data-test-id="byor-listing-runtime-name"]').each(
        ($el, index) => {
          cy.wrap($el).should(
            'have.text',
            call.response.body.data.getRuntimesInformation.data[index].name
          )
        }
      )
    })
  })

  it('Should render the searched runtime', () => {
    GraphQLCall.waitForCall('GetRuntimesInformation', 'query').then((call) => {
      cy.get('[data-test-id="byor-listing-runtime-name"]')
        .first()
        .then(($el) => {
          const runtimeName = $el.text()
          GraphQLCall.interceptCall('GetRuntimesInformation', 'query')
          cy.get('[data-testid=byor-listing-search-bar]').type(runtimeName)
          GraphQLCall.waitForCall('GetRuntimesInformation', 'query').then(
            (call) => {
              cy.get('[data-test-id="byor-listing-runtime-name"]').each(
                ($el, index) => {
                  cy.wrap($el).should('have.text', runtimeName)
                }
              )
            }
          )
        })
    })
  })

  it('Should take the user to runtime details page', () => {
    GraphQLCall.waitForCall('GetRuntimesInformation', 'query').then((call) => {
      cy.get('[data-test-id="byor-listing-runtime-name"]')
        .first()
        .then(($el) => {
          const runtimeName = $el.text()
          GraphQLCall.interceptCall('GetRuntimeDetails', 'query')
          cy.wrap($el).click()
          cy.url().should(
            'include',
            `/settings/runtimes/details/${runtimeName}`
          )
        })
    })
  })

  it.only('Should add a runtime', () => {
    const randomID = generateRandomUUID()
    const validFilePath = 'cypress/fixtures/valid_runtime/Dockerfile'
    GraphQLCall.waitForCall('GetRuntimesInformation', 'query').then((call) => {
      cy.get('[data-testid=runtime-listing-add-runtime-button]').click()
      cy.url().should('include', '/settings/runtimes/create')
      cy.get('[data-testid=runtime-name-input]').type(
        `e2e-test-runtime-${randomID}`
      )
      cy.get('[data-testid=docker-file-input]').selectFile(validFilePath)
      GraphQLCall.interceptCall('CreateRuntime', 'mutation')
      cy.get('[data-testid=add-runtime-button]').click()
      GraphQLCall.waitForCall('CreateRuntime', 'mutation').then((call) => {
        expect(call.response.body.data.createRuntime.status).to.equal('SUCCESS')
        cy.url().should(
          'include',
          `/settings/runtimes/details/e2e-test-runtime-${randomID}`
        )
        GraphQLCall.interceptCall('GetRuntimesInformation', 'query')
        cy.visit('http://localhost:7700/settings/runtimes')
        GraphQLCall.waitForCall('GetRuntimesInformation', 'query').then(
          (call) => {
            cy.get('[data-test-id="byor-listing-runtime-name"]').should(
              'contain.text',
              `e2e-test-runtime-${randomID}`
            )
          }
        )
      })
    })
  })
})
