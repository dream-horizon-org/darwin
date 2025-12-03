import * as t from 'io-ts'

export const CreateCodespaceInputSchema = t.partial({
  projectId: t.union([t.undefined, t.null, t.string]),
  codespaceName: t.union([t.undefined, t.null, t.string]),
  cloneFromCodespaceName: t.union([t.undefined, t.null, t.string]),
  clusterId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnClusterUsageSchema = t.type({
  memory_used: t.union([t.null, t.number]),
  cores_used: t.union([t.null, t.number]),
})

export const SelectionOnAttachedClusterSchema = t.type({
  cluster_id: t.union([t.null, t.string]),
  cluster_name: t.union([t.null, t.string]),
  cluster_status: t.union([t.null, t.string]),
  memory: t.union([t.null, t.number]),
  cores: t.union([t.null, t.number]),
  cluster_usage: t.union([
    t.null,
    t.type({
      memory_used: t.union([t.null, t.number]),
      cores_used: t.union([t.null, t.number]),
    }),
  ]),
  attached_codespaces_count: t.union([t.null, t.number]),
  ray_dashboard: t.union([t.null, t.string]),
  prometheus_dashboard: t.union([t.null, t.string]),
  spark_ui_dashboard: t.union([t.null, t.string]),
})

export const SelectionOnCreateCodespaceSchema = t.type({
  project_id: t.union([t.null, t.string]),
  project_name: t.union([t.null, t.string]),
  codespace_id: t.union([t.null, t.string]),
  codespace_name: t.union([t.null, t.string]),
  github_link: t.union([t.null, t.string]),
  last_sync_time: t.union([t.null, t.string]),
  jupyter_lab_link: t.union([t.null, t.string]),
  attached_cluster: t.union([
    t.null,
    t.type({
      cluster_id: t.union([t.null, t.string]),
      cluster_name: t.union([t.null, t.string]),
      cluster_status: t.union([t.null, t.string]),
      memory: t.union([t.null, t.number]),
      cores: t.union([t.null, t.number]),
      cluster_usage: t.union([
        t.null,
        t.type({
          memory_used: t.union([t.null, t.number]),
          cores_used: t.union([t.null, t.number]),
        }),
      ]),
      attached_codespaces_count: t.union([t.null, t.number]),
      ray_dashboard: t.union([t.null, t.string]),
      prometheus_dashboard: t.union([t.null, t.string]),
      spark_ui_dashboard: t.union([t.null, t.string]),
    }),
  ]),
  code_server_link: t.union([t.null, t.string]),
})

export const CreateCodespaceSchema = t.type({
  createCodespace: t.union([
    t.null,
    t.type({
      project_id: t.union([t.null, t.string]),
      project_name: t.union([t.null, t.string]),
      codespace_id: t.union([t.null, t.string]),
      codespace_name: t.union([t.null, t.string]),
      github_link: t.union([t.null, t.string]),
      last_sync_time: t.union([t.null, t.string]),
      jupyter_lab_link: t.union([t.null, t.string]),
      attached_cluster: t.union([
        t.null,
        t.type({
          cluster_id: t.union([t.null, t.string]),
          cluster_name: t.union([t.null, t.string]),
          cluster_status: t.union([t.null, t.string]),
          memory: t.union([t.null, t.number]),
          cores: t.union([t.null, t.number]),
          cluster_usage: t.union([
            t.null,
            t.type({
              memory_used: t.union([t.null, t.number]),
              cores_used: t.union([t.null, t.number]),
            }),
          ]),
          attached_codespaces_count: t.union([t.null, t.number]),
          ray_dashboard: t.union([t.null, t.string]),
          prometheus_dashboard: t.union([t.null, t.string]),
          spark_ui_dashboard: t.union([t.null, t.string]),
        }),
      ]),
      code_server_link: t.union([t.null, t.string]),
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
