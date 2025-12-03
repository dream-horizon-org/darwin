import {first} from 'cypress/types/lodash'
import {GraphQLCall} from '../utils/graphql-test-utils'
import {login} from './login.cy'

const waitForAllCalls = (timeout: number = 10000) => {
  return GraphQLCall.waitForMultipleCalls(
    [
      {
        operationName: 'fetchComputeTags',
        callType: 'query'
      },
      {
        operationName: 'GetComputeGpuPods',
        callType: 'query'
      },
      {
        operationName: 'GetComputeNodeTypes',
        callType: 'query'
      },
      {
        operationName: 'GetComputeRuntimeList',
        callType: 'query'
      },
      {
        operationName: 'GetComputeAvailabilityZones',
        callType: 'query'
      },
      {
        operationName: 'GetComputeInstanceRoles',
        callType: 'query'
      },
      {
        operationName: 'GetComputeDiscTypes',
        callType: 'query'
      },
      {
        operationName: 'GetComputeTemplates',
        callType: 'query'
      },
      {
        operationName: 'GetComputeLimits',
        callType: 'query'
      }
    ],
    timeout
  )
}

const createAClusterDefination = (uniqueId: number) => {
  cy.get('[data-testid=compute-create-cluster-name-input]').type(
    `test-cluster-${uniqueId}`
  )
  // Add cluster tags
  cy.get('[data-testid=add-tag-button]').click()
  cy.get('[data-testid=compute-create-cluster-tags-input]').type(
    'test-tag{enter}e2e-testing{enter}'
  )
  cy.get('[data-testid=compute-create-heading-text]').click()
  // Select runtime
  cy.get('[data-testid=compute-runtime-dropdown]')
    .click()
    .type('{downArrow}{enter}')
  // Set termination time
  cy.get('[data-testid=compute-create-cluster-inactive-time-input]')
    .clear()
    .type('20')

  // Infra configuration
  // Head node configuration
  // cy.get('[data-testid=head-node-type-dropdown]')
  //   .click()
  //   .type('{downArrow}{enter}')
  cy.get('[data-testid=head-core-input]').clear().type('1')
  cy.get('[data-testid=head-memory-input]').clear().type('2')
  // Worker node configuration
  // cy.get('[data-testid=worker-node-type-dropdown]')
  //   .click()
  //   .type('{downArrow}{enter}')
  cy.get('[data-testid=worker-core-pod-input]').type('1')
  cy.get('[data-testid=worker-memory-pod-input] input').type('2')
  cy.get('[data-testid=worker-min-pod-input]').type('1')
  cy.get('[data-testid=worker-max-pod-input]').type('2')
  cy.get('[data-testid=add-worker-group-button] > button').click()
  // cy.get('[data-testid=worker-node-type-dropdown]')
  //   .last()
  //   .click()
  //   .type('{downArrow}{enter}')
  cy.get('[data-testid=worker-core-pod-input]').last().type('1')
  cy.get('[data-testid=worker-memory-pod-input] input').last().type('2')
  cy.get('[data-testid=worker-min-pod-input]').last().type('1')
  cy.get('[data-testid=worker-max-pod-input]').last().type('2')
  cy.get('[data-testid=view-cluster-configuration-button]').click()
  cy.get('[data-testid=compute-max-core-text]').should('have.text', '5')
  cy.get('[data-testid=compute-max-memory-text]').should('have.text', '10')
  cy.get('[data-testid=compute-max-gpu-text]').should('have.text', '--')
}

describe('Compute Cluster Creation Page Test', () => {
  beforeEach(() => {
    login('all', 'all')
    GraphQLCall.interceptMultipleCalls([
      {
        operationName: 'fetchComputeTags',
        callType: 'query'
      },
      {
        operationName: 'GetComputeGpuPods',
        callType: 'query'
      },
      {
        operationName: 'GetComputeNodeTypes',
        callType: 'query'
      },
      {
        operationName: 'GetComputeRuntimeList',
        callType: 'query'
      },
      {
        operationName: 'GetComputeAvailabilityZones',
        callType: 'query'
      },
      {
        operationName: 'GetComputeInstanceRoles',
        callType: 'query'
      },
      {
        operationName: 'GetComputeDiscTypes',
        callType: 'query'
      },
      {
        operationName: 'GetComputeTemplates',
        callType: 'query'
      },
      {
        operationName: 'GetComputeLimits',
        callType: 'query'
      }
    ])
    cy.visit('http://localhost:7700/create/cluster')
  })

  it('Should be in the listing page', () => {
    cy.location('pathname').should('eq', '/create/cluster/')
  })

  it('Should show a confirmation dialog when the back button is clicked', () => {
    cy.get('[data-testid=cluster-details-page-back-button] > button').click()
    cy.get('[data-testid=route-prevention-dialog]').should('exist')
  })

  it("Should navigate to the listing page when the 'Yes' button is clicked in dialog", () => {
    cy.get('[data-testid=cluster-details-page-back-button] > button').click()
    cy.get('[data-testid=route-prevention-dialog]').should('exist')
    cy.get('.dialogFooter').children().contains('Yes').click()
    cy.location('pathname').should('eq', '/clusters')
  })

  it("Should stay in the same page when the 'Cancel' button is clicked in dialog", () => {
    cy.get('[data-testid=cluster-details-page-back-button] > button').click()
    cy.get('[data-testid=route-prevention-dialog]').should('exist')
    cy.get('.dialogFooter').children().contains('Cancel').click()
    cy.location('pathname').should('eq', '/create/cluster/')
  })

  it("Should show all the validation errors when the 'Create' button is clicked", () => {
    const validation_errors = [
      'Cluster name is mendatory',
      'Core is mendatory',
      'Memory is mendatory',
      'Cores/Pod is mendatory',
      'Memory/Pod is mendatory',
      'Min Pods is mendatory',
      'Max Pods is mendatory'
    ]
    cy.get('[data-testid=compute-create-cluster-button]').click()
    cy.get('.Mui-error > span > span').each(($el, index, $list) => {
      cy.wrap($el).should('have.text', validation_errors[index])
    })
  })

  it('Should create a cluster with given defination', () => {
    waitForAllCalls(30000).then(() => {
      const randomUUID = () => Cypress._.random(0, 1e6)
      const random = randomUUID()
      // Type the cluster name
      createAClusterDefination(random)
      GraphQLCall.interceptCall('CreateComputeCluster', 'mutation')
      cy.get('[data-testid=compute-create-cluster-button]').click()
      GraphQLCall.waitForCall('CreateComputeCluster', 'mutation').then(
        (response) => {
          expect(response.response.statusCode).to.eq(200)
          cy.wait(5000)
          cy.location('pathname').should('eq', '/clusters')
        }
      )
    })
  })

  it('Should list the created cluster in the listing page', () => {
    waitForAllCalls(30000).then(() => {
      const randomUUID = () => Cypress._.random(0, 1e6)
      const random = randomUUID()
      createAClusterDefination(random)
      GraphQLCall.interceptCall('CreateComputeCluster', 'mutation')
      cy.get('[data-testid=compute-create-cluster-button]').click()
      GraphQLCall.waitForCall('CreateComputeCluster', 'mutation').then(
        (response) => {
          GraphQLCall.interceptCall('GetUserClusters', 'query')
          expect(response.response.statusCode).to.eq(200)
          cy.wait(5000)
          cy.location('pathname').should('eq', '/clusters')
          GraphQLCall.waitForCall('GetUserClusters', 'query', 30000).then(
            (interception) => {
              cy.get('[data-testid=created-by-user-section-cluster-name]')
                .first()
                .then(($el) => {
                  expect($el.text().toLowerCase()).to.contain(
                    `test-cluster-${random}`
                  )
                })
            }
          )
        }
      )
    })
  })

  it('Should list the created cluster in the created by you section', () => {
    waitForAllCalls(30000).then(() => {
      const randomUUID = () => Cypress._.random(0, 1e6)
      const random = randomUUID()
      createAClusterDefination(random)
      GraphQLCall.interceptCall('CreateComputeCluster', 'mutation')
      cy.get('[data-testid=compute-create-cluster-button]').click()
      GraphQLCall.waitForCall('CreateComputeCluster', 'mutation').then(
        (response) => {
          GraphQLCall.interceptCall('GetSearchedClusters', 'query')
          expect(response.response.statusCode).to.eq(200)
          cy.wait(5000)
          cy.location('pathname').should('eq', '/clusters')
          GraphQLCall.waitForCall('GetSearchedClusters', 'query', 30000).then(
            (interception) => {
              GraphQLCall.interceptCall('GetSearchedClusters', 'query')
              cy.get('[data-testid=cluster-list-search-bar]').type(
                `test-cluster-${random}`
              )
              GraphQLCall.waitForCall(
                'GetSearchedClusters',
                'query',
                30000
              ).then((interception) => {
                cy.get('[data-testid=cluster-list-cluster-name]').each(
                  ($el) => {
                    expect($el.text().toLowerCase()).to.contain(
                      `test-cluster-${random}`
                    )
                  }
                )
              })
            }
          )
        }
      )
    })
  })
})
