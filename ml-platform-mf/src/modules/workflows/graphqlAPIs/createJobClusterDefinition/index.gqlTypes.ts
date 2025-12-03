import * as t from 'io-ts'

export const CreateJobClusterDefinitionInputSchema = t.partial({
  input: t.union([
    t.undefined,
    t.null,
    t.partial({
      clusterName: t.union([t.undefined, t.null, t.string]),
      packages_clone_from: t.union([t.undefined, t.null, t.string]),
      tags: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.string])),
      ]),
      runtime: t.union([t.undefined, t.null, t.string]),
      inactiveTime: t.union([t.undefined, t.null, t.number]),
      autoTerminationPolicies: t.union([
        t.undefined,
        t.null,
        t.array(t.unknown),
      ]),
      template: t.unknown,
      user: t.union([t.undefined, t.null, t.string]),
      headNodeConfig: t.unknown,
      workerNodeConfigs: t.union([t.undefined, t.null, t.array(t.unknown)]),
      advanceConfig: t.unknown,
    }),
  ]),
})

export const SelectionOnDataSchema = t.type({
  job_cluster_definition_id: t.union([t.null, t.string]),
})

export const SelectionOnCreateJobClusterDefinitionSchema = t.type({
  data: t.union([
    t.null,
    t.type({job_cluster_definition_id: t.union([t.null, t.string])}),
  ]),
})

export const CreateJobClusterDefinitionSchema = t.type({
  createJobClusterDefinition: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({job_cluster_definition_id: t.union([t.null, t.string])}),
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
