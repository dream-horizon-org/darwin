import * as t from 'io-ts'

export const GetComputeRuntimeInputSchema = t.partial({
  search_query: t.union([t.undefined, t.null, t.string]),
  offset: t.union([t.undefined, t.null, t.number]),
  page_size: t.union([t.undefined, t.null, t.number]),
  class: t.union([t.undefined, t.null, t.string]),
  type: t.union([t.undefined, t.null, t.string]),
  is_deleted: t.union([t.undefined, t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnComponentsSchema = t.type({
  name: t.union([t.null, t.string]),
  version: t.union([t.null, t.string]),
})

export const SelectionOnDefaultRuntimeSchema = t.type({
  id: t.union([t.null, t.number]),
  class: t.union([t.null, t.string]),
  type: t.union([t.null, t.string]),
  runtime: t.union([t.null, t.string]),
  image: t.union([t.null, t.string]),
  reference_link: t.union([t.null, t.string]),
  components: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          version: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  created_by: t.union([t.null, t.string]),
  last_updated_by: t.union([t.null, t.string]),
  created_at: t.union([t.null, t.string]),
  last_updated_at: t.union([t.null, t.string]),
  is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
  spark_connect: t.union([t.null, t.literal(false), t.literal(true)]),
  spark_auto_init: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnRuntimeListSchema = t.type({
  id: t.union([t.null, t.number]),
  class: t.union([t.null, t.string]),
  type: t.union([t.null, t.string]),
  runtime: t.union([t.null, t.string]),
  image: t.union([t.null, t.string]),
  reference_link: t.union([t.null, t.string]),
  components: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          version: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  created_by: t.union([t.null, t.string]),
  last_updated_by: t.union([t.null, t.string]),
  created_at: t.union([t.null, t.string]),
  last_updated_at: t.union([t.null, t.string]),
  is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
  spark_auto_init: t.union([t.null, t.literal(false), t.literal(true)]),
  spark_connect: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnRuntimesSchema = t.type({
  type: t.union([t.null, t.string]),
  count: t.union([t.null, t.number]),
  runtime_list: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          id: t.union([t.null, t.number]),
          class: t.union([t.null, t.string]),
          type: t.union([t.null, t.string]),
          runtime: t.union([t.null, t.string]),
          image: t.union([t.null, t.string]),
          reference_link: t.union([t.null, t.string]),
          components: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  version: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          created_by: t.union([t.null, t.string]),
          last_updated_by: t.union([t.null, t.string]),
          created_at: t.union([t.null, t.string]),
          last_updated_at: t.union([t.null, t.string]),
          is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
          spark_auto_init: t.union([t.null, t.literal(false), t.literal(true)]),
          spark_connect: t.union([t.null, t.literal(false), t.literal(true)]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnDataSchema = t.type({
  class: t.union([t.null, t.string]),
  default_runtime: t.union([
    t.null,
    t.type({
      id: t.union([t.null, t.number]),
      class: t.union([t.null, t.string]),
      type: t.union([t.null, t.string]),
      runtime: t.union([t.null, t.string]),
      image: t.union([t.null, t.string]),
      reference_link: t.union([t.null, t.string]),
      components: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              name: t.union([t.null, t.string]),
              version: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      created_by: t.union([t.null, t.string]),
      last_updated_by: t.union([t.null, t.string]),
      created_at: t.union([t.null, t.string]),
      last_updated_at: t.union([t.null, t.string]),
      is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
      spark_connect: t.union([t.null, t.literal(false), t.literal(true)]),
      spark_auto_init: t.union([t.null, t.literal(false), t.literal(true)]),
    }),
  ]),
  total_count: t.union([t.null, t.number]),
  runtimes: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          type: t.union([t.null, t.string]),
          count: t.union([t.null, t.number]),
          runtime_list: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  id: t.union([t.null, t.number]),
                  class: t.union([t.null, t.string]),
                  type: t.union([t.null, t.string]),
                  runtime: t.union([t.null, t.string]),
                  image: t.union([t.null, t.string]),
                  reference_link: t.union([t.null, t.string]),
                  components: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          name: t.union([t.null, t.string]),
                          version: t.union([t.null, t.string]),
                        }),
                      ])
                    ),
                  ]),
                  created_by: t.union([t.null, t.string]),
                  last_updated_by: t.union([t.null, t.string]),
                  created_at: t.union([t.null, t.string]),
                  last_updated_at: t.union([t.null, t.string]),
                  is_deleted: t.union([
                    t.null,
                    t.literal(false),
                    t.literal(true),
                  ]),
                  spark_auto_init: t.union([
                    t.null,
                    t.literal(false),
                    t.literal(true),
                  ]),
                  spark_connect: t.union([
                    t.null,
                    t.literal(false),
                    t.literal(true),
                  ]),
                }),
              ])
            ),
          ]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnGetComputeRuntimeSchema = t.type({
  status: t.unknown,
  message: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          class: t.union([t.null, t.string]),
          default_runtime: t.union([
            t.null,
            t.type({
              id: t.union([t.null, t.number]),
              class: t.union([t.null, t.string]),
              type: t.union([t.null, t.string]),
              runtime: t.union([t.null, t.string]),
              image: t.union([t.null, t.string]),
              reference_link: t.union([t.null, t.string]),
              components: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      name: t.union([t.null, t.string]),
                      version: t.union([t.null, t.string]),
                    }),
                  ])
                ),
              ]),
              created_by: t.union([t.null, t.string]),
              last_updated_by: t.union([t.null, t.string]),
              created_at: t.union([t.null, t.string]),
              last_updated_at: t.union([t.null, t.string]),
              is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
              spark_connect: t.union([
                t.null,
                t.literal(false),
                t.literal(true),
              ]),
              spark_auto_init: t.union([
                t.null,
                t.literal(false),
                t.literal(true),
              ]),
            }),
          ]),
          total_count: t.union([t.null, t.number]),
          runtimes: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  type: t.union([t.null, t.string]),
                  count: t.union([t.null, t.number]),
                  runtime_list: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          id: t.union([t.null, t.number]),
                          class: t.union([t.null, t.string]),
                          type: t.union([t.null, t.string]),
                          runtime: t.union([t.null, t.string]),
                          image: t.union([t.null, t.string]),
                          reference_link: t.union([t.null, t.string]),
                          components: t.union([
                            t.null,
                            t.array(
                              t.union([
                                t.null,
                                t.type({
                                  name: t.union([t.null, t.string]),
                                  version: t.union([t.null, t.string]),
                                }),
                              ])
                            ),
                          ]),
                          created_by: t.union([t.null, t.string]),
                          last_updated_by: t.union([t.null, t.string]),
                          created_at: t.union([t.null, t.string]),
                          last_updated_at: t.union([t.null, t.string]),
                          is_deleted: t.union([
                            t.null,
                            t.literal(false),
                            t.literal(true),
                          ]),
                          spark_auto_init: t.union([
                            t.null,
                            t.literal(false),
                            t.literal(true),
                          ]),
                          spark_connect: t.union([
                            t.null,
                            t.literal(false),
                            t.literal(true),
                          ]),
                        }),
                      ])
                    ),
                  ]),
                }),
              ])
            ),
          ]),
        }),
      ])
    ),
  ]),
})

export const GetComputeRuntimeSchema = t.type({
  getComputeRuntime: t.union([
    t.null,
    t.type({
      status: t.unknown,
      message: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              class: t.union([t.null, t.string]),
              default_runtime: t.union([
                t.null,
                t.type({
                  id: t.union([t.null, t.number]),
                  class: t.union([t.null, t.string]),
                  type: t.union([t.null, t.string]),
                  runtime: t.union([t.null, t.string]),
                  image: t.union([t.null, t.string]),
                  reference_link: t.union([t.null, t.string]),
                  components: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          name: t.union([t.null, t.string]),
                          version: t.union([t.null, t.string]),
                        }),
                      ])
                    ),
                  ]),
                  created_by: t.union([t.null, t.string]),
                  last_updated_by: t.union([t.null, t.string]),
                  created_at: t.union([t.null, t.string]),
                  last_updated_at: t.union([t.null, t.string]),
                  is_deleted: t.union([
                    t.null,
                    t.literal(false),
                    t.literal(true),
                  ]),
                  spark_connect: t.union([
                    t.null,
                    t.literal(false),
                    t.literal(true),
                  ]),
                  spark_auto_init: t.union([
                    t.null,
                    t.literal(false),
                    t.literal(true),
                  ]),
                }),
              ]),
              total_count: t.union([t.null, t.number]),
              runtimes: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      type: t.union([t.null, t.string]),
                      count: t.union([t.null, t.number]),
                      runtime_list: t.union([
                        t.null,
                        t.array(
                          t.union([
                            t.null,
                            t.type({
                              id: t.union([t.null, t.number]),
                              class: t.union([t.null, t.string]),
                              type: t.union([t.null, t.string]),
                              runtime: t.union([t.null, t.string]),
                              image: t.union([t.null, t.string]),
                              reference_link: t.union([t.null, t.string]),
                              components: t.union([
                                t.null,
                                t.array(
                                  t.union([
                                    t.null,
                                    t.type({
                                      name: t.union([t.null, t.string]),
                                      version: t.union([t.null, t.string]),
                                    }),
                                  ])
                                ),
                              ]),
                              created_by: t.union([t.null, t.string]),
                              last_updated_by: t.union([t.null, t.string]),
                              created_at: t.union([t.null, t.string]),
                              last_updated_at: t.union([t.null, t.string]),
                              is_deleted: t.union([
                                t.null,
                                t.literal(false),
                                t.literal(true),
                              ]),
                              spark_auto_init: t.union([
                                t.null,
                                t.literal(false),
                                t.literal(true),
                              ]),
                              spark_connect: t.union([
                                t.null,
                                t.literal(false),
                                t.literal(true),
                              ]),
                            }),
                          ])
                        ),
                      ]),
                    }),
                  ])
                ),
              ]),
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
