import * as t from 'io-ts'

export const GetComputeLibraryDetailsInputSchema = t.partial({
  cluster_id: t.union([t.undefined, t.null, t.string]),
  library_id: t.union([t.undefined, t.null, t.number]),
})

export const SelectionOnErrorSchema = t.type({
  error_code: t.union([t.null, t.string]),
  error_message: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  cluster_id: t.union([t.null, t.string]),
  id: t.union([t.null, t.number]),
  name: t.union([t.null, t.string]),
  version: t.union([t.null, t.string]),
  type: t.unknown,
  source: t.unknown,
  path: t.union([t.null, t.string]),
  status: t.unknown,
  content: t.union([t.null, t.string]),
  error: t.union([
    t.null,
    t.type({
      error_code: t.union([t.null, t.string]),
      error_message: t.union([t.null, t.string]),
    }),
  ]),
})

export const SelectionOnGetComputeLibraryDetailsSchema = t.type({
  status: t.unknown,
  message: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      cluster_id: t.union([t.null, t.string]),
      id: t.union([t.null, t.number]),
      name: t.union([t.null, t.string]),
      version: t.union([t.null, t.string]),
      type: t.unknown,
      source: t.unknown,
      path: t.union([t.null, t.string]),
      status: t.unknown,
      content: t.union([t.null, t.string]),
      error: t.union([
        t.null,
        t.type({
          error_code: t.union([t.null, t.string]),
          error_message: t.union([t.null, t.string]),
        }),
      ]),
    }),
  ]),
})

export const GetComputeLibraryDetailsSchema = t.type({
  getComputeLibraryDetails: t.union([
    t.null,
    t.type({
      status: t.unknown,
      message: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          cluster_id: t.union([t.null, t.string]),
          id: t.union([t.null, t.number]),
          name: t.union([t.null, t.string]),
          version: t.union([t.null, t.string]),
          type: t.unknown,
          source: t.unknown,
          path: t.union([t.null, t.string]),
          status: t.unknown,
          content: t.union([t.null, t.string]),
          error: t.union([
            t.null,
            t.type({
              error_code: t.union([t.null, t.string]),
              error_message: t.union([t.null, t.string]),
            }),
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
