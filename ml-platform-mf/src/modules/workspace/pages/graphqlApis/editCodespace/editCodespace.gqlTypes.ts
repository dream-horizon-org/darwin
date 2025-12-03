import * as t from 'io-ts'

export const EditCodespaceInputSchema = t.partial({
  projectId: t.union([t.undefined, t.null, t.string]),
  codespaceId: t.union([t.undefined, t.null, t.string]),
  codespaceName: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnEditCodespaceSchema = t.type({
  status: t.union([t.null, t.string]),
})

export const EditCodespaceSchema = t.type({
  editCodespace: t.union([
    t.null,
    t.type({status: t.union([t.null, t.string])}),
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
