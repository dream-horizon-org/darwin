import * as t from 'io-ts'

export const GetLogGroupsInputSchema = t.type({clusterId: t.string})

export const SelectionOnDataSchema = t.type({
  session_id: t.union([t.null, t.string]),
  start_timestamp: t.union([t.null, t.string]),
  end_timestamp: t.union([t.null, t.string]),
})

export const SelectionOnGetLogGroupsSchema = t.type({
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          session_id: t.union([t.null, t.string]),
          start_timestamp: t.union([t.null, t.string]),
          end_timestamp: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const GetLogGroupsSchema = t.type({
  getLogGroups: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              session_id: t.union([t.null, t.string]),
              start_timestamp: t.union([t.null, t.string]),
              end_timestamp: t.union([t.null, t.string]),
            }),
          ])
        ),
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
