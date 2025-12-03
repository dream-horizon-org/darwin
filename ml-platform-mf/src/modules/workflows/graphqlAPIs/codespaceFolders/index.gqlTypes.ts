import * as t from 'io-ts'

export const CodespaceFoldersInputSchema = t.partial({
  codespaceId: t.union([t.undefined, t.null, t.string]),
  folderPath: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnFilesSchema = t.type({
  name: t.union([t.null, t.string]),
})

export const SelectionOnSubFoldersSchema = t.type({
  name: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  files: t.union([
    t.null,
    t.array(t.union([t.null, t.type({name: t.union([t.null, t.string])})])),
  ]),
  sub_folders: t.union([
    t.null,
    t.array(t.union([t.null, t.type({name: t.union([t.null, t.string])})])),
  ]),
})

export const SelectionOnCodespaceFoldersSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      files: t.union([
        t.null,
        t.array(t.union([t.null, t.type({name: t.union([t.null, t.string])})])),
      ]),
      sub_folders: t.union([
        t.null,
        t.array(t.union([t.null, t.type({name: t.union([t.null, t.string])})])),
      ]),
    }),
  ]),
})

export const CodespaceFoldersSchema = t.type({
  codespaceFolders: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          files: t.union([
            t.null,
            t.array(
              t.union([t.null, t.type({name: t.union([t.null, t.string])})])
            ),
          ]),
          sub_folders: t.union([
            t.null,
            t.array(
              t.union([t.null, t.type({name: t.union([t.null, t.string])})])
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
