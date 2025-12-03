import * as t from 'io-ts'

export const GetDatabasesForEnvironmentAndSourceInputSchema = t.partial({
  env: t.union([t.undefined, t.null, t.string]),
  source: t.union([t.undefined, t.null, t.string]),
  offset: t.union([t.undefined, t.null, t.number]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  query: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDatabasesSchema = t.type({
  database_id: t.union([t.null, t.string]),
  name: t.union([t.null, t.string]),
  link: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  result_size: t.union([t.null, t.number]),
  databases: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          database_id: t.union([t.null, t.string]),
          name: t.union([t.null, t.string]),
          link: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnGetDatabasesForEnvironmentAndSourceSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      result_size: t.union([t.null, t.number]),
      databases: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              database_id: t.union([t.null, t.string]),
              name: t.union([t.null, t.string]),
              link: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
    }),
  ]),
})

export const GetDatabasesForEnvironmentAndSourceSchema = t.type({
  getDatabasesForEnvironmentAndSource: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          result_size: t.union([t.null, t.number]),
          databases: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  database_id: t.union([t.null, t.string]),
                  name: t.union([t.null, t.string]),
                  link: t.union([t.null, t.string]),
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
