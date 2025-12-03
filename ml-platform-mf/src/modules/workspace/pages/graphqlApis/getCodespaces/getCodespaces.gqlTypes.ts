import * as t from 'io-ts'

export const GetCodespacesInputSchema = t.partial({
  projectId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  codespace_id: t.union([t.null, t.string]),
  codespace_name: t.union([t.null, t.string]),
  created_by: t.union([t.null, t.string]),
})

export const SelectionOnGetCodespacesSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          codespace_id: t.union([t.null, t.string]),
          codespace_name: t.union([t.null, t.string]),
          created_by: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const GetCodespacesSchema = t.type({
  getCodespaces: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              codespace_id: t.union([t.null, t.string]),
              codespace_name: t.union([t.null, t.string]),
              created_by: t.union([t.null, t.string]),
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
