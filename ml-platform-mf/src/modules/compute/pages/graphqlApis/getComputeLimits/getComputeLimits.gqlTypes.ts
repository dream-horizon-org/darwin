import * as t from 'io-ts'

export const SelectionOnCoresSchema = t.type({
  max: t.union([t.null, t.number]),
  min: t.union([t.null, t.number]),
})

export const SelectionOnMemorySchema = t.type({
  min: t.union([t.null, t.number]),
  max: t.union([t.null, t.number]),
})

export const SelectionOnHeadNodeLimitsSchema = t.type({
  cores: t.union([
    t.null,
    t.type({
      max: t.union([t.null, t.number]),
      min: t.union([t.null, t.number]),
    }),
  ]),
  memory: t.union([
    t.null,
    t.type({
      min: t.union([t.null, t.number]),
      max: t.union([t.null, t.number]),
    }),
  ]),
})

export const SelectionOnCores1Schema = t.type({
  min: t.union([t.null, t.number]),
  max: t.union([t.null, t.number]),
})

export const SelectionOnPodsSchema = t.type({min: t.union([t.null, t.number])})

export const SelectionOnWorkerNodeLimitsSchema = t.type({
  cores: t.union([
    t.null,
    t.type({
      min: t.union([t.null, t.number]),
      max: t.union([t.null, t.number]),
    }),
  ]),
  memory: t.union([
    t.null,
    t.type({
      min: t.union([t.null, t.number]),
      max: t.union([t.null, t.number]),
    }),
  ]),
  pods: t.union([t.null, t.type({min: t.union([t.null, t.number])})]),
})

export const SelectionOnInactiveTimeLimitsSchema = t.type({
  min: t.union([t.null, t.number]),
})

export const SelectionOnDataSchema = t.type({
  head_node_limits: t.union([
    t.null,
    t.type({
      cores: t.union([
        t.null,
        t.type({
          max: t.union([t.null, t.number]),
          min: t.union([t.null, t.number]),
        }),
      ]),
      memory: t.union([
        t.null,
        t.type({
          min: t.union([t.null, t.number]),
          max: t.union([t.null, t.number]),
        }),
      ]),
    }),
  ]),
  worker_node_limits: t.union([
    t.null,
    t.type({
      cores: t.union([
        t.null,
        t.type({
          min: t.union([t.null, t.number]),
          max: t.union([t.null, t.number]),
        }),
      ]),
      memory: t.union([
        t.null,
        t.type({
          min: t.union([t.null, t.number]),
          max: t.union([t.null, t.number]),
        }),
      ]),
      pods: t.union([t.null, t.type({min: t.union([t.null, t.number])})]),
    }),
  ]),
  inactive_time_limits: t.union([
    t.null,
    t.type({min: t.union([t.null, t.number])}),
  ]),
})

export const SelectionOnGetComputeLimitsSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      head_node_limits: t.union([
        t.null,
        t.type({
          cores: t.union([
            t.null,
            t.type({
              max: t.union([t.null, t.number]),
              min: t.union([t.null, t.number]),
            }),
          ]),
          memory: t.union([
            t.null,
            t.type({
              min: t.union([t.null, t.number]),
              max: t.union([t.null, t.number]),
            }),
          ]),
        }),
      ]),
      worker_node_limits: t.union([
        t.null,
        t.type({
          cores: t.union([
            t.null,
            t.type({
              min: t.union([t.null, t.number]),
              max: t.union([t.null, t.number]),
            }),
          ]),
          memory: t.union([
            t.null,
            t.type({
              min: t.union([t.null, t.number]),
              max: t.union([t.null, t.number]),
            }),
          ]),
          pods: t.union([t.null, t.type({min: t.union([t.null, t.number])})]),
        }),
      ]),
      inactive_time_limits: t.union([
        t.null,
        t.type({min: t.union([t.null, t.number])}),
      ]),
    }),
  ]),
})

export const GetComputeLimitsSchema = t.type({
  getComputeLimits: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          head_node_limits: t.union([
            t.null,
            t.type({
              cores: t.union([
                t.null,
                t.type({
                  max: t.union([t.null, t.number]),
                  min: t.union([t.null, t.number]),
                }),
              ]),
              memory: t.union([
                t.null,
                t.type({
                  min: t.union([t.null, t.number]),
                  max: t.union([t.null, t.number]),
                }),
              ]),
            }),
          ]),
          worker_node_limits: t.union([
            t.null,
            t.type({
              cores: t.union([
                t.null,
                t.type({
                  min: t.union([t.null, t.number]),
                  max: t.union([t.null, t.number]),
                }),
              ]),
              memory: t.union([
                t.null,
                t.type({
                  min: t.union([t.null, t.number]),
                  max: t.union([t.null, t.number]),
                }),
              ]),
              pods: t.union([
                t.null,
                t.type({min: t.union([t.null, t.number])}),
              ]),
            }),
          ]),
          inactive_time_limits: t.union([
            t.null,
            t.type({min: t.union([t.null, t.number])}),
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
