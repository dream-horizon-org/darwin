import * as t from 'io-ts'

export const GetAllClustersInputSchema = t.partial({
  searchString: t.union([t.undefined, t.null, t.string]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
})

export const SelectionOnDataSchema = t.type({
  cores: t.union([t.null, t.string]),
  id: t.union([t.null, t.string]),
  memory: t.union([t.null, t.string]),
  name: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
})

export const SelectionOnGetAllClustersSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          cores: t.union([t.null, t.string]),
          id: t.union([t.null, t.string]),
          memory: t.union([t.null, t.string]),
          name: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  offset: t.union([t.null, t.number]),
  pageSize: t.union([t.null, t.number]),
  resultSize: t.union([t.null, t.number]),
})

export const GetAllClustersSchema = t.type({
  getAllClusters: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              cores: t.union([t.null, t.string]),
              id: t.union([t.null, t.string]),
              memory: t.union([t.null, t.string]),
              name: t.union([t.null, t.string]),
              status: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      offset: t.union([t.null, t.number]),
      pageSize: t.union([t.null, t.number]),
      resultSize: t.union([t.null, t.number]),
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
