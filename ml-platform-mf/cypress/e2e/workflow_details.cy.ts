import cronstrue from 'cronstrue'
import {
  aliasMutation,
  aliasQuery,
  GRAPHQL_ENDPOINT
} from '../utils/graphql-test-utils'
import {login} from './login.cy'
const cronExpression = (cron: string) => {
  return cronstrue.toString(cron, {
    throwExceptionOnParseError: false,
    verbose: true
  })
}

describe('Workflow Details Page Test', () => {
  beforeEach(() => {
    login('all', 'all')
    cy.visit('http://localhost:7700/workflows')
    cy.wait(5000)
    cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
      aliasQuery(req, 'GetWorkflowDetails')
    })
    cy.get('[data-testid=workflow-row]').first().click()
  })

  it('Should render workflow details page', () => {
    cy.get('[data-testid=workflow-details-page]').should('be.visible')
  })

  it('Workflow ID should match the query params', () => {
    cy.wait(5000)
    cy.get('[data-testid=workflow-details-page-workflow-id]').then((el) => {
      const workflowId = el.text()
      cy.url().should('include', workflowId)
    })
  })

  it('Back button should redirect to workflows listing page', () => {
    cy.get('[data-testid=workflow-details-page-back-button]').click()
    cy.url().should('include', '/workflows')
  })

  it('Should open the workflow schedule side panel', () => {
    cy.wait(5000)
    cy.get('[data-testid=workflow-schedule-button]').click()
    cy.get('[data-testid=workflow-schedule-side-panel-heading]').should(
      'be.visible'
    )
  })

  it('Should update the schedule of the workflow', () => {
    cy.wait(5000)
    cy.get('[data-testid=workflow-schedule-button]').click()
    cy.get('[data-testid=workflow-schedule-side-panel-heading]').should(
      'be.visible'
    )
    cy.get('[data-testid=workflow-schedule-min-input]').then((el) => {
      if (el.text() === '') {
        cy.get('[data-testid=workflow-schedule-min-input]').type('10')
      } else {
        cy.get('[data-testid=workflow-schedule-min-input]').clear().type('10')
      }
    })
    cy.get('[data-testid=workflow-schedule-hour-input]').then((el) => {
      if (el.text() === '') {
        cy.get('[data-testid=workflow-schedule-hour-input]').type('3')
      } else {
        cy.get('[data-testid=workflow-schedule-hour-input]').clear().type('3')
      }
    })
    cy.get('[data-testid=workflow-schedule-day-input]').then((el) => {
      if (el.text() === '') {
        cy.get('[data-testid=workflow-schedule-day-input]').type('*')
      } else {
        cy.get('[data-testid=workflow-schedule-day-input]').clear().type('*')
      }
    })
    cy.get('[data-testid=workflow-schedule-month-input]').then((el) => {
      if (el.text() === '') {
        cy.get('[data-testid=workflow-schedule-month-input]').type('2')
      } else {
        cy.get('[data-testid=workflow-schedule-month-input]').clear().type('2')
      }
    })
    cy.get('[data-testid=workflow-schedule-week-input]').then((el) => {
      if (el.text() === '') {
        cy.get('[data-testid=workflow-schedule-week-input]').type('*')
      } else {
        cy.get('[data-testid=workflow-schedule-week-input]').clear().type('*')
      }
    })
    cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
      aliasMutation(req, 'UpdateWorkflowSchedule')
    })
    cy.get('[data-testid=workflow-schedule-submit-button]').click()
    cy.wait('@gqlUpdateWorkflowScheduleMutation').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
  })

  it('Should have the schedule displayed in the workflow details page', () => {
    cy.wait(5000)
    cy.get('[data-testid=workflow-cron-expression]').then((el) => {
      const cron = el.text()
      const expression = cronExpression('10 3 * 2 *')
      expect(cron).equal(expression)
    })
  })

  it("Should reset the workflow's schedule", () => {
    cy.wait(5000)
    cy.get('[data-testid=workflow-schedule-button]').click()
    cy.get('[data-testid=workflow-schedule-side-panel-heading]').should(
      'be.visible'
    )
    cy.get('[data-testid=workflow-schedule-min-input]').then((el) => {
      if (el.text() !== '') {
        cy.get('[data-testid=workflow-schedule-min-input]').clear()
      }
    })
    cy.get('[data-testid=workflow-schedule-hour-input]').then((el) => {
      if (el.text() !== '') {
        cy.get('[data-testid=workflow-schedule-hour-input]').clear()
      }
    })
    cy.get('[data-testid=workflow-schedule-day-input]').then((el) => {
      if (el.text() !== '') {
        cy.get('[data-testid=workflow-schedule-day-input]').clear()
      }
    })
    cy.get('[data-testid=workflow-schedule-month-input]').then((el) => {
      if (el.text() !== '') {
        cy.get('[data-testid=workflow-schedule-month-input]').clear()
      }
    })
    cy.get('[data-testid=workflow-schedule-week-input]').then((el) => {
      if (el.text() !== '') {
        cy.get('[data-testid=workflow-schedule-week-input]').clear()
      }
    })
    cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
      aliasMutation(req, 'UpdateWorkflowSchedule')
    })
    cy.get('[data-testid=workflow-schedule-submit-button]').click()
    cy.wait('@gqlUpdateWorkflowScheduleMutation').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
      cy.get('[data-testid=workflow-cron-expression]').then((el) => {
        const cron = el.text()
        expect(cron).equal('N/A')
      })
    })
  })

  it("Should open the workflow resume modal when 'Resume' button is clicked", () => {
    cy.wait(5000)
    cy.get('[data-testid=workflow-resume-button]').click()
    cy.get('[role=dialog]').should('exist')
  })

  it('Should toggle the status of the workflow when Resume/Stop button is clicked in the workflow resume modal', () => {
    cy.wait(5000)
    cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
      aliasMutation(req, 'ResumeWorkflowSchedule')
      aliasMutation(req, 'PauseWorkflowSchedule')
    })
    cy.get('[data-testid=workflow-status-container]').then((el) => {
      const childDiv = el.children()
      const status = childDiv[0].children[1].innerHTML
      expect(status).oneOf(['Active', 'Inactive'])

      if (status === 'Active') {
        cy.get('[data-testid=workflow-pause-button]').click()
        cy.get('[role=dialog]').should('exist')
        cy.get('button').contains('Pause').click()
        cy.wait('@gqlPauseWorkflowScheduleMutation').then((interception) => {
          expect(interception.response.statusCode).to.equal(200)
          cy.get('[data-testid=workflow-status-container]').then((el) => {
            const childDiv = el.children()
            const status = childDiv[0].children[1].innerHTML
            expect(status).equal('Inactive')
          })
        })
      } else {
        cy.get('[data-testid=workflow-resume-button]').click()
        cy.get('[role=dialog]').should('exist')
        cy.get('button').contains('Restart').click()
        cy.wait('@gqlResumeWorkflowScheduleMutation').then((interception) => {
          expect(interception.response.statusCode).to.equal(200)
          cy.get('[data-testid=workflow-status-container]').then((el) => {
            const childDiv = el.children()
            const status = childDiv[0].children[1].innerHTML
            expect(status).equal('Active')
          })
        })
      }
    })
  })

  it('Should open an actions dropdown when three dots button is clicked', () => {
    const actions = ['Edit', 'YAML', 'Delete']
    cy.wait(5000)
    cy.get('[data-testid=workflow-details-page-actions-button]').click()
    cy.get('[data-cy=workflow-list-row-action]')
      .should('exist')
      .each(($el) => {
        actions.includes($el.text())
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

  it('Should toggle the side panel when the toggle button is clicked', () => {
    cy.wait(5000)
    cy.get('[data-testid=side-panel-collapse-button]').click()
    cy.get('[data-testid=side-panel-collapse-button]').should('not.exist')
    cy.get('[data-testid=side-panel-expand-button]').should('exist')
    cy.get('[data-testid=side-panel-expand-button]').click()
    cy.get('[data-testid=side-panel-expand-button]').should('not.exist')
    cy.get('[data-testid=side-panel-collapse-button]').should('exist')
  })

  it("Should toggle between Runs and Tasks when 'Runs' and 'Tasks' buttons are clicked", () => {
    cy.wait(5000)
    cy.get('[data-testid=workflow-details-tab-Tasks]').click()
    cy.get('[data-testid=workflow-details-tasks-tab]').should('exist')
    cy.get('[data-testid=workflow-details-tab-Runs]').click()
    cy.get('[data-testid=workflow-details-runs-tab]').should('exist')
  })

  it('Should show no runs found when there are no runs for the workflow', () => {
    cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
      aliasQuery(req, 'GetWorkflowRuns')
    })

    cy.wait('@gqlGetWorkflowRunsQuery').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
      const runs = interception.response.body.data.getWorkflowRuns.data.runs
      if (runs.length === 0) {
        cy.get('[data-testid=workflow-details-no-runs-message]').should('exist')
      }
    })
  })

  it('Should filter by status', () => {
    cy.wait(5000)
    cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
      aliasQuery(req, 'GetWorkflowRuns')
    })
    const filters = ['running', 'failed', 'success']
    filters.forEach((filter) => {
      // Clear all filters
      cy.get('[data-testid=basic-filter-dropdown-button]').click()
      cy.get(`[data-testid=basic-filter-dropdown-menu-item-${filter}]`).click()
      cy.get('body').click()
      cy.wait('@gqlGetWorkflowRunsQuery').then((interception) => {
        expect(interception.response.statusCode).to.equal(200)
        const runs = interception.response.body.data.getWorkflowRuns.data.runs

        if (runs.length > 0) {
          runs.forEach((run) => {
            cy.log('Runs length: ', runs.length)
            expect(run.run_status).equal(filter)
          })
        } else {
          cy.get('[data-testid=workflow-details-no-runs-message]').should(
            'exist'
          )
        }
      })
      cy.get('[data-testid=basic-filter-dropdown-button]').click()
      cy.get(`[data-testid=basic-filter-dropdown-menu-item-${filter}]`).click()
      cy.get('body').click()
    })
  })
  // TODO
  // it.only("Should load the workflow runs when scrolled to the bottom of the table", () => {
  //   cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
  //     aliasQuery(req, 'GetWorkflowRuns')
  //   })
  //   cy.wait(5000)
  //   cy.wait('@gqlGetWorkflowRunsQuery').then((interception) => {
  //     cy.get('[class=MuiTable-root]').scrollTo('bottom')
  //   })
  // })

  it.only('Should set max concurrent runs for the workflow', () => {
    cy.wait('@gqlGetWorkflowDetailsQuery').then((interception) => {
      cy.get('[data-testid=max-concurrent-run-heading]').then((el) => {
        expect(interception.response.statusCode).to.equal(200)
        if (el.text() === 'ADD') {
          cy.get('[data-testid=add-max-concurrent-run-button]').click()
          cy.get('[data-testid=max-concurrent-run-drawer-header]').should(
            'exist'
          )
          cy.get('[data-testid=max-concurrent-run-input]').type('3')
          cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
            aliasMutation(req, 'UpdateWorkflowMaxConcurrentRuns')
          })
          cy.get('[data-testid=save-max-concurrent-run-button]').click()
          cy.wait('@gqlUpdateWorkflowMaxConcurrentRunsMutation').then(
            (interception) => {
              expect(interception.response.statusCode).to.equal(200)
              cy.get('[data-testid=max-concurrent-run-heading]').then((el) => {
                expect(el.text()).equal('3')
              })
            }
          )
        } else {
          expect(el.text()).equal(
            interception.response.body.data.getWorkflowDetails.data.max_concurrent_runs.toString()
          )
        }
      })
    })
  })

  it("Should update the number of retries for the workflow's tasks", () => {
    cy.wait('@gqlGetWorkflowDetailsQuery').then((interception) => {
      cy.get('[data-testid=no-of-retries-for-workflow]').then((el) => {
        expect(interception.response.statusCode).to.equal(200)
        cy.log('el.text()', el.text())
        if (el.text() === 'ADD') {
          cy.get('[data-testid=add-no-of-retries-button]').click()
          cy.get('[data-testid=no-of-retries-drawer-header]').should('exist')
          cy.get('[data-testid=no-of-retries-input]').type('3')
          cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
            aliasMutation(req, 'UpdateWorkflowRetries')
          })
          cy.get('[data-testid=no-of-retries-save-button]').click()
          cy.wait('@gqlUpdateWorkflowRetriesMutation').then((interception) => {
            expect(interception.response.statusCode).to.equal(200)
            cy.get('[data-testid=no-of-retries-for-workflow]').then((el) => {
              expect(el.text()).equal('3')
            })
          })
        } else {
          expect(el.text()).equal(
            interception.response.body.data.getWorkflowDetails.data.retries.toString()
          )
        }
      })
    })
  })
})
