import * as t from 'io-ts'

export const InstallLibraryInputSchema = t.partial({
  clusterId: t.union([t.undefined, t.null, t.string]),
  packages: t.union([
    t.undefined,
    t.null,
    t.array(
      t.union([
        t.null,
        t.partial({
          source: t.union([t.undefined, t.null, t.string]),
          body: t.unknown,
        }),
      ])
    ),
  ]),
})

export const SelectionOnPackagesSchema = t.type({
  id: t.union([t.null, t.string]),
  name: t.union([t.null, t.string]),
  version: t.union([t.null, t.string]),
  status: t.unknown,
})

export const SelectionOnDataSchema = t.type({
  cluster_id: t.union([t.null, t.string]),
  packages: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          id: t.union([t.null, t.string]),
          name: t.union([t.null, t.string]),
          version: t.union([t.null, t.string]),
          status: t.unknown,
        }),
      ])
    ),
  ]),
})

export const SelectionOnInstallLibrarySchema = t.type({
  status: t.unknown,
  message: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      cluster_id: t.union([t.null, t.string]),
      packages: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              id: t.union([t.null, t.string]),
              name: t.union([t.null, t.string]),
              version: t.union([t.null, t.string]),
              status: t.unknown,
            }),
          ])
        ),
      ]),
    }),
  ]),
})

export const InstallLibrarySchema = t.type({
  installLibrary: t.union([
    t.null,
    t.type({
      status: t.unknown,
      message: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          cluster_id: t.union([t.null, t.string]),
          packages: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  id: t.union([t.null, t.string]),
                  name: t.union([t.null, t.string]),
                  version: t.union([t.null, t.string]),
                  status: t.unknown,
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
