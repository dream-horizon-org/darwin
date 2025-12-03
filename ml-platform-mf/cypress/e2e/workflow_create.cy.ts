import {
  aliasMutation,
  aliasQuery,
  GraphQLCall,
  GRAPHQL_ENDPOINT
} from '../utils/graphql-test-utils'
import {login} from './login.cy'
// import { randomUUID } from "crypto"

const goToEditPage = () => {
  GraphQLCall.interceptCall('GetWorkflows', 'query')
  cy.visit('http://localhost:7700/workflows')

  GraphQLCall.waitForCall('GetWorkflows', 'query').then((interception) => {
    cy.get('[data-testid=workflows-search-bar]').type('workflow_1_')
    GraphQLCall.interceptCall('GetWorkflowDetails', 'query')
    cy.get('[data-testid=workflow-row]').first().click()
    GraphQLCall.waitForCall('GetWorkflowDetails', 'query').then(
      (interception) => {
        cy.get('[data-testid=workflow-details-page-actions-button]').click()
        cy.get('[data-cy=workflow-list-row-action]')
          .should('exist')
          .each(($el) => {
            if ($el.text() === 'Edit') {
              cy.wrap($el).click()
            }
          })
      }
    )
  })
}

const addTask = () => {
  cy.get('[data-testid=workflow-task-name]').type('task_1')
  cy.get('[data-testid=workflow-task-source-git]').click()
  cy.get('[data-testid=workflow-task-git-repo-url]').type('random_git_url')
  cy.get('[data-testid=workflow-task-file-path]').type('random_branch')
  GraphQLCall.interceptCall('GetAllJobClusters', 'query')
  cy.get('[data-testid=workflow-task-cluster]').click()
  GraphQLCall.waitForCall('GetAllJobClusters', 'query').then((interception) => {
    cy.get('[data-testid=workflow-job-cluster-list-item]').first().click()
  })
  cy.get('[data-testid=workflow-add-task-button]').click()
  cy.get('[data-testid=workflow-add-task-button]').should('not.exist')
}

const addMultipleTasks = () => {
  cy.get('[data-testid=workflow-task-name]').type('task_1')
  cy.get('[data-testid=workflow-task-source-git]').click()
  cy.get('[data-testid=workflow-task-git-repo-url]').type('random_git_url')
  cy.get('[data-testid=workflow-task-file-path]').type('random_branch')
  GraphQLCall.interceptCall('GetAllJobClusters', 'query')
  cy.get('[data-testid=workflow-task-cluster]').click()
  GraphQLCall.waitForCall('GetAllJobClusters', 'query').then((interception) => {
    cy.get('[data-testid=workflow-job-cluster-list-item]').first().click()
  })

  cy.get('[data-testid=workflow-add-task-button]').click()
  cy.get('[data-testid=workflow-add-new-task-button]').click()
  cy.get('[data-testid=workflow-task-name]').type('task_2')
  cy.get('[data-testid=workflow-task-source-git]').click()
  cy.get('[data-testid=workflow-task-git-repo-url]').type('random_git_url')
  cy.get('[data-testid=workflow-task-file-path]').type('random_branch')
  GraphQLCall.interceptCall('GetAllJobClusters', 'query')
  cy.get('[data-testid=workflow-task-cluster]').click()
  GraphQLCall.waitForCall('GetAllJobClusters', 'query').then((interception) => {
    cy.get('[data-testid=workflow-job-cluster-list-item]').first().click()
  })

  cy.get('[data-testid=workflow-add-task-button]').click()
  cy.get('[data-testid=workflow-add-task-button]').should('not.exist')
}

const addMultipleDependentTasks = () => {
  addMultipleTasks()
  cy.get('[data-testid=workflow-task-node]').first().click()
  cy.get('[data-testid=workflow-task-depends-on]').click()
  cy.get('[data-testid=workflow-task-depends-on]').type('task_2')
  cy.get('[data-testid=workflow-task-depends-on]').type('{downarrow}{enter}')
}

describe('Workflow Details Page Test', () => {
  beforeEach(() => {
    login('all', 'all')
    cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
      aliasQuery(req, 'CheckUniqueWorkflow')
    })
    cy.visit('http://localhost:7700/workflows/create')
  })

  it('Should set a workflow name', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(
      (interception) => {
        cy.get('[data-testid=workflow-name]').type(
          '{selectall}{backspace}My Workflow'
        )
      }
    )
  })

  it('Should set a workflow description', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(
      (interception) => {
        cy.get('[data-testid=add-description-button]').click()
        cy.get('[data-testid=workflow-description]').type(
          'This is a description'
        )
      }
    )
  })

  it('Should select a task file from workspace', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(
      (interception) => {
        GraphQLCall.interceptGraphqlAndReturnFixture(
          'Workspaces',
          'query',
          'workflow_create_workspaces.json'
        )
        cy.get('[data-testid=workflow-workspace-path-button]').click()
        GraphQLCall.waitForCall('Workspaces', 'query').then((interception) => {
          GraphQLCall.interceptGraphqlAndReturnFixture(
            'GetProjects',
            'query',
            'workflow_create_projects.json'
          )
          cy.get('[data-testid=workflow-worrkspaces-list-item]').first().click()
          GraphQLCall.waitForCall('GetProjects', 'query').then(
            (interception) => {
              GraphQLCall.interceptGraphqlAndReturnFixture(
                'GetCodespaces',
                'query',
                'workflow_create_codespaces.json'
              )
              cy.get('[data-testid=workflow-projects-list-item]')
                .first()
                .click()
              GraphQLCall.waitForCall('GetCodespaces', 'query').then(
                (interception) => {
                  GraphQLCall.interceptGraphqlAndReturnFixture(
                    'CodespaceFolders',
                    'query',
                    'workflow_create_codespace_folders.json'
                  )
                  cy.get('[data-testid=workflow-codespaces-list-item]')
                    .first()
                    .click()
                  GraphQLCall.waitForCall('CodespaceFolders', 'query').then(
                    (interception) => {
                      cy.get('[data-testid=workflow-codespace-files-list-item]')
                        .first()
                        .click()
                      cy.get(
                        '[data-testid=workflow-workspace-path-button] > .MuiOutlinedInput-root > input'
                      ).should(
                        'have.value',
                        'workspace_1/project_1/codespace_1/untitled.ipynb'
                      )
                    }
                  )
                }
              )
            }
          )
        })
      }
    )
  })

  it('Should add a task file from git', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(
      (interception) => {
        cy.get('[data-testid=workflow-task-source-git]').click()
        cy.get('[data-testid=workflow-task-git-repo-url]').type(
          'random_git_url'
        )
        cy.get('[data-testid=workflow-task-file-path]').type('random_branch')
      }
    )
  })

  it('Should attach a cluster to a task', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(
      (interception_check_unique) => {
        GraphQLCall.interceptCall('GetAllJobClusters', 'query')
        cy.get('[data-testid=workflow-task-cluster]').click()
        GraphQLCall.waitForCall('GetAllJobClusters', 'query').then(
          (interception) => {
            cy.get('[data-testid=workflow-job-cluster-list-item-cluster-name]')
              .first()
              .then(($el) => {
                const clusterName = $el.text()
                cy.log(clusterName)
                cy.wrap($el).click()
                cy.get(
                  '[data-testid=workflow-task-cluster] > .MuiOutlinedInput-root > input'
                ).should('have.value', clusterName)
              })
          }
        )
      }
    )
  })

  it('Should update the task card', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(
      (interception_check_unique) => {
        cy.get('[data-testid=workflow-task-name]').type('task_1')
        cy.get('[data-testid=node-task-name]').should('have.text', 'task_1')
        cy.get('[data-testid=workflow-task-source-git]').click()
        cy.get('[data-testid=workflow-task-git-repo-url]').type(
          'random_git_url'
        )
        cy.get('[data-testid=workflow-task-file-path]').type('random_branch')
        cy.get('[data-testid=node-source-file]').should(
          'have.text',
          'random_branch'
        )

        GraphQLCall.interceptCall('GetAllJobClusters', 'query')
        cy.get('[data-testid=workflow-task-cluster]').click()
        GraphQLCall.waitForCall('GetAllJobClusters', 'query').then(
          (interception) => {
            cy.get('[data-testid=workflow-job-cluster-list-item-cluster-name]')
              .first()
              .then(($el) => {
                const clusterName = $el.text()
                cy.wrap($el).click()
                cy.get(
                  '[data-testid=workflow-task-cluster] > .MuiOutlinedInput-root > input'
                ).should('have.value', clusterName)

                cy.get('[data-testid=node-cluster]').should(
                  'have.text',
                  clusterName
                )
              })
          }
        )
      }
    )
  })

  it('Should add a single tasks', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(
      (interception_check_unique) => {
        cy.get('[data-testid=workflow-task-name]').type('task_1')
        cy.get('[data-testid=workflow-task-source-git]').click()
        cy.get('[data-testid=workflow-task-git-repo-url]').type(
          'random_git_url'
        )
        cy.get('[data-testid=workflow-task-file-path]').type('random_branch')
        GraphQLCall.interceptCall('GetAllJobClusters', 'query')
        cy.get('[data-testid=workflow-task-cluster]').click()
        GraphQLCall.waitForCall('GetAllJobClusters', 'query').then(
          (interception) => {
            cy.get('[data-testid=workflow-job-cluster-list-item]')
              .first()
              .click()
          }
        )

        cy.get('[data-testid=workflow-add-task-button]').click()
        cy.get('[data-testid=workflow-add-task-button]').should('not.exist')
      }
    )
  })

  it('Should add multiple tasks', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(
      (interception) => {
        addMultipleTasks()
      }
    )
  })

  it('Should add tasks and delete it', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(
      (interception_check_unique) => {
        addMultipleTasks()
        cy.get('[data-testid=workflow-delete-task-button]').first().click()
        cy.get('[data-testid=node-task-name]')
          .first()
          .should('not.have.text', 'task_1')
      }
    )
  })

  it('Should add dependent tasks', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(
      (interception_check_unique) => {
        addMultipleDependentTasks()
        cy.get('[data-testid=workflow-add-task-button]').click()
        cy.get('[data-testid=workflow-task-node]').should('have.length', 2)
      }
    )
  })

  it("Should rename a task's name with dependents", () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(
      (interception_check_unique) => {
        addMultipleDependentTasks()
        addMultipleDependentTasks()
        cy.get('[data-testid=workflow-add-task-button]').click()
        cy.get('[data-testid=workflow-task-node]').each(($el, index, $list) => {
          if (index === 1) {
            cy.wrap($el).click()
          }
        })
        cy.get('[data-testid=workflow-task-name]').clear().type('task_3')
        cy.get('[data-testid=workflow-add-task-button]').click()
        cy.get('[data-testid=workflow-task-node]').should('have.length', 2)
      }
    )
  })

  it('Should create a job cluster and attach it to a task', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(
      (interception) => {
        addTask()
        GraphQLCall.interceptMultipleCalls([
          {operationName: 'GetAllJobClusters', callType: 'query'},
          {operationName: 'fetchComputeTags', callType: 'query'},
          {operationName: 'GetComputeGpuPods', callType: 'query'},
          {operationName: 'GetComputeNodeTypes', callType: 'query'},
          {operationName: 'GetComputeRuntimeList', callType: 'query'},
          {operationName: 'GetComputeAvailabilityZones', callType: 'query'},
          {operationName: 'GetComputeDiscTypes', callType: 'query'},
          {operationName: 'GetComputeInstanceRoles', callType: 'query'},
          {operationName: 'GetComputeTemplates', callType: 'query'}
        ])
        cy.get('[data-testid=workflow-task-node]').first().click()
        cy.get('[data-testid=workflow-task-cluster]').click()

        cy.get('[data-testid=create-job-cluster-button]').click()
        const randomUUID = () => Cypress._.random(0, 1e6)
        const random = randomUUID()
        cy.get('[data-testid=cluster-name-input]').type(
          `test_job_cluster_for_automation_test-${random}`
        )
        cy.get('[data-testid=add-tag-button]').click()
        cy.get('[data-testid=add-tag-dropdown]').click()
        cy.get('[data-testid=add-tag-dropdown]').type('test_tag{enter}')
        cy.get('body').click()
        GraphQLCall.waitForCall('GetComputeRuntimeList', 'query').then(
          (interception) => {
            cy.get('[data-testid=compute-runtime-dropdown]').click()
            cy.get('[data-testid=compute-runtime-dropdown]').type(
              '{downarrow}{enter}'
            )
          }
        )
        GraphQLCall.waitForCall('GetComputeNodeTypes', 'query').then(
          (interception) => {
            cy.get('[data-testid=head-node-type-dropdown]').click()
            cy.get('[data-testid=head-node-type-dropdown]').type(
              '{downarrow}{enter}'
            )
          }
        )
        cy.get('[data-testid=head-core-input]').type('4')
        cy.get('[data-testid=head-memory-input]').type('16')

        cy.get('[data-testid=worker-node-type-dropdown]').click()
        cy.get('[data-testid=worker-node-type-dropdown]').type(
          '{downarrow}{enter}'
        )

        cy.get('[data-testid=worker-core-pod-input]').type('4')
        cy.get('[data-testid=worker-memory-pod-input] input').type('16')
        cy.get('[data-testid=worker-min-pod-input]').type('2')
        cy.get('[data-testid=worker-max-pod-input]').type('4')
        GraphQLCall.interceptCall('CreateJobClusterDefinition', 'mutation')
        cy.get('[data-testid=create-cluster-definition-button]').click()

        GraphQLCall.waitForCall('CreateJobClusterDefinition', 'mutation').then(
          (interception) => {
            expect(interception.response.statusCode).to.eq(200)
            GraphQLCall.waitForCall('GetAllJobClusters', 'query').then(
              (interception) => {
                cy.wait(5000)
                cy.get('[data-testid=workflow-job-cluster-search]').type(
                  `test_job_cluster_for_automation_test-${random}`
                )
                cy.get('[data-testid=workflow-job-cluster-list-item]')
                  .first()
                  .click()
                cy.get(
                  '[data-testid=workflow-task-cluster] > .MuiOutlinedInput-root > input'
                ).should(
                  'have.value',
                  `test_job_cluster_for_automation_test-${random}`
                )
              }
            )
          }
        )
      }
    )
  })

  it('Should create a workflow', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(() => {
      addMultipleDependentTasks()
      cy.get('[data-testid=workflow-add-task-button]').click()
      cy.get('[data-testid=workflow-task-node]').should('have.length', 2)
      cy.get('[data-testid=workflow-create-edit-button] button').should(
        'be.enabled'
      )
      cy.get('[data-testid=workflow-create-edit-button]').click()
      const randomUUID = () => Cypress._.random(0, 1e6)
      const random = randomUUID()
      cy.get('[data-testid=workflow-create-side-panel-workflow-name]')
        .clear()
        .type(`workflow_1_${random}`)
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-description]'
      ).type('This is a test workflow')
      cy.get('[data-testid=workflow-create-side-panel-workflow-tags]').click()
      cy.get('[data-testid=workflow-create-side-panel-workflow-tags]').type(
        'test_tag{enter}'
      )
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-minutes]'
      ).type('0')
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-hours]'
      ).type('12')
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-day]'
      ).type('*')
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-month]'
      ).type('*')
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-week]'
      ).type('*')
      GraphQLCall.interceptCall('CreateWorkflow', 'mutation')
      cy.get('[data-testid=workflow-create-sidepanel-create-button]').should(
        'exist'
      )
      cy.get('[data-testid=workflow-create-sidepanel-create-button]').click()
      GraphQLCall.waitForCall('CreateWorkflow', 'mutation', 60000).then(
        (interception) => {
          expect(interception.response.statusCode).to.eq(200)
          // check if user is redirected to /workflows
          cy.url().should('eq', 'http://localhost:7700/workflows')
        }
      )
    })
  })

  it('Should create a workflow with all purpose cluster', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(() => {
      addMultipleDependentTasks()
      cy.get('[data-testid=workflow-add-task-button]').click()
      cy.get('[data-testid=workflow-task-node]').should('have.length', 2)
      cy.get('[data-testid=workflow-create-edit-button] button').should(
        'be.enabled'
      )
      cy.get('[data-testid=workflow-task-node]').each(($el, index, $list) => {
        cy.wrap($el).click()
        GraphQLCall.interceptMultipleCalls([
          {operationName: 'GetAllJobClusters', callType: 'query'},
          {operationName: 'GetAllClusters', callType: 'query'}
        ])
        cy.get('[data-testid=workflow-task-cluster]').click()
        GraphQLCall.waitForMultipleCalls(
          [
            {
              operationName: 'GetAllJobClusters',
              callType: 'query'
            },
            {
              operationName: 'GetAllClusters',
              callType: 'query'
            }
          ],
          30000
        ).then((interception) => {
          cy.get('[data-testid=workflow-cluster-list-tab-1]').click()
          cy.get('[data-testid=workflow-job-cluster-list-item-cluster-name]')
            .first()
            .then(($el) => {
              const clusterName = $el.text()
              cy.wrap($el).click()
              cy.get(
                '[data-testid=workflow-task-cluster] > .MuiOutlinedInput-root > input'
              ).should('have.value', clusterName)
            })
        })
      })
      cy.get('[data-testid=workflow-add-task-button]').click()
      cy.get('[data-testid=workflow-create-edit-button] button').should(
        'be.enabled'
      )
      GraphQLCall.interceptCall('CreateWorkflow', 'mutation')
      cy.get('[data-testid=workflow-create-edit-button]').click()
      cy.get('[data-testid=workflow-create-sidepanel-create-button]').should(
        'exist'
      )
      // Fill name, description, tags, schedule
      const randomUUID = () => Cypress._.random(0, 1e6)
      const random = randomUUID()
      cy.get('[data-testid=workflow-create-side-panel-workflow-name]')
        .clear()
        .type(`workflow_1_${random}`)
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-description]'
      ).type('This is a test workflow')
      cy.get('[data-testid=workflow-create-side-panel-workflow-tags]').click()
      cy.get('[data-testid=workflow-create-side-panel-workflow-tags]').type(
        'test_tag{enter}'
      )
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-minutes]'
      ).type('0')
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-hours]'
      ).type('12')
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-day]'
      ).type('*')
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-month]'
      ).type('*')
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-week]'
      ).type('*')
      cy.get('[data-testid=workflow-create-sidepanel-create-button]').click()
      GraphQLCall.waitForCall('CreateWorkflow', 'mutation', 60000).then(
        (interception) => {
          expect(interception.response.statusCode).to.eq(200)
          cy.url().should('eq', 'http://localhost:7700/workflows')
        }
      )
    })
  })

  it('Should be available on listing page after creation', () => {
    GraphQLCall.waitForCall('CheckUniqueWorkflow', 'query').then(() => {
      addMultipleDependentTasks()
      cy.get('[data-testid=workflow-add-task-button]').click()
      cy.get('[data-testid=workflow-task-node]').should('have.length', 2)
      cy.get('[data-testid=workflow-create-edit-button] button').should(
        'be.enabled'
      )
      cy.get('[data-testid=workflow-create-edit-button]').click()
      const randomUUID = () => Cypress._.random(0, 1e6)
      const random = randomUUID()
      cy.get('[data-testid=workflow-create-side-panel-workflow-name]')
        .clear()
        .type(`workflow_1_${random}`)
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-description]'
      ).type('This is a test workflow')
      cy.get('[data-testid=workflow-create-side-panel-workflow-tags]').click()
      cy.get('[data-testid=workflow-create-side-panel-workflow-tags]').type(
        'test_tag{enter}'
      )
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-minutes]'
      ).type('0')
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-hours]'
      ).type('12')
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-day]'
      ).type('*')
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-month]'
      ).type('*')
      cy.get(
        '[data-testid=workflow-create-side-panel-workflow-schedule-week]'
      ).type('*')
      GraphQLCall.interceptCall('CreateWorkflow', 'mutation')
      cy.get('[data-testid=workflow-create-sidepanel-create-button]').should(
        'exist'
      )
      cy.get('[data-testid=workflow-create-sidepanel-create-button]').click()
      GraphQLCall.waitForCall('CreateWorkflow', 'mutation', 60000).then(
        (interception) => {
          GraphQLCall.interceptCall('GetWorkflows', 'query')
          expect(interception.response.statusCode).to.eq(200)
          cy.url().should('eq', 'http://localhost:7700/workflows')
          cy.get('[data-testid=workflows-search-bar]').type(
            `workflow_1_${random}`
          )
          GraphQLCall.waitForCall('GetWorkflows', 'query').then(
            (interception) => {
              cy.get('[data-testid=workflow-row]')
                .should('exist')
                .should('have.length', 1)
            }
          )
        }
      )
    })
  })

  it("Should disable the edit button if there is no change in the workflow's metadata", () => {
    goToEditPage()
    cy.get('[data-testid=workflow-create-edit-button] button').should(
      'be.disabled'
    )
    cy.get(
      '[data-testid=workflow-create-side-panel-workflow-description]'
    ).type('{selectall}{backspace}Changed description')
    cy.get('[data-testid=workflow-create-edit-button] button').should(
      'be.enabled'
    )
    cy.get(
      '[data-testid=workflow-create-side-panel-workflow-description]'
    ).type('{selectall}{backspace}This is a test workflow')
    cy.get('[data-testid=workflow-create-edit-button] button').should(
      'be.disabled'
    )
  })

  it.only('Should update a workflow', () => {
    goToEditPage()
    GraphQLCall.interceptCall('UpdateWorkflow', 'mutation')
    cy.get('[data-testid=workflow-create-edit-button] button').should(
      'be.disabled'
    )
    cy.get(
      '[data-testid=workflow-create-side-panel-workflow-description]'
    ).type('{selectall}{backspace}Changed description')
    cy.get('[data-testid=workflow-create-edit-button] button').should(
      'be.enabled'
    )
    cy.get('[data-testid=workflow-create-edit-button]').click()

    GraphQLCall.waitForCall('UpdateWorkflow', 'mutation', 60000).then(
      (interception) => {
        expect(interception.response.statusCode).to.eq(200)
        GraphQLCall.interceptCall('GetWorkflowDetails', 'query')
        cy.url().should(
          'eq',
          `http://localhost:7700/workflows/${interception.request.body.variables.workflowId}/runs`
        )
        GraphQLCall.waitForCall('GetWorkflowDetails', 'query').then(() => {
          cy.get('[data-testid=workflow-details-page-description]').should(
            'contain.text',
            'Changed description'
          )
        })
      }
    )
  })
})
