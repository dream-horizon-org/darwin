import * as t from 'io-ts'

export const GetMavenPackageVersionsInputSchema = t.partial({
  group_id: t.union([t.undefined, t.null, t.string]),
  artifact_id: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  artifact_id: t.union([t.null, t.string]),
  group_id: t.union([t.null, t.string]),
  versions: t.union([t.null, t.array(t.union([t.null, t.string]))]),
})

export const SelectionOnGetMavenPackageVersionsSchema = t.type({
  status: t.unknown,
  message: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      artifact_id: t.union([t.null, t.string]),
      group_id: t.union([t.null, t.string]),
      versions: t.union([t.null, t.array(t.union([t.null, t.string]))]),
    }),
  ]),
})

export const GetMavenPackageVersionsSchema = t.type({
  getMavenPackageVersions: t.union([
    t.null,
    t.type({
      status: t.unknown,
      message: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          artifact_id: t.union([t.null, t.string]),
          group_id: t.union([t.null, t.string]),
          versions: t.union([t.null, t.array(t.union([t.null, t.string]))]),
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
