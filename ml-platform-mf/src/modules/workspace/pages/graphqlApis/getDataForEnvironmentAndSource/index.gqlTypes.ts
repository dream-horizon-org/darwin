import * as t from 'io-ts'

export const GetDataForEnvironmentAndSourceInputSchema = t.partial({
  env: t.union([t.undefined, t.null, t.string]),
  source: t.union([t.undefined, t.null, t.string]),
  offset: t.union([t.undefined, t.null, t.number]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  query: t.union([t.undefined, t.null, t.string]),
  database: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnTablesSchema = t.type({
  table_id: t.union([t.null, t.string]),
  dc_name: t.union([t.null, t.string]),
  name: t.union([t.null, t.string]),
  link: t.union([t.null, t.string]),
  latest_version: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  result_size: t.union([t.null, t.number]),
  tables: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          table_id: t.union([t.null, t.string]),
          dc_name: t.union([t.null, t.string]),
          name: t.union([t.null, t.string]),
          link: t.union([t.null, t.string]),
          latest_version: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnGetDataForEnvironmentAndSourceSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      result_size: t.union([t.null, t.number]),
      tables: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              table_id: t.union([t.null, t.string]),
              dc_name: t.union([t.null, t.string]),
              name: t.union([t.null, t.string]),
              link: t.union([t.null, t.string]),
              latest_version: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
    }),
  ]),
})

export const GetDataForEnvironmentAndSourceSchema = t.type({
  getDataForEnvironmentAndSource: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          result_size: t.union([t.null, t.number]),
          tables: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  table_id: t.union([t.null, t.string]),
                  dc_name: t.union([t.null, t.string]),
                  name: t.union([t.null, t.string]),
                  link: t.union([t.null, t.string]),
                  latest_version: t.union([t.null, t.string]),
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
