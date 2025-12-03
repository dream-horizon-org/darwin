import * as t from 'io-ts'

export const GetRuntimesInformationInputSchema = t.intersection([
  t.type({query: t.string, pageSize: t.number, offset: t.number}),
  t.partial({
    sortBy: t.union([t.undefined, t.null, t.string]),
    sortOrder: t.union([t.undefined, t.null, t.string]),
  }),
])

export const SelectionOnDataSchema = t.type({
  name: t.string,
  date_added: t.string,
  added_by: t.string,
  status: t.unknown,
})

export const SelectionOnGetRuntimesInformationSchema = t.type({
  total_records: t.number,
  page_size: t.number,
  offset: t.number,
  data: t.array(
    t.type({
      name: t.string,
      date_added: t.string,
      added_by: t.string,
      status: t.unknown,
    })
  ),
})

export const GetRuntimesInformationSchema = t.type({
  getRuntimesInformation: t.union([
    t.null,
    t.type({
      total_records: t.number,
      page_size: t.number,
      offset: t.number,
      data: t.array(
        t.type({
          name: t.string,
          date_added: t.string,
          added_by: t.string,
          status: t.unknown,
        })
      ),
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
