import * as t from 'io-ts'

export const GetCatalogAssetsInputSchema = t.partial({
  regex: t.union([t.undefined, t.null, t.string]),
  page_size: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
})

export const SelectionOnDetailSchema = t.type({
  org: t.union([t.null, t.string]),
  type: t.union([t.null, t.string]),
  catalog_name: t.union([t.null, t.string]),
  database_name: t.union([t.null, t.string]),
  table_name: t.union([t.null, t.string]),
})

export const SelectionOnRulesSchema = t.type({
  id: t.union([t.null, t.number]),
  schedule: t.union([t.null, t.string]),
  left_expression: t.union([t.null, t.string]),
  comparator: t.union([t.null, t.string]),
  right_expression: t.union([t.null, t.string]),
  health_status: t.union([t.null, t.literal(false), t.literal(true)]),
  type: t.union([t.null, t.string]),
})

export const SelectionOnImmediateParentsSchema = t.type({
  name: t.union([t.null, t.string]),
  columnsMap: t.unknown,
})

export const SelectionOnAssetSchemaSchema = t.type({
  version: t.union([t.null, t.number]),
  schema_json: t.unknown,
})

export const SelectionOnMetadataSchema = t.type({
  path: t.union([t.null, t.string]),
  type: t.union([t.null, t.string]),
})

export const SelectionOnAssetsSchema = t.type({
  fqdn: t.union([t.null, t.string]),
  type: t.union([t.null, t.string]),
  detail: t.union([
    t.null,
    t.type({
      org: t.union([t.null, t.string]),
      type: t.union([t.null, t.string]),
      catalog_name: t.union([t.null, t.string]),
      database_name: t.union([t.null, t.string]),
      table_name: t.union([t.null, t.string]),
    }),
  ]),
  description: t.union([t.null, t.string]),
  source_platform: t.union([t.null, t.string]),
  business_roster: t.union([t.null, t.string]),
  rules: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          id: t.union([t.null, t.number]),
          schedule: t.union([t.null, t.string]),
          left_expression: t.union([t.null, t.string]),
          comparator: t.union([t.null, t.string]),
          right_expression: t.union([t.null, t.string]),
          health_status: t.union([t.null, t.literal(false), t.literal(true)]),
          type: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  quality_score: t.union([t.null, t.string]),
  severity: t.union([t.null, t.string]),
  slack_channel: t.union([t.null, t.string]),
  immediate_parents: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({name: t.union([t.null, t.string]), columnsMap: t.unknown}),
      ])
    ),
  ]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  asset_schema: t.union([
    t.null,
    t.type({version: t.union([t.null, t.number]), schema_json: t.unknown}),
  ]),
  asset_created_at: t.union([t.null, t.number]),
  asset_updated_at: t.union([t.null, t.number]),
  metadata: t.union([
    t.null,
    t.type({
      path: t.union([t.null, t.string]),
      type: t.union([t.null, t.string]),
    }),
  ]),
})

export const SelectionOnGetCatalogAssetsSchema = t.type({
  total: t.union([t.null, t.number]),
  offset: t.union([t.null, t.number]),
  page_size: t.union([t.null, t.number]),
  assets: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          fqdn: t.union([t.null, t.string]),
          type: t.union([t.null, t.string]),
          detail: t.union([
            t.null,
            t.type({
              org: t.union([t.null, t.string]),
              type: t.union([t.null, t.string]),
              catalog_name: t.union([t.null, t.string]),
              database_name: t.union([t.null, t.string]),
              table_name: t.union([t.null, t.string]),
            }),
          ]),
          description: t.union([t.null, t.string]),
          source_platform: t.union([t.null, t.string]),
          business_roster: t.union([t.null, t.string]),
          rules: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  id: t.union([t.null, t.number]),
                  schedule: t.union([t.null, t.string]),
                  left_expression: t.union([t.null, t.string]),
                  comparator: t.union([t.null, t.string]),
                  right_expression: t.union([t.null, t.string]),
                  health_status: t.union([
                    t.null,
                    t.literal(false),
                    t.literal(true),
                  ]),
                  type: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          quality_score: t.union([t.null, t.string]),
          severity: t.union([t.null, t.string]),
          slack_channel: t.union([t.null, t.string]),
          immediate_parents: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  columnsMap: t.unknown,
                }),
              ])
            ),
          ]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          asset_schema: t.union([
            t.null,
            t.type({
              version: t.union([t.null, t.number]),
              schema_json: t.unknown,
            }),
          ]),
          asset_created_at: t.union([t.null, t.number]),
          asset_updated_at: t.union([t.null, t.number]),
          metadata: t.union([
            t.null,
            t.type({
              path: t.union([t.null, t.string]),
              type: t.union([t.null, t.string]),
            }),
          ]),
        }),
      ])
    ),
  ]),
})

export const GetCatalogAssetsSchema = t.type({
  getCatalogAssets: t.union([
    t.null,
    t.type({
      total: t.union([t.null, t.number]),
      offset: t.union([t.null, t.number]),
      page_size: t.union([t.null, t.number]),
      assets: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              fqdn: t.union([t.null, t.string]),
              type: t.union([t.null, t.string]),
              detail: t.union([
                t.null,
                t.type({
                  org: t.union([t.null, t.string]),
                  type: t.union([t.null, t.string]),
                  catalog_name: t.union([t.null, t.string]),
                  database_name: t.union([t.null, t.string]),
                  table_name: t.union([t.null, t.string]),
                }),
              ]),
              description: t.union([t.null, t.string]),
              source_platform: t.union([t.null, t.string]),
              business_roster: t.union([t.null, t.string]),
              rules: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      id: t.union([t.null, t.number]),
                      schedule: t.union([t.null, t.string]),
                      left_expression: t.union([t.null, t.string]),
                      comparator: t.union([t.null, t.string]),
                      right_expression: t.union([t.null, t.string]),
                      health_status: t.union([
                        t.null,
                        t.literal(false),
                        t.literal(true),
                      ]),
                      type: t.union([t.null, t.string]),
                    }),
                  ])
                ),
              ]),
              quality_score: t.union([t.null, t.string]),
              severity: t.union([t.null, t.string]),
              slack_channel: t.union([t.null, t.string]),
              immediate_parents: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      name: t.union([t.null, t.string]),
                      columnsMap: t.unknown,
                    }),
                  ])
                ),
              ]),
              tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
              asset_schema: t.union([
                t.null,
                t.type({
                  version: t.union([t.null, t.number]),
                  schema_json: t.unknown,
                }),
              ]),
              asset_created_at: t.union([t.null, t.number]),
              asset_updated_at: t.union([t.null, t.number]),
              metadata: t.union([
                t.null,
                t.type({
                  path: t.union([t.null, t.string]),
                  type: t.union([t.null, t.string]),
                }),
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
