import * as t from 'io-ts'

export const SelectionOnGpuSchema = t.type({
  name: t.union([t.null, t.string]),
  created_by: t.union([t.null, t.string]),
})

export const SelectionOnCustomSchema = t.type({
  name: t.union([t.null, t.string]),
  created_by: t.union([t.null, t.string]),
})

export const SelectionOnCpuSchema = t.type({
  name: t.union([t.null, t.string]),
  created_by: t.union([t.null, t.string]),
})

export const SelectionOnOthersSchema = t.type({
  name: t.union([t.null, t.string]),
  created_by: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  gpu: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          created_by: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  custom: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          created_by: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  cpu: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          created_by: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  others: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          created_by: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnGetComputeRuntimeListSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      gpu: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              name: t.union([t.null, t.string]),
              created_by: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      custom: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              name: t.union([t.null, t.string]),
              created_by: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      cpu: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              name: t.union([t.null, t.string]),
              created_by: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      others: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              name: t.union([t.null, t.string]),
              created_by: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
    }),
  ]),
})

export const GetComputeRuntimeListSchema = t.type({
  getComputeRuntimeList: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          gpu: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  created_by: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          custom: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  created_by: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          cpu: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  created_by: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          others: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  created_by: t.union([t.null, t.string]),
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
