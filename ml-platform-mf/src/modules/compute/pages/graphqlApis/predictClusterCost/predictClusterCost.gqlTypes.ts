import * as t from 'io-ts'

export const PredictClusterCostInputSchema = t.partial({
  input: t.union([
    t.undefined,
    t.null,
    t.partial({
      clusterName: t.union([t.undefined, t.null, t.string]),
      tags: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.string])),
      ]),
      runtime: t.union([t.undefined, t.null, t.string]),
      inactiveTime: t.union([t.undefined, t.null, t.number]),
      user: t.union([t.undefined, t.null, t.string]),
      headNodeConfig: t.unknown,
      workerNodeConfigs: t.union([t.undefined, t.null, t.array(t.unknown)]),
    }),
  ]),
})

export const SelectionOnDataSchema = t.type({
  min_cost: t.union([t.null, t.string]),
  max_cost: t.union([t.null, t.string]),
})

export const SelectionOnPredictClusterCostSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      min_cost: t.union([t.null, t.string]),
      max_cost: t.union([t.null, t.string]),
    }),
  ]),
})

export const PredictClusterCostSchema = t.type({
  predictClusterCost: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          min_cost: t.union([t.null, t.string]),
          max_cost: t.union([t.null, t.string]),
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
