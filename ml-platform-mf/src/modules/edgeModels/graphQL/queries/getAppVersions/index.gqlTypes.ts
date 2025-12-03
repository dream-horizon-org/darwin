import * as t from 'io-ts'

export const SelectionOnAppVersionsSchema = t.type({
  appName: t.string,
  buildNumber: t.union([t.null, t.number]),
  codepushVersion: t.union([t.null, t.string]),
  id: t.string,
  semver: t.string,
})

export const SelectionOnVersionsSchema = t.type({
  appName: t.union([t.null, t.string]),
  appVersions: t.array(
    t.type({
      appName: t.string,
      buildNumber: t.union([t.null, t.number]),
      codepushVersion: t.union([t.null, t.string]),
      id: t.string,
      semver: t.string,
    })
  ),
})

export const SelectionOnDataSchema = t.type({
  versions: t.array(
    t.type({
      appName: t.union([t.null, t.string]),
      appVersions: t.array(
        t.type({
          appName: t.string,
          buildNumber: t.union([t.null, t.number]),
          codepushVersion: t.union([t.null, t.string]),
          id: t.string,
          semver: t.string,
        })
      ),
    })
  ),
})

export const SelectionOnGetAppVersionsSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      versions: t.array(
        t.type({
          appName: t.union([t.null, t.string]),
          appVersions: t.array(
            t.type({
              appName: t.string,
              buildNumber: t.union([t.null, t.number]),
              codepushVersion: t.union([t.null, t.string]),
              id: t.string,
              semver: t.string,
            })
          ),
        })
      ),
    }),
  ]),
})

export const GetAppVersionsSchema = t.type({
  getAppVersions: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          versions: t.array(
            t.type({
              appName: t.union([t.null, t.string]),
              appVersions: t.array(
                t.type({
                  appName: t.string,
                  buildNumber: t.union([t.null, t.number]),
                  codepushVersion: t.union([t.null, t.string]),
                  id: t.string,
                  semver: t.string,
                })
              ),
            })
          ),
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
