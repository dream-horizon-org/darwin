import * as t from 'io-ts'

export const GetMLFlowModelVersionsInputSchema = t.type({modelName: t.string})

export const SelectionOnModelVersionsSchema = t.type({
  name: t.union([t.null, t.string]),
  version: t.union([t.null, t.string]),
  creation_timestamp: t.union([t.null, t.string]),
  last_updated_timestamp: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
  run_id: t.union([t.null, t.string]),
})

export const SelectionOnGetMLFlowModelVersionsSchema = t.type({
  model_versions: t.array(
    t.type({
      name: t.union([t.null, t.string]),
      version: t.union([t.null, t.string]),
      creation_timestamp: t.union([t.null, t.string]),
      last_updated_timestamp: t.union([t.null, t.string]),
      status: t.union([t.null, t.string]),
      run_id: t.union([t.null, t.string]),
    })
  ),
})

export const GetMLFlowModelVersionsSchema = t.type({
  getMLFlowModelVersions: t.union([
    t.null,
    t.type({
      model_versions: t.array(
        t.type({
          name: t.union([t.null, t.string]),
          version: t.union([t.null, t.string]),
          creation_timestamp: t.union([t.null, t.string]),
          last_updated_timestamp: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
          run_id: t.union([t.null, t.string]),
        })
      ),
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
