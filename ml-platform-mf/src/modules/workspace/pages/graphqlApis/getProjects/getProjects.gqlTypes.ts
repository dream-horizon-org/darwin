import * as t from 'io-ts'

export const GetProjectsInputSchema = t.partial({
  query: t.union([t.undefined, t.null, t.string]),
  myProjects: t.union([t.undefined, t.null, t.literal(false), t.literal(true)]),
  sortBy: t.union([t.undefined, t.null, t.string]),
  user: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  project_id: t.union([t.null, t.string]),
  project_name: t.union([t.null, t.string]),
  number_of_codespaces: t.union([t.null, t.number]),
  last_updated: t.union([t.null, t.string]),
  created_on: t.union([t.null, t.string]),
  created_by: t.union([t.null, t.string]),
})

export const SelectionOnGetProjectsSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          project_id: t.union([t.null, t.string]),
          project_name: t.union([t.null, t.string]),
          number_of_codespaces: t.union([t.null, t.number]),
          last_updated: t.union([t.null, t.string]),
          created_on: t.union([t.null, t.string]),
          created_by: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const GetProjectsSchema = t.type({
  getProjects: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              project_id: t.union([t.null, t.string]),
              project_name: t.union([t.null, t.string]),
              number_of_codespaces: t.union([t.null, t.number]),
              last_updated: t.union([t.null, t.string]),
              created_on: t.union([t.null, t.string]),
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
