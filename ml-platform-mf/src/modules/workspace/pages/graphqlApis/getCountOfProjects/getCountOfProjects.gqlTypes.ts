import * as t from 'io-ts'

export const SelectionOnDataSchema = t.type({
  my_projects: t.union([t.null, t.number]),
  other_projects: t.union([t.null, t.number]),
})

export const SelectionOnGetCountOfProjectsSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      my_projects: t.union([t.null, t.number]),
      other_projects: t.union([t.null, t.number]),
    }),
  ]),
})

export const GetCountOfProjectsSchema = t.type({
  getCountOfProjects: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          my_projects: t.union([t.null, t.number]),
          other_projects: t.union([t.null, t.number]),
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
