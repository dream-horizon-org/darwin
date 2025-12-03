import * as t from 'io-ts'

export const GetMLFlowModelArtifactUrlInputSchema = t.partial({
  runId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnFilesSchema = t.type({
  path: t.string,
  is_dir: t.boolean,
  file_size: t.number,
})

export const SelectionOnGetMLFlowModelArtifactUrlSchema = t.type({
  root_uri: t.string,
  files: t.array(
    t.type({path: t.string, is_dir: t.boolean, file_size: t.number})
  ),
})

export const GetMLFlowModelArtifactUrlSchema = t.type({
  getMLFlowModelArtifactUrl: t.union([
    t.null,
    t.type({
      root_uri: t.string,
      files: t.array(
        t.type({path: t.string, is_dir: t.boolean, file_size: t.number})
      ),
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
