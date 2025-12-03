import * as t from 'io-ts'

export const RetryInstallLibraryInputSchema = t.partial({
  input: t.union([
    t.undefined,
    t.null,
    t.partial({
      cluster_id: t.union([t.undefined, t.null, t.string]),
      library_id: t.union([t.undefined, t.null, t.number]),
    }),
  ]),
})

export const SelectionOnPackagesSchema = t.type({
  status: t.unknown,
  version: t.union([t.null, t.string]),
  name: t.union([t.null, t.string]),
  id: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  packages: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          status: t.unknown,
          version: t.union([t.null, t.string]),
          name: t.union([t.null, t.string]),
          id: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  cluster_id: t.union([t.null, t.string]),
})

export const SelectionOnRetryInstallLibrarySchema = t.type({
  status: t.unknown,
  message: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      packages: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              status: t.unknown,
              version: t.union([t.null, t.string]),
              name: t.union([t.null, t.string]),
              id: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      cluster_id: t.union([t.null, t.string]),
    }),
  ]),
})

export const RetryInstallLibrarySchema = t.type({
  retryInstallLibrary: t.union([
    t.null,
    t.type({
      status: t.unknown,
      message: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          packages: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  status: t.unknown,
                  version: t.union([t.null, t.string]),
                  name: t.union([t.null, t.string]),
                  id: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          cluster_id: t.union([t.null, t.string]),
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
