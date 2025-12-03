import 'cypress-real-events'
import {GraphQLCall} from '../utils/graphql-test-utils'
import {login} from './login.cy'
const waitForAllCalls = (timeout: number = 30000) => {
  return GraphQLCall.waitForMultipleCalls(
    [
      {
        operationName: 'GetFeatureGroupFilters',
        callType: 'query'
      },
      {
        operationName: 'GetFeatureGroups',
        callType: 'query'
      },
      {
        operationName: 'GetFeatureGroups',
        callType: 'query'
      },
      {
        operationName: 'GetFeatureGroupsCount',
        callType: 'query'
      }
    ],
    timeout
  )
}

const loadAllData = (onComplete: Function) => {
  GraphQLCall.interceptCall('GetFeatureGroups', 'query')
  cy.scrollTo('bottom', {duration: 1000})
  cy.get('body').then((body) => {
    if (body.find('[data-testid=feature-group-listing-loader]').length > 0) {
      GraphQLCall.waitForCall('GetFeatureGroups', 'query', 30000).then(() => {
        loadAllData(onComplete)
      })
    } else {
      onComplete()
    }
  })
}

describe('Feature Store Listing Page Test', () => {
  beforeEach(() => {
    login('all', 'all')
    GraphQLCall.interceptMultipleCalls([
      {
        operationName: 'GetFeatureGroupFilters',
        callType: 'query'
      },
      {
        operationName: 'GetFeatureGroups',
        callType: 'query'
      },
      {
        operationName: 'GetFeatureGroups',
        callType: 'query'
      },
      {
        operationName: 'GetFeatureGroupsCount',
        callType: 'query'
      }
    ])
    cy.visit('http://localhost:7700/store')
  })

  it('Should render feature store listing page', () => {
    cy.url().should('include', '/store')
  })

  it('Should match the total count in online feature store', () => {
    waitForAllCalls().then((calls) => {
      loadAllData(() => {
        cy.get('[data-testid=feature-group-card]').should(
          'have.length',
          calls[3].response.body.data.getFeatureGroupsCount.data.onlineCount
        )
      })
    })
  })

  it('Should match the total count in offline feature store', () => {
    waitForAllCalls().then((calls) => {
      GraphQLCall.interceptCall('GetFeatureGroups', 'query')
      cy.get('[data-testid=offline-tab-button]').click()
      GraphQLCall.waitForCall('GetFeatureGroups', 'query').then(() => {
        loadAllData(() => {
          cy.get('[data-testid=feature-group-card]').should(
            'have.length',
            calls[3].response.body.data.getFeatureGroupsCount.data.offlineCount
          )
        })
      })
    })
  })

  it('Should render appropriate searched feature group', () => {
    const searchQuery = 'd11'
    waitForAllCalls().then(() => {
      GraphQLCall.interceptCall('GetFeatureGroups', 'query')
      cy.get('[data-testid=feature-store-search-bar]').type(searchQuery)
      GraphQLCall.waitForCall('GetFeatureGroups', 'query', 30000).then(() => {
        loadAllData(() => {
          cy.get('[data-testid=feature-group-title]').should(
            'contain',
            searchQuery
          )
          GraphQLCall.interceptCall('GetFeatureGroups', 'query')
          cy.get('[data-testid=offline-tab-button]').click()
          GraphQLCall.waitForCall('GetFeatureGroups', 'query', 30000).then(
            () => {
              loadAllData(() => {
                cy.get('[data-testid=feature-group-title]').should(
                  'contain',
                  searchQuery
                )
              })
            }
          )
        })
      })
    })
  })

  it('Should copy the code', () => {
    waitForAllCalls().then((calls) => {
      cy.get('[data-testid=feature-group-card]').first().click()
      cy.get('[data-testid=copy-code-dropdown-button]').click()
      cy.get('[data-testid=copy-code-menu-item]').realClick()
      const copyCode =
        calls[2].response.body.data.getFeatureGroups.data[0].copyCode[0].value
      cy.get('body').type('{esc}')
    })
  })

  it("Should take the users to details page on clicking 'View Details' button in online feature groups", () => {
    waitForAllCalls().then((calls) => {
      cy.get(
        '[data-testid=feature-group-card] [data-testid=feature-group-title]'
      )
        .first()
        .then((el) => {
          const featureGroupTitle = el.text()
          cy.log(featureGroupTitle)
          cy.get(
            '[data-testid=feature-group-card] [data-testid=feature-group-version]'
          )
            .first()
            .then((el) => {
              const featureGroupVersion = el.text().substring(1)
              cy.log(featureGroupVersion)
              cy.get('[data-testid=feature-group-card]').first().click()
              cy.get(
                '[data-testid=feature-group-card-view-details-button]'
              ).click()
              cy.url().should(
                'include',
                `/store/${featureGroupTitle}/${featureGroupVersion}/online/0`
              )
            })
        })
    })
  })

  it("Should take the users to details page on clicking 'View Details' button in offline feature groups", () => {
    waitForAllCalls().then((calls) => {
      GraphQLCall.interceptCall('GetFeatureGroups', 'query')
      cy.get('[data-testid=offline-tab-button]').click()
      GraphQLCall.waitForCall('GetFeatureGroups', 'query').then(() => {
        cy.get(
          '[data-testid=feature-group-card] [data-testid=feature-group-title]'
        )
          .first()
          .then((el) => {
            const featureGroupTitle = el.text()
            cy.log(featureGroupTitle)
            cy.get(
              '[data-testid=feature-group-card] [data-testid=feature-group-version]'
            )
              .first()
              .then((el) => {
                const featureGroupVersion = el.text().substring(1)
                cy.log(featureGroupVersion)
                cy.get('[data-testid=feature-group-card]').first().click()
                cy.get(
                  '[data-testid=feature-group-card-view-details-button]'
                ).click()
                cy.url().should(
                  'include',
                  `/store/${featureGroupTitle}/${featureGroupVersion}/offline/0`
                )
              })
          })
      })
    })
  })
})
