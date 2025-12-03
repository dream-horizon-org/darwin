import * as t from 'io-ts'

export const UpdateWorkflowInputSchema = t.partial({
  workflowId: t.union([t.undefined, t.null, t.string]),
  input: t.union([
    t.undefined,
    t.null,
    t.partial({
      workflowName: t.union([t.undefined, t.null, t.string]),
      description: t.union([t.undefined, t.null, t.string]),
      displayName: t.union([t.undefined, t.null, t.string]),
      tags: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.string])),
      ]),
      maxConcurrentRuns: t.union([t.undefined, t.null, t.number]),
      expected_run_duration: t.union([t.undefined, t.null, t.number]),
      queue_enabled: t.union([
        t.undefined,
        t.null,
        t.literal(false),
        t.literal(true),
      ]),
      notification_preference: t.unknown,
      schedule: t.union([t.undefined, t.null, t.string]),
      retries: t.union([t.undefined, t.null, t.number]),
      notifyOn: t.union([t.undefined, t.null, t.string]),
      parameters: t.unknown,
      tasks: t.union([t.undefined, t.null, t.array(t.unknown)]),
      createdBy: t.union([t.undefined, t.null, t.string]),
    }),
  ]),
})

export const SelectionOnNotificationPreferenceSchema = t.type({
  on_start: t.union([t.null, t.literal(false), t.literal(true)]),
  on_skip: t.union([t.null, t.literal(false), t.literal(true)]),
  on_success: t.union([t.null, t.literal(false), t.literal(true)]),
  on_fail: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnHaConfigSchema = t.type({
  enable_ha: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnNotificationPreference1Schema = t.type({
  on_fail: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnAttachedClusterSchema = t.type({
  cluster_id: t.union([t.null, t.string]),
  runtime: t.union([t.null, t.string]),
  cluster_name: t.union([t.null, t.string]),
  cluster_status: t.union([t.null, t.string]),
  memory: t.union([t.null, t.number]),
  cores: t.union([t.null, t.number]),
  ray_dashboard: t.union([t.null, t.string]),
  logs_dashboard: t.union([t.null, t.string]),
  events_dashboard: t.union([t.null, t.string]),
})

export const SelectionOnMetadataSchema = t.type({
  repository: t.unknown,
  exclusions: t.union([t.null, t.string]),
})

export const SelectionOnBodySchema = t.type({
  path: t.union([t.null, t.string]),
  name: t.union([t.null, t.string]),
  version: t.union([t.null, t.string]),
  metadata: t.union([
    t.null,
    t.type({repository: t.unknown, exclusions: t.union([t.null, t.string])}),
  ]),
})

export const SelectionOnPackagesSchema = t.type({
  source: t.union([t.null, t.string]),
  body: t.union([
    t.null,
    t.type({
      path: t.union([t.null, t.string]),
      name: t.union([t.null, t.string]),
      version: t.union([t.null, t.string]),
      metadata: t.union([
        t.null,
        t.type({
          repository: t.unknown,
          exclusions: t.union([t.null, t.string]),
        }),
      ]),
    }),
  ]),
})

export const SelectionOnTasksSchema = t.type({
  task_name: t.union([t.null, t.string]),
  source_type: t.union([t.null, t.string]),
  source: t.union([t.null, t.string]),
  file_path: t.union([t.null, t.string]),
  dynamic_artifact: t.union([t.null, t.literal(false), t.literal(true)]),
  cluster_type: t.union([t.null, t.string]),
  ha_config: t.union([
    t.null,
    t.type({enable_ha: t.union([t.null, t.literal(false), t.literal(true)])}),
  ]),
  notify_on: t.union([t.null, t.string]),
  trigger_rule: t.unknown,
  notification_preference: t.union([
    t.null,
    t.type({on_fail: t.union([t.null, t.literal(false), t.literal(true)])}),
  ]),
  attached_cluster: t.union([
    t.null,
    t.type({
      cluster_id: t.union([t.null, t.string]),
      runtime: t.union([t.null, t.string]),
      cluster_name: t.union([t.null, t.string]),
      cluster_status: t.union([t.null, t.string]),
      memory: t.union([t.null, t.number]),
      cores: t.union([t.null, t.number]),
      ray_dashboard: t.union([t.null, t.string]),
      logs_dashboard: t.union([t.null, t.string]),
      events_dashboard: t.union([t.null, t.string]),
    }),
  ]),
  dependent_libraries: t.union([t.null, t.string]),
  packages: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          source: t.union([t.null, t.string]),
          body: t.union([
            t.null,
            t.type({
              path: t.union([t.null, t.string]),
              name: t.union([t.null, t.string]),
              version: t.union([t.null, t.string]),
              metadata: t.union([
                t.null,
                t.type({
                  repository: t.unknown,
                  exclusions: t.union([t.null, t.string]),
                }),
              ]),
            }),
          ]),
        }),
      ])
    ),
  ]),
  input_parameters: t.unknown,
  retries: t.union([t.null, t.number]),
  timeout: t.union([t.null, t.number]),
  depends_on: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  task_validation_status: t.union([t.null, t.string]),
  run_status: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  workflow_id: t.union([t.null, t.string]),
  workflow_name: t.union([t.null, t.string]),
  description: t.union([t.null, t.string]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  schedule: t.union([t.null, t.string]),
  retries: t.union([t.null, t.number]),
  notify_on: t.union([t.null, t.string]),
  parameters: t.unknown,
  max_concurrent_runs: t.union([t.null, t.number]),
  created_by: t.union([t.null, t.string]),
  last_updated_on: t.union([t.null, t.string]),
  created_at: t.union([t.null, t.string]),
  workflow_status: t.union([t.null, t.string]),
  expected_run_duration: t.union([t.null, t.number]),
  queue_enabled: t.union([t.null, t.literal(false), t.literal(true)]),
  notification_preference: t.union([
    t.null,
    t.type({
      on_start: t.union([t.null, t.literal(false), t.literal(true)]),
      on_skip: t.union([t.null, t.literal(false), t.literal(true)]),
      on_success: t.union([t.null, t.literal(false), t.literal(true)]),
      on_fail: t.union([t.null, t.literal(false), t.literal(true)]),
    }),
  ]),
  tasks: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          task_name: t.union([t.null, t.string]),
          source_type: t.union([t.null, t.string]),
          source: t.union([t.null, t.string]),
          file_path: t.union([t.null, t.string]),
          dynamic_artifact: t.union([
            t.null,
            t.literal(false),
            t.literal(true),
          ]),
          cluster_type: t.union([t.null, t.string]),
          ha_config: t.union([
            t.null,
            t.type({
              enable_ha: t.union([t.null, t.literal(false), t.literal(true)]),
            }),
          ]),
          notify_on: t.union([t.null, t.string]),
          trigger_rule: t.unknown,
          notification_preference: t.union([
            t.null,
            t.type({
              on_fail: t.union([t.null, t.literal(false), t.literal(true)]),
            }),
          ]),
          attached_cluster: t.union([
            t.null,
            t.type({
              cluster_id: t.union([t.null, t.string]),
              runtime: t.union([t.null, t.string]),
              cluster_name: t.union([t.null, t.string]),
              cluster_status: t.union([t.null, t.string]),
              memory: t.union([t.null, t.number]),
              cores: t.union([t.null, t.number]),
              ray_dashboard: t.union([t.null, t.string]),
              logs_dashboard: t.union([t.null, t.string]),
              events_dashboard: t.union([t.null, t.string]),
            }),
          ]),
          dependent_libraries: t.union([t.null, t.string]),
          packages: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  source: t.union([t.null, t.string]),
                  body: t.union([
                    t.null,
                    t.type({
                      path: t.union([t.null, t.string]),
                      name: t.union([t.null, t.string]),
                      version: t.union([t.null, t.string]),
                      metadata: t.union([
                        t.null,
                        t.type({
                          repository: t.unknown,
                          exclusions: t.union([t.null, t.string]),
                        }),
                      ]),
                    }),
                  ]),
                }),
              ])
            ),
          ]),
          input_parameters: t.unknown,
          retries: t.union([t.null, t.number]),
          timeout: t.union([t.null, t.number]),
          depends_on: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          task_validation_status: t.union([t.null, t.string]),
          run_status: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  next_run_time: t.union([t.null, t.string]),
})

export const SelectionOnUpdateWorkflowSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      workflow_id: t.union([t.null, t.string]),
      workflow_name: t.union([t.null, t.string]),
      description: t.union([t.null, t.string]),
      tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
      schedule: t.union([t.null, t.string]),
      retries: t.union([t.null, t.number]),
      notify_on: t.union([t.null, t.string]),
      parameters: t.unknown,
      max_concurrent_runs: t.union([t.null, t.number]),
      created_by: t.union([t.null, t.string]),
      last_updated_on: t.union([t.null, t.string]),
      created_at: t.union([t.null, t.string]),
      workflow_status: t.union([t.null, t.string]),
      expected_run_duration: t.union([t.null, t.number]),
      queue_enabled: t.union([t.null, t.literal(false), t.literal(true)]),
      notification_preference: t.union([
        t.null,
        t.type({
          on_start: t.union([t.null, t.literal(false), t.literal(true)]),
          on_skip: t.union([t.null, t.literal(false), t.literal(true)]),
          on_success: t.union([t.null, t.literal(false), t.literal(true)]),
          on_fail: t.union([t.null, t.literal(false), t.literal(true)]),
        }),
      ]),
      tasks: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              task_name: t.union([t.null, t.string]),
              source_type: t.union([t.null, t.string]),
              source: t.union([t.null, t.string]),
              file_path: t.union([t.null, t.string]),
              dynamic_artifact: t.union([
                t.null,
                t.literal(false),
                t.literal(true),
              ]),
              cluster_type: t.union([t.null, t.string]),
              ha_config: t.union([
                t.null,
                t.type({
                  enable_ha: t.union([
                    t.null,
                    t.literal(false),
                    t.literal(true),
                  ]),
                }),
              ]),
              notify_on: t.union([t.null, t.string]),
              trigger_rule: t.unknown,
              notification_preference: t.union([
                t.null,
                t.type({
                  on_fail: t.union([t.null, t.literal(false), t.literal(true)]),
                }),
              ]),
              attached_cluster: t.union([
                t.null,
                t.type({
                  cluster_id: t.union([t.null, t.string]),
                  runtime: t.union([t.null, t.string]),
                  cluster_name: t.union([t.null, t.string]),
                  cluster_status: t.union([t.null, t.string]),
                  memory: t.union([t.null, t.number]),
                  cores: t.union([t.null, t.number]),
                  ray_dashboard: t.union([t.null, t.string]),
                  logs_dashboard: t.union([t.null, t.string]),
                  events_dashboard: t.union([t.null, t.string]),
                }),
              ]),
              dependent_libraries: t.union([t.null, t.string]),
              packages: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      source: t.union([t.null, t.string]),
                      body: t.union([
                        t.null,
                        t.type({
                          path: t.union([t.null, t.string]),
                          name: t.union([t.null, t.string]),
                          version: t.union([t.null, t.string]),
                          metadata: t.union([
                            t.null,
                            t.type({
                              repository: t.unknown,
                              exclusions: t.union([t.null, t.string]),
                            }),
                          ]),
                        }),
                      ]),
                    }),
                  ])
                ),
              ]),
              input_parameters: t.unknown,
              retries: t.union([t.null, t.number]),
              timeout: t.union([t.null, t.number]),
              depends_on: t.union([
                t.null,
                t.array(t.union([t.null, t.string])),
              ]),
              task_validation_status: t.union([t.null, t.string]),
              run_status: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      next_run_time: t.union([t.null, t.string]),
    }),
  ]),
})

export const UpdateWorkflowSchema = t.type({
  updateWorkflow: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          workflow_id: t.union([t.null, t.string]),
          workflow_name: t.union([t.null, t.string]),
          description: t.union([t.null, t.string]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          schedule: t.union([t.null, t.string]),
          retries: t.union([t.null, t.number]),
          notify_on: t.union([t.null, t.string]),
          parameters: t.unknown,
          max_concurrent_runs: t.union([t.null, t.number]),
          created_by: t.union([t.null, t.string]),
          last_updated_on: t.union([t.null, t.string]),
          created_at: t.union([t.null, t.string]),
          workflow_status: t.union([t.null, t.string]),
          expected_run_duration: t.union([t.null, t.number]),
          queue_enabled: t.union([t.null, t.literal(false), t.literal(true)]),
          notification_preference: t.union([
            t.null,
            t.type({
              on_start: t.union([t.null, t.literal(false), t.literal(true)]),
              on_skip: t.union([t.null, t.literal(false), t.literal(true)]),
              on_success: t.union([t.null, t.literal(false), t.literal(true)]),
              on_fail: t.union([t.null, t.literal(false), t.literal(true)]),
            }),
          ]),
          tasks: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  task_name: t.union([t.null, t.string]),
                  source_type: t.union([t.null, t.string]),
                  source: t.union([t.null, t.string]),
                  file_path: t.union([t.null, t.string]),
                  dynamic_artifact: t.union([
                    t.null,
                    t.literal(false),
                    t.literal(true),
                  ]),
                  cluster_type: t.union([t.null, t.string]),
                  ha_config: t.union([
                    t.null,
                    t.type({
                      enable_ha: t.union([
                        t.null,
                        t.literal(false),
                        t.literal(true),
                      ]),
                    }),
                  ]),
                  notify_on: t.union([t.null, t.string]),
                  trigger_rule: t.unknown,
                  notification_preference: t.union([
                    t.null,
                    t.type({
                      on_fail: t.union([
                        t.null,
                        t.literal(false),
                        t.literal(true),
                      ]),
                    }),
                  ]),
                  attached_cluster: t.union([
                    t.null,
                    t.type({
                      cluster_id: t.union([t.null, t.string]),
                      runtime: t.union([t.null, t.string]),
                      cluster_name: t.union([t.null, t.string]),
                      cluster_status: t.union([t.null, t.string]),
                      memory: t.union([t.null, t.number]),
                      cores: t.union([t.null, t.number]),
                      ray_dashboard: t.union([t.null, t.string]),
                      logs_dashboard: t.union([t.null, t.string]),
                      events_dashboard: t.union([t.null, t.string]),
                    }),
                  ]),
                  dependent_libraries: t.union([t.null, t.string]),
                  packages: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          source: t.union([t.null, t.string]),
                          body: t.union([
                            t.null,
                            t.type({
                              path: t.union([t.null, t.string]),
                              name: t.union([t.null, t.string]),
                              version: t.union([t.null, t.string]),
                              metadata: t.union([
                                t.null,
                                t.type({
                                  repository: t.unknown,
                                  exclusions: t.union([t.null, t.string]),
                                }),
                              ]),
                            }),
                          ]),
                        }),
                      ])
                    ),
                  ]),
                  input_parameters: t.unknown,
                  retries: t.union([t.null, t.number]),
                  timeout: t.union([t.null, t.number]),
                  depends_on: t.union([
                    t.null,
                    t.array(t.union([t.null, t.string])),
                  ]),
                  task_validation_status: t.union([t.null, t.string]),
                  run_status: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          next_run_time: t.union([t.null, t.string]),
        }),
      ]),
    }),
  ]),
})

export const GraphQLWrapperSchema = t.type({
  query: t.string,
  name: t.string,
  operation: t.keyof({query: null, mutation: null, subscription: null}),
})

export const GQLSchema = t.type({
  query: t.string,
  name: t.string,
  operation: t.keyof({query: null, mutation: null, subscription: null}),
})
