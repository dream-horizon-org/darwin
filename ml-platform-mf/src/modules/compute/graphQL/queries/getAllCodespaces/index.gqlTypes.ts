import * as t from 'io-ts'

export const GetAllCodespacesInputSchema = t.type({
  clusterId: t.string,
  query: t.string,
  pageSize: t.number,
  offset: t.number,
  sortBy: t.string,
  sortOrder: t.string,
})

export const SelectionOnCodespaceSchema = t.type({id: t.string, name: t.string})

export const SelectionOnProjectSchema = t.type({id: t.string, name: t.string})

export const SelectionOnCoresSchema = t.type({
  consumed: t.number,
  total: t.number,
})

export const SelectionOnMemorySchema = t.type({
  consumed: t.number,
  total: t.number,
})

export const SelectionOnDataSchema = t.type({
  codespace: t.type({id: t.string, name: t.string}),
  project: t.type({id: t.string, name: t.string}),
  cores: t.type({consumed: t.number, total: t.number}),
  memory: t.type({consumed: t.number, total: t.number}),
  attached_since: t.string,
  user: t.string,
})

export const SelectionOnGetAllCodespacesSchema = t.type({
  status: t.string,
  result_size: t.number,
  page_size: t.number,
  offset: t.number,
  data: t.array(
    t.type({
      codespace: t.type({id: t.string, name: t.string}),
      project: t.type({id: t.string, name: t.string}),
      cores: t.type({consumed: t.number, total: t.number}),
      memory: t.type({consumed: t.number, total: t.number}),
      attached_since: t.string,
      user: t.string,
    })
  ),
})

export const GetAllCodespacesSchema = t.type({
  getAllCodespaces: t.type({
    status: t.string,
    result_size: t.number,
    page_size: t.number,
    offset: t.number,
    data: t.array(
      t.type({
        codespace: t.type({id: t.string, name: t.string}),
        project: t.type({id: t.string, name: t.string}),
        cores: t.type({consumed: t.number, total: t.number}),
        memory: t.type({consumed: t.number, total: t.number}),
        attached_since: t.string,
        user: t.string,
      })
    ),
  }),
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
