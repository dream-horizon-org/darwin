import * as t from 'io-ts'

export const GetSampleDataForDataSourceInputSchema = t.partial({
  env: t.union([t.undefined, t.null, t.string]),
  source: t.union([t.undefined, t.null, t.string]),
  dataSource: t.union([t.undefined, t.null, t.string]),
  version: t.union([t.undefined, t.null, t.string]),
  offset: t.union([t.undefined, t.null, t.number]),
  pageSize: t.union([t.undefined, t.null, t.number]),
})

export const SelectionOnCopyCodeCommandSchema = t.type({
  name: t.union([t.null, t.string]),
  value: t.union([t.null, t.string]),
})

export const SelectionOnSampleDataSchema = t.type({
  column_name: t.union([t.null, t.string]),
  type: t.union([t.null, t.string]),
  sample_data: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  versions: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  result_size: t.union([t.null, t.number]),
  copy_code_command: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          value: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  sample_data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          column_name: t.union([t.null, t.string]),
          type: t.union([t.null, t.string]),
          sample_data: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnGetSampleDataForDataSourceSchema = t.type({
  status: t.union([t.null, t.string]),
  message: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      versions: t.union([t.null, t.array(t.union([t.null, t.string]))]),
      result_size: t.union([t.null, t.number]),
      copy_code_command: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              name: t.union([t.null, t.string]),
              value: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      sample_data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              column_name: t.union([t.null, t.string]),
              type: t.union([t.null, t.string]),
              sample_data: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
    }),
  ]),
})

export const GetSampleDataForDataSourceSchema = t.type({
  getSampleDataForDataSource: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      message: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          versions: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          result_size: t.union([t.null, t.number]),
          copy_code_command: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  value: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          sample_data: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  column_name: t.union([t.null, t.string]),
                  type: t.union([t.null, t.string]),
                  sample_data: t.union([t.null, t.string]),
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
