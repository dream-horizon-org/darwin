import * as t from 'io-ts'

export const GetWorkflowTaskDetailsWithoutRunInputSchema = t.partial({
  workflowId: t.union([t.undefined, t.null, t.string]),
  taskId: t.union([t.undefined, t.null, t.string]),
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

export const SelectionOnNotificationPreferenceSchema = t.type({
  on_fail: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnDataSchema = t.type({
  workflow_id: t.union([t.null, t.string]),
  task_id: t.union([t.null, t.string]),
  duration: t.union([t.null, t.number]),
  source_type: t.union([t.null, t.string]),
  file_path: t.union([t.null, t.string]),
  dynamic_artifact: t.union([t.null, t.literal(false), t.literal(true)]),
  source: t.union([t.null, t.string]),
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
  depends_on: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  input_parameters: t.unknown,
  retries: t.union([t.null, t.number]),
  timeout: t.union([t.null, t.number]),
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
  message: t.union([t.null, t.string]),
  codespace_id: t.union([t.null, t.number]),
  project_id: t.union([t.null, t.number]),
  notify_on: t.union([t.null, t.string]),
  trigger_rule: t.unknown,
  notification_preference: t.union([
    t.null,
    t.type({on_fail: t.union([t.null, t.literal(false), t.literal(true)])}),
  ]),
})

export const SelectionOnGetWorkflowTaskDetailsWithoutRunSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      workflow_id: t.union([t.null, t.string]),
      task_id: t.union([t.null, t.string]),
      duration: t.union([t.null, t.number]),
      source_type: t.union([t.null, t.string]),
      file_path: t.union([t.null, t.string]),
      dynamic_artifact: t.union([t.null, t.literal(false), t.literal(true)]),
      source: t.union([t.null, t.string]),
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
      depends_on: t.union([t.null, t.array(t.union([t.null, t.string]))]),
      input_parameters: t.unknown,
      retries: t.union([t.null, t.number]),
      timeout: t.union([t.null, t.number]),
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
      message: t.union([t.null, t.string]),
      codespace_id: t.union([t.null, t.number]),
      project_id: t.union([t.null, t.number]),
      notify_on: t.union([t.null, t.string]),
      trigger_rule: t.unknown,
      notification_preference: t.union([
        t.null,
        t.type({on_fail: t.union([t.null, t.literal(false), t.literal(true)])}),
      ]),
    }),
  ]),
})

export const GetWorkflowTaskDetailsWithoutRunSchema = t.type({
  getWorkflowTaskDetailsWithoutRun: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          workflow_id: t.union([t.null, t.string]),
          task_id: t.union([t.null, t.string]),
          duration: t.union([t.null, t.number]),
          source_type: t.union([t.null, t.string]),
          file_path: t.union([t.null, t.string]),
          dynamic_artifact: t.union([
            t.null,
            t.literal(false),
            t.literal(true),
          ]),
          source: t.union([t.null, t.string]),
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
          depends_on: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          input_parameters: t.unknown,
          retries: t.union([t.null, t.number]),
          timeout: t.union([t.null, t.number]),
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
          message: t.union([t.null, t.string]),
          codespace_id: t.union([t.null, t.number]),
          project_id: t.union([t.null, t.number]),
          notify_on: t.union([t.null, t.string]),
          trigger_rule: t.unknown,
          notification_preference: t.union([
            t.null,
            t.type({
              on_fail: t.union([t.null, t.literal(false), t.literal(true)]),
            }),
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
