import * as t from 'io-ts'

export const GetFeatureCopyCodesInputSchema = t.partial({
  featureTitles: t.union([
    t.undefined,
    t.null,
    t.array(t.union([t.null, t.string])),
  ]),
  featureDataSourceId: t.union([t.undefined, t.null, t.string]),
  featureGroupName: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnGetFeatureCopyCodesSchema = t.type({
  data: t.union([t.null, t.string]),
  status: t.unknown,
  statusCode: t.union([t.null, t.number]),
})

export const GetFeatureCopyCodesSchema = t.type({
  getFeatureCopyCodes: t.union([
    t.null,
    t.type({
      data: t.union([t.null, t.string]),
      status: t.unknown,
      statusCode: t.union([t.null, t.number]),
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
