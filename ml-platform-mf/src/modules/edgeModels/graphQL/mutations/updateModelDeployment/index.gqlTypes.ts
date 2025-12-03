import * as t from 'io-ts'

export const UpdateModelDeploymentInputSchema = t.partial({
  input: t.union([
    t.undefined,
    t.null,
    t.partial({
      id: t.union([t.undefined, t.null, t.string]),
      deploymentName: t.union([t.undefined, t.null, t.string]),
      modelType: t.unknown,
      mlFlowModel: t.union([t.undefined, t.null, t.string]),
      owner: t.union([t.undefined, t.null, t.string]),
      mlFlowVersion: t.union([t.undefined, t.null, t.number]),
      tags: t.union([t.undefined, t.array(t.string)]),
      configFilePath: t.union([t.undefined, t.null, t.string]),
      testDataPath: t.union([t.undefined, t.null, t.string]),
      modelArtifactPath: t.union([t.undefined, t.null, t.string]),
      compatibleAppVersions: t.union([t.undefined, t.array(t.string)]),
      eventTables: t.union([t.undefined, t.array(t.unknown)]),
      featureGroupTables: t.union([t.undefined, t.null, t.array(t.unknown)]),
    }),
  ]),
})

export const SelectionOnDataSchema = t.type({
  success: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnUpdateModelDeploymentSchema = t.type({
  data: t.union([
    t.null,
    t.type({success: t.union([t.null, t.literal(false), t.literal(true)])}),
  ]),
})

export const UpdateModelDeploymentSchema = t.type({
  updateModelDeployment: t.type({
    data: t.union([
      t.null,
      t.type({success: t.union([t.null, t.literal(false), t.literal(true)])}),
    ]),
  }),
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
