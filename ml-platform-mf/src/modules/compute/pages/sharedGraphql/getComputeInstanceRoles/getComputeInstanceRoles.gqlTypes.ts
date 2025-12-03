import * as t from 'io-ts'

export const SelectionOnDataSchema = t.type({
  instance_role_id: t.union([t.null, t.string]),
  display_name: t.union([t.null, t.string]),
})

export const SelectionOnGetComputeInstanceRolesSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          instance_role_id: t.union([t.null, t.string]),
          display_name: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const GetComputeInstanceRolesSchema = t.type({
  getComputeInstanceRoles: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              instance_role_id: t.union([t.null, t.string]),
              display_name: t.union([t.null, t.string]),
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
