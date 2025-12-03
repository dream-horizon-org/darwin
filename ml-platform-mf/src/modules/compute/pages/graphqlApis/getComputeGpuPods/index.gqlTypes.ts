import * as t from 'io-ts'

export const SelectionOnDataSchema = t.type({
  name: t.union([t.null, t.string]),
  cores: t.union([t.null, t.number]),
  memory: t.union([t.null, t.number]),
  gpu_count: t.union([t.null, t.number]),
  g_ram_memory: t.union([t.null, t.number]),
  g_ram_type: t.union([t.null, t.string]),
})

export const SelectionOnGetComputeGpuPodsSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          cores: t.union([t.null, t.number]),
          memory: t.union([t.null, t.number]),
          gpu_count: t.union([t.null, t.number]),
          g_ram_memory: t.union([t.null, t.number]),
          g_ram_type: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const GetComputeGpuPodsSchema = t.type({
  getComputeGpuPods: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              name: t.union([t.null, t.string]),
              cores: t.union([t.null, t.number]),
              memory: t.union([t.null, t.number]),
              gpu_count: t.union([t.null, t.number]),
              g_ram_memory: t.union([t.null, t.number]),
              g_ram_type: t.union([t.null, t.string]),
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
