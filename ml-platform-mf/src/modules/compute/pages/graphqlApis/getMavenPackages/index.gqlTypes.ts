import * as t from 'io-ts'

export const GetMavenPackagesInputSchema = t.partial({
  search: t.union([t.undefined, t.null, t.string]),
  page_size: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
  repository: t.unknown,
})

export const SelectionOnPackagesSchema = t.type({
  group_id: t.union([t.null, t.string]),
  artifact_id: t.union([t.null, t.string]),
  version: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  result_size: t.union([t.null, t.number]),
  packages: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          group_id: t.union([t.null, t.string]),
          artifact_id: t.union([t.null, t.string]),
          version: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnGetMavenPackagesSchema = t.type({
  status: t.unknown,
  message: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      result_size: t.union([t.null, t.number]),
      packages: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              group_id: t.union([t.null, t.string]),
              artifact_id: t.union([t.null, t.string]),
              version: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
    }),
  ]),
})

export const GetMavenPackagesSchema = t.type({
  getMavenPackages: t.union([
    t.null,
    t.type({
      status: t.unknown,
      message: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          result_size: t.union([t.null, t.number]),
          packages: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  group_id: t.union([t.null, t.string]),
                  artifact_id: t.union([t.null, t.string]),
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
