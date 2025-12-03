import * as t from 'io-ts'

export const GetComputeLibraryStatusesInputSchema = t.partial({
  cluster_id: t.union([t.undefined, t.null, t.string]),
  library_ids: t.union([
    t.undefined,
    t.null,
    t.array(t.union([t.null, t.number])),
  ]),
})

export const SelectionOnDataSchema = t.type({
  library_id: t.union([t.null, t.number]),
  status: t.unknown,
})

export const SelectionOnGetComputeLibraryStatusesSchema = t.type({
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({library_id: t.union([t.null, t.number]), status: t.unknown}),
      ])
    ),
  ]),
})

export const GetComputeLibraryStatusesSchema = t.type({
  getComputeLibraryStatuses: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              library_id: t.union([t.null, t.number]),
              status: t.unknown,
            }),
          ])
        ),
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
