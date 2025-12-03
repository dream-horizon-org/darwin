import * as t from 'io-ts'

export const GetWorkflowRunDetailsInputSchema = t.partial({
  workflowId: t.union([t.undefined, t.null, t.string]),
  runId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnEventsSchema = t.type({
  timestamp: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
  message: t.union([t.null, t.string]),
})

export const SelectionOnHaConfigSchema = t.type({
  enable_ha: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnNotificationPreferenceSchema = t.type({
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
  estimated_cost: t.union([t.null, t.string]),
  created_at: t.union([t.null, t.string]),
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
      estimated_cost: t.union([t.null, t.string]),
      created_at: t.union([t.null, t.string]),
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
  dynamic_artifact: t.union([t.null, t.literal(false), t.literal(true)]),
  retries: t.union([t.null, t.number]),
  timeout: t.union([t.null, t.number]),
  depends_on: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  task_validation_status: t.union([t.null, t.string]),
  run_status: t.union([t.null, t.string]),
})

export const SelectionOnRepairRunSchema = t.type({
  status: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  workflow_id: t.union([t.null, t.string]),
  run_id: t.union([t.null, t.string]),
  start_time: t.union([t.null, t.string]),
  end_time: t.union([t.null, t.string]),
  duration: t.union([t.null, t.number]),
  run_status: t.union([t.null, t.string]),
  trigger: t.union([t.null, t.string]),
  trigger_by: t.union([t.null, t.string]),
  is_run_duration_exceeded: t.union([
    t.null,
    t.literal(false),
    t.literal(true),
  ]),
  expected_run_duration: t.union([t.null, t.number]),
  parameters: t.unknown,
  events: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          timestamp: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
          message: t.union([t.null, t.string]),
        }),
      ])
    ),
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
              estimated_cost: t.union([t.null, t.string]),
              created_at: t.union([t.null, t.string]),
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
          dynamic_artifact: t.union([
            t.null,
            t.literal(false),
            t.literal(true),
          ]),
          retries: t.union([t.null, t.number]),
          timeout: t.union([t.null, t.number]),
          depends_on: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          task_validation_status: t.union([t.null, t.string]),
          run_status: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  repair_run: t.union([t.null, t.type({status: t.union([t.null, t.string])})]),
})

export const SelectionOnGetWorkflowRunDetailsSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      workflow_id: t.union([t.null, t.string]),
      run_id: t.union([t.null, t.string]),
      start_time: t.union([t.null, t.string]),
      end_time: t.union([t.null, t.string]),
      duration: t.union([t.null, t.number]),
      run_status: t.union([t.null, t.string]),
      trigger: t.union([t.null, t.string]),
      trigger_by: t.union([t.null, t.string]),
      is_run_duration_exceeded: t.union([
        t.null,
        t.literal(false),
        t.literal(true),
      ]),
      expected_run_duration: t.union([t.null, t.number]),
      parameters: t.unknown,
      events: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              timestamp: t.union([t.null, t.string]),
              status: t.union([t.null, t.string]),
              message: t.union([t.null, t.string]),
            }),
          ])
        ),
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
                  estimated_cost: t.union([t.null, t.string]),
                  created_at: t.union([t.null, t.string]),
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
              dynamic_artifact: t.union([
                t.null,
                t.literal(false),
                t.literal(true),
              ]),
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
      repair_run: t.union([
        t.null,
        t.type({status: t.union([t.null, t.string])}),
      ]),
    }),
  ]),
})

export const GetWorkflowRunDetailsSchema = t.type({
  getWorkflowRunDetails: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          workflow_id: t.union([t.null, t.string]),
          run_id: t.union([t.null, t.string]),
          start_time: t.union([t.null, t.string]),
          end_time: t.union([t.null, t.string]),
          duration: t.union([t.null, t.number]),
          run_status: t.union([t.null, t.string]),
          trigger: t.union([t.null, t.string]),
          trigger_by: t.union([t.null, t.string]),
          is_run_duration_exceeded: t.union([
            t.null,
            t.literal(false),
            t.literal(true),
          ]),
          expected_run_duration: t.union([t.null, t.number]),
          parameters: t.unknown,
          events: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  timestamp: t.union([t.null, t.string]),
                  status: t.union([t.null, t.string]),
                  message: t.union([t.null, t.string]),
                }),
              ])
            ),
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
                      estimated_cost: t.union([t.null, t.string]),
                      created_at: t.union([t.null, t.string]),
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
                  dynamic_artifact: t.union([
                    t.null,
                    t.literal(false),
                    t.literal(true),
                  ]),
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
          repair_run: t.union([
            t.null,
            t.type({status: t.union([t.null, t.string])}),
          ]),
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
