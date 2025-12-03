import * as t from 'io-ts'

export const UninstallLibraryInputSchema = t.partial({
  input: t.union([
    t.undefined,
    t.null,
    t.partial({
      cluster_id: t.union([t.undefined, t.null, t.string]),
      id: t.union([t.undefined, t.null, t.array(t.union([t.null, t.number]))]),
    }),
  ]),
})

export const SelectionOnPackagesSchema = t.type({
  id: t.union([t.null, t.number]),
})

export const SelectionOnDataSchema = t.type({
  cluster_id: t.union([t.null, t.string]),
  packages: t.union([
    t.null,
    t.array(t.union([t.null, t.type({id: t.union([t.null, t.number])})])),
  ]),
})

export const SelectionOnUninstallLibrarySchema = t.type({
  status: t.unknown,
  message: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      cluster_id: t.union([t.null, t.string]),
      packages: t.union([
        t.null,
        t.array(t.union([t.null, t.type({id: t.union([t.null, t.number])})])),
      ]),
    }),
  ]),
})

export const UninstallLibrarySchema = t.type({
  uninstallLibrary: t.union([
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
              t.union([t.null, t.type({id: t.union([t.null, t.number])})])
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
