import * as t from 'io-ts'

export const GetComputeLibrariesInputSchema = t.partial({
  key: t.union([t.undefined, t.null, t.string]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
  sortBy: t.union([t.undefined, t.null, t.string]),
  sortOrder: t.union([t.undefined, t.null, t.string]),
  cluster_id: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnPackagesSchema = t.type({
  id: t.union([t.null, t.number]),
  status: t.unknown,
  name: t.union([t.null, t.string]),
  type: t.unknown,
  source: t.union([t.null, t.string]),
  version: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  cluster_id: t.union([t.null, t.string]),
  result_size: t.union([t.null, t.number]),
  packages: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          id: t.union([t.null, t.number]),
          status: t.unknown,
          name: t.union([t.null, t.string]),
          type: t.unknown,
          source: t.union([t.null, t.string]),
          version: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnGetComputeLibrariesSchema = t.type({
  status: t.unknown,
  message: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      cluster_id: t.union([t.null, t.string]),
      result_size: t.union([t.null, t.number]),
      packages: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              id: t.union([t.null, t.number]),
              status: t.unknown,
              name: t.union([t.null, t.string]),
              type: t.unknown,
              source: t.union([t.null, t.string]),
              version: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
    }),
  ]),
})

export const GetComputeLibrariesSchema = t.type({
  getComputeLibraries: t.union([
    t.null,
    t.type({
      status: t.unknown,
      message: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          cluster_id: t.union([t.null, t.string]),
          result_size: t.union([t.null, t.number]),
          packages: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  id: t.union([t.null, t.number]),
                  status: t.unknown,
                  name: t.union([t.null, t.string]),
                  type: t.unknown,
                  source: t.union([t.null, t.string]),
                  version: t.union([t.null, t.string]),
                }),
              ])
            ),
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
