import * as t from 'io-ts'

export const SelectionOnRegisteredModelsSchema = t.type({
  name: t.union([t.null, t.string]),
  creation_timestamp: t.union([t.null, t.string]),
  last_updated_timestamp: t.union([t.null, t.string]),
})

export const SelectionOnGetMLFlowRegisteredModelsSchema = t.type({
  registered_models: t.array(
    t.type({
      name: t.union([t.null, t.string]),
      creation_timestamp: t.union([t.null, t.string]),
      last_updated_timestamp: t.union([t.null, t.string]),
    })
  ),
})

export const GetMLFlowRegisteredModelsSchema = t.type({
  getMLFlowRegisteredModels: t.union([
    t.null,
    t.type({
      registered_models: t.array(
        t.type({
          name: t.union([t.null, t.string]),
          creation_timestamp: t.union([t.null, t.string]),
          last_updated_timestamp: t.union([t.null, t.string]),
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
