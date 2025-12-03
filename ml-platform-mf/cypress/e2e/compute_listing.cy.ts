import {first} from 'cypress/types/lodash'
import {GraphQLCall} from '../utils/graphql-test-utils'
import {login} from './login.cy'

describe('Compute Cluster Listing Page Test', () => {
  beforeEach(() => {
    login('all', 'all')
    GraphQLCall.interceptMultipleCalls([
      {
        operationName: 'GetUserClusters',
        callType: 'query'
      },
      {
        operationName: 'GetFilterOptions',
        callType: 'query'
      },
      {
        operationName: 'GetRecentlyVisitedClusters',
        callType: 'query'
      },
      {
        operationName: 'GetSearchedClusters',
        callType: 'query'
      }
    ])
    cy.visit('http://localhost:7700/clusters')
  })

  it('Should be in the listing page', () => {
    cy.location('pathname').should('eq', '/clusters/')
  })

  it('Should appear in the recently visited section', () => {
    GraphQLCall.waitForCall('GetSearchedClusters', 'query', 30000).then(
      (interception) => {
        cy.get('[data-testid=cluster-list-cluster-name]').each(($el, index) => {
          if (index === 0) {
            const clusterName = $el.text()
            $el.trigger('click')
            cy.wait(8000)
            cy.get('[data-testid=cluster-details-page-back-button] > button')
              .click()
              .click()
            GraphQLCall.waitForCall(
              'GetRecentlyVisitedClusters',
              'query',
              30000
            ).then((interception) => {
              cy.get('[data-testid=recently-visited-cluster-name]')
                .first()
                .should('contain.text', clusterName)
            })
          }
        })
      }
    )
  })
  it('Should list clusters with the search term', () => {
    GraphQLCall.waitForCall('GetSearchedClusters', 'query', 30000).then(
      (interception) => {
        cy.get('[data-testid=cluster-list-search-bar]').type('test')
        GraphQLCall.waitForCall('GetSearchedClusters', 'query', 30000).then(
          (interception) => {
            cy.get('[data-testid=cluster-list-cluster-name]').each(($el) => {
              // Should contain test irrespective of the case
              expect($el.text().toLowerCase()).to.contain('test')
            })
          }
        )
      }
    )
  })
  it('Should list clusters with the filter - Status', () => {
    GraphQLCall.waitForCall('GetSearchedClusters', 'query', 30000).then(
      (interception) => {
        cy.get('[data-testid=cluster-status-filter-drop]').click()
        let randomIndex = 0
        cy.get('[data-testid=filter-drop-option]').then(($el) => {
          const totalFilters = $el.length
          randomIndex = Math.floor(Math.random() * totalFilters)
        })
        cy.get('[data-testid=filter-drop-option]').each(($el, index, $list) => {
          if (index === randomIndex) {
            const filterName = $el.text()
            $el.trigger('click')
            cy.get('body').type('{esc}')
            GraphQLCall.waitForCall('GetSearchedClusters', 'query', 30000).then(
              (interception) => {
                cy.get('[data-testid=cluster-list-cluster-status]').each(
                  ($el) => {
                    // Should contain the selected filter name
                    expect($el.text().toLowerCase()).to.contain(
                      filterName.toLowerCase()
                    )
                  }
                )
              }
            )
          }
        })
      }
    )
  })

  it('Should list clusters with the filter - User', () => {
    GraphQLCall.waitForCall('GetSearchedClusters', 'query', 30000).then(
      (interception) => {
        cy.get('[data-testid=cluster-user-filter-drop]').click()
        let randomIndex = 0
        cy.get('[data-testid=filter-drop-option]').then(($el) => {
          const totalFilters = $el.length
          randomIndex = Math.floor(Math.random() * totalFilters)
        })
        cy.get('[data-testid=filter-drop-option]').each(($el, index, $list) => {
          if (index === randomIndex) {
            const filterName = $el.text()
            $el.trigger('click')
            cy.get('body').type('{esc}')
            GraphQLCall.waitForCall('GetSearchedClusters', 'query', 30000).then(
              (interception) => {
                cy.get('[data-testid=cluster-list-cluster-user]').each(
                  ($el) => {
                    // Should contain the selected filter name
                    expect($el.text().toLowerCase()).to.contain(
                      filterName.toLowerCase()
                    )
                  }
                )
              }
            )
          }
        })
      }
    )
  })

  it('Should load all the listed clusters and match the total count', () => {
    GraphQLCall.waitForCall('GetSearchedClusters', 'query', 30000).then(
      (interception) => {
        const pageSize = interception.request.body.variables.pageSize
        const resultSize =
          interception.response.body.data.getSearchedClusters.result_size
        const totalCalls = Math.ceil(resultSize / pageSize)
        const remainingCalls = totalCalls - 1

        for (let i = 0; i < remainingCalls; i++) {
          cy.scrollTo('bottom', {
            duration: 1000
          })
          GraphQLCall.waitForCall('GetSearchedClusters', 'query', 30000).then(
            (interception) => {
              cy.get('[data-testid=cluster-list-cluster-name]').then(($el) => {
                const counts = $el.length
                if (counts === resultSize) {
                  cy.get('[data-testid=cluster-list-total-count]').should(
                    'contain',
                    counts
                  )
                }
              })
            }
          )
        }
      }
    )
  })
})
