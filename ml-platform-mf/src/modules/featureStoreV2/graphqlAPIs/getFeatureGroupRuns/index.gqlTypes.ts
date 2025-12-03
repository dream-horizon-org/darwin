import * as t from 'io-ts'

export const GetFeatureGroupRunsInputSchema = t.partial({
  fg_name: t.union([t.undefined, t.null, t.string]),
  version: t.union([t.undefined, t.null, t.number]),
})

export const SelectionOnOtherFactorsSchema = t.type({
  name: t.union([t.null, t.string]),
  value: t.union([t.null, t.string]),
})

export const SelectionOnFeaturesSchema = t.type({
  title: t.union([t.null, t.string]),
  otherFactors: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          value: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  sampleData: t.union([t.null, t.array(t.union([t.null, t.string]))]),
})

export const SelectionOnDataSchema = t.type({
  status: t.unknown,
  message: t.union([t.null, t.string]),
  statusCode: t.union([t.null, t.number]),
  executionTime: t.union([t.null, t.string]),
  duration: t.union([t.null, t.number]),
  link: t.union([t.null, t.string]),
  totalRecordsCount: t.union([t.null, t.number]),
  features: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          title: t.union([t.null, t.string]),
          otherFactors: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  value: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          sampleData: t.union([t.null, t.array(t.union([t.null, t.string]))]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnGetFeatureGroupRunsSchema = t.type({
  status: t.unknown,
  statusCode: t.union([t.null, t.number]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          status: t.unknown,
          message: t.union([t.null, t.string]),
          statusCode: t.union([t.null, t.number]),
          executionTime: t.union([t.null, t.string]),
          duration: t.union([t.null, t.number]),
          link: t.union([t.null, t.string]),
          totalRecordsCount: t.union([t.null, t.number]),
          features: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  title: t.union([t.null, t.string]),
                  otherFactors: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          name: t.union([t.null, t.string]),
                          value: t.union([t.null, t.string]),
                        }),
                      ])
                    ),
                  ]),
                  sampleData: t.union([
                    t.null,
                    t.array(t.union([t.null, t.string])),
                  ]),
                }),
              ])
            ),
          ]),
        }),
      ])
    ),
  ]),
  error: t.union([t.null, t.string]),
})

export const GetFeatureGroupRunsSchema = t.type({
  getFeatureGroupRuns: t.union([
    t.null,
    t.type({
      status: t.unknown,
      statusCode: t.union([t.null, t.number]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              status: t.unknown,
              message: t.union([t.null, t.string]),
              statusCode: t.union([t.null, t.number]),
              executionTime: t.union([t.null, t.string]),
              duration: t.union([t.null, t.number]),
              link: t.union([t.null, t.string]),
              totalRecordsCount: t.union([t.null, t.number]),
              features: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      title: t.union([t.null, t.string]),
                      otherFactors: t.union([
                        t.null,
                        t.array(
                          t.union([
                            t.null,
                            t.type({
                              name: t.union([t.null, t.string]),
                              value: t.union([t.null, t.string]),
                            }),
                          ])
                        ),
                      ]),
                      sampleData: t.union([
                        t.null,
                        t.array(t.union([t.null, t.string])),
                      ]),
                    }),
                  ])
                ),
              ]),
            }),
          ])
        ),
      ]),
      error: t.union([t.null, t.string]),
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
