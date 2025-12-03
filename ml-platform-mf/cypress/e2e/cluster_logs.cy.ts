import {filter, first, has} from 'cypress/types/lodash'
import {getFormattedDateTimeWithSecondsForCompute} from '../../src/utils/getDateString'
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
      },
      {
        operationName: 'GetLogs',
        callType: 'query'
      }
    ])
    cy.visit('http://localhost:7700/clusters/')
    GraphQLCall.waitForCall('GetSearchedClusters', 'query', 20000)

    cy.get('[data-testid=cluster-list-cluster-name]').eq(0).click()

    cy.get('*[data-testid="cluster-details-page-header"]').click()
  })

  it('Should filter out the logs according to the level query', () => {
    GraphQLCall.waitForCall('GetLogs', 'query', 30000).then((interception) => {
      cy.get('[data-testid=level-filter]').should('exist').click()
      cy.get('[data-testid=filter-drop-option]')
        .should('have.length.gt', 0)
        .then(($filters) => {
          const totalFilters = $filters.length
          const randomIndex = Math.floor(Math.random() * totalFilters)
          const selectedFilter = $filters.eq(randomIndex)
          const filterName = selectedFilter.text().trim()

          selectedFilter.click()
          cy.get('body').type('{esc}')

          GraphQLCall.waitForCall('GetLogs', 'query', 30000).then(() => {
            cy.get('body').then(($body) => {
              const hasElements =
                $body.find('[data-testid=cluster-logs-events-filter]').length >
                0
              if (hasElements) {
                cy.get('[data-testid=cluster-logs-level-filter]').each(
                  ($el) => {
                    expect($el.text().toLowerCase()).to.contain(
                      filterName.toLowerCase()
                    )
                  }
                )
              }
            })
          })
        })
    })
  })
  it('Should filter out the logs according to the component query', () => {
    GraphQLCall.waitForCall('GetLogs', 'query', 30000).then((interception) => {
      cy.get('[data-testid=component-filter]').should('exist').click()
      cy.get('[data-testid=filter-drop-option]')
        .should('have.length.gt', 0)
        .then(($filters) => {
          const totalFilters = $filters.length
          const randomIndex = Math.floor(Math.random() * totalFilters)
          const selectedFilter = $filters.eq(randomIndex)
          const filterName = selectedFilter.text().trim()

          selectedFilter.click()
          cy.get('body').type('{esc}')

          GraphQLCall.waitForCall('GetLogs', 'query', 30000).then(() => {
            cy.get('body').then(($body) => {
              const hasElements =
                $body.find('[data-testid=cluster-logs-events-filter]').length >
                0
              if (hasElements) {
                cy.get('[data-testid=cluster-logs-component-filter]')
                  .should('exist')
                  .each(($el) => {
                    expect($el.text().toLowerCase()).to.contain(
                      filterName.toLowerCase()
                    )
                  })
              }
            })
          })
        })
    })
  })
  it('Should filter out the logs according to the events query', () => {
    GraphQLCall.waitForCall('GetLogs', 'query', 30000).then((interception) => {
      cy.get('[data-testid=event-filter]').should('exist').click()
      cy.get('[data-testid=filter-drop-option]')
        .should('have.length.gt', 0)
        .then(($filters) => {
          const totalFilters = $filters.length
          const randomIndex = Math.floor(Math.random() * totalFilters)
          const selectedFilter = $filters.eq(randomIndex)
          const filterName = selectedFilter.text().trim()

          selectedFilter.click()
          cy.get('body').type('{esc}')

          GraphQLCall.waitForCall('GetLogs', 'query', 30000).then(() => {
            cy.get('body').then(($body) => {
              const hasElements =
                $body.find('[data-testid=cluster-logs-events-filter]').length >
                0

              if (hasElements) {
                cy.get('[data-testid=cluster-logs-events-filter]').each(
                  ($el) => {
                    expect($el.text().toLowerCase()).to.contain(
                      filterName.toLowerCase()
                    )
                  }
                )
              }
            })
          })
        })
    })
  })
  it('Should filter out the logs according to the timestamp query', () => {
    GraphQLCall.waitForCall('GetLogs', 'query', 30000).then((interception) => {
      cy.get('[data-testid=timestamp-filter]').should('exist').click()
      cy.get('[data-testid=timestamp-drop-filter]')
        .should('have.length.gt', 0)
        .then(($filters) => {
          const totalFilters = $filters.length
          const randomIndex = Math.floor(Math.random() * totalFilters)
          const selectedFilter = $filters.eq(randomIndex)

          selectedFilter.click()

          const startTime = new Date()
          const startHour = startTime.setHours(startTime.getHours() - 3)
          const endTime = new Date()
          const endHour = endTime.setHours(endTime.getHours())

          GraphQLCall.waitForCall('GetLogs', 'query', 30000).then(() => {
            cy.get('body').then(($body) => {
              const hasElements =
                $body.find('[data-testid=cluster-logs-events-filter]').length >
                0

              if (hasElements) {
                cy.get('[data-testid=cluster-logs-timestamp-filter]').each(
                  ($el) => {
                    const logTimeStamp = new Date($el.text())
                    const logHour = logTimeStamp.setHours(
                      logTimeStamp.getHours()
                    )
                    expect(logHour >= startHour).to.be.true
                    expect(logHour <= endHour).to.be.true
                  }
                )
              }
            })
          })
        })
    })
  })
  it('Should filter out the logs according to the Log Group query', () => {
    GraphQLCall.waitForCall('GetLogs', 'query', 30000).then((interception) => {
      cy.get('[data-testid=log-group-filter]')
        .should('exist')
        .click()
        .contains('Oct 24, 2024, 12:53 PM / Oct 24, 2024, 12:53 PM')
        .click()

      const startTime = new Date('Oct 24, 2024, 12:53 PM ')
      const startHour = startTime.setHours(startTime.getHours())
      const endTime = new Date('Oct 24, 2024, 12:54 PM ')
      const endHour = endTime.setHours(endTime.getHours())

      GraphQLCall.waitForCall('GetLogs', 'query', 30000).then(() => {
        cy.get('body').then(($body) => {
          const hasElements =
            $body.find('[data-testid=cluster-logs-events-filter]').length > 0

          if (hasElements) {
            cy.get('[data-testid=cluster-logs-timestamp-filter]').each(
              ($el) => {
                const logTimeStamp = new Date($el.text())
                const logHour = logTimeStamp.setHours(logTimeStamp.getHours())
                expect(logHour >= startHour).to.be.true
                expect(logHour <= endHour).to.be.true
              }
            )
          }
        })
      })
    })
  })
})
