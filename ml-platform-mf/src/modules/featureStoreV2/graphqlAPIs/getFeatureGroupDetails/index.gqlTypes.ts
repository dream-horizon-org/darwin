import * as t from 'io-ts'

export const GetFeatureGroupDetailsInputSchema = t.partial({
  getFeatureGroupDetailsId: t.union([t.undefined, t.null, t.string]),
  version: t.union([t.undefined, t.null, t.number]),
  type: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnCopyCodeSchema = t.type({
  name: t.union([t.null, t.string]),
  value: t.union([t.null, t.string]),
})

export const SelectionOnSinksSchema = t.type({
  location: t.union([t.null, t.string]),
  type: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  id: t.union([t.null, t.string]),
  title: t.union([t.null, t.string]),
  description: t.union([t.null, t.string]),
  version: t.union([t.null, t.number]),
  allVersions: t.union([t.null, t.array(t.union([t.null, t.number]))]),
  lastValueUpdated: t.union([t.null, t.string]),
  createdBy: t.union([t.null, t.string]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  type: t.union([t.null, t.string]),
  typesAvailable: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  copyCode: t.union([
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
  sinks: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          location: t.union([t.null, t.string]),
          type: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnGetFeatureGroupDetailsSchema = t.type({
  status: t.unknown,
  statusCode: t.union([t.null, t.number]),
  data: t.union([
    t.null,
    t.type({
      id: t.union([t.null, t.string]),
      title: t.union([t.null, t.string]),
      description: t.union([t.null, t.string]),
      version: t.union([t.null, t.number]),
      allVersions: t.union([t.null, t.array(t.union([t.null, t.number]))]),
      lastValueUpdated: t.union([t.null, t.string]),
      createdBy: t.union([t.null, t.string]),
      tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
      type: t.union([t.null, t.string]),
      typesAvailable: t.union([t.null, t.array(t.union([t.null, t.string]))]),
      copyCode: t.union([
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
      sinks: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              location: t.union([t.null, t.string]),
              type: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
    }),
  ]),
})

export const GetFeatureGroupDetailsSchema = t.type({
  getFeatureGroupDetails: t.union([
    t.null,
    t.type({
      status: t.unknown,
      statusCode: t.union([t.null, t.number]),
      data: t.union([
        t.null,
        t.type({
          id: t.union([t.null, t.string]),
          title: t.union([t.null, t.string]),
          description: t.union([t.null, t.string]),
          version: t.union([t.null, t.number]),
          allVersions: t.union([t.null, t.array(t.union([t.null, t.number]))]),
          lastValueUpdated: t.union([t.null, t.string]),
          createdBy: t.union([t.null, t.string]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          type: t.union([t.null, t.string]),
          typesAvailable: t.union([
            t.null,
            t.array(t.union([t.null, t.string])),
          ]),
          copyCode: t.union([
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
          sinks: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  location: t.union([t.null, t.string]),
                  type: t.union([t.null, t.string]),
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
