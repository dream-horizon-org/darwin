import * as t from 'io-ts'

export const GetComputeLibraryStatusInputSchema = t.partial({
  cluster_id: t.union([t.undefined, t.null, t.string]),
  library_id: t.union([t.undefined, t.null, t.number]),
})

export const SelectionOnDataSchema = t.type({
  cluster_id: t.union([t.null, t.string]),
  library_id: t.union([t.null, t.number]),
  status: t.unknown,
})

export const SelectionOnGetComputeLibraryStatusSchema = t.type({
  status: t.unknown,
  message: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      cluster_id: t.union([t.null, t.string]),
      library_id: t.union([t.null, t.number]),
      status: t.unknown,
    }),
  ]),
})

export const GetComputeLibraryStatusSchema = t.type({
  getComputeLibraryStatus: t.union([
    t.null,
    t.type({
      status: t.unknown,
      message: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          cluster_id: t.union([t.null, t.string]),
          library_id: t.union([t.null, t.number]),
          status: t.unknown,
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
