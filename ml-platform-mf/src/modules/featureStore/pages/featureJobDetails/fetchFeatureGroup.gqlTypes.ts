import * as t from 'io-ts'

export const FetchFeatureGroupInputSchema = t.partial({
  featureGroupName: t.union([t.undefined, t.null, t.string]),
  version: t.union([t.undefined, t.null, t.number]),
})

export const SelectionOnS3Schema = t.type({
  location: t.union([t.null, t.string]),
  referenceName: t.union([t.null, t.string]),
  metadata: t.union([t.null, t.string]),
})

export const SelectionOnRedShiftSchema = t.type({
  location: t.union([t.null, t.string]),
  referenceName: t.union([t.null, t.string]),
  query: t.union([t.null, t.string]),
})

export const SelectionOnFeatureListSchema = t.type({
  title: t.union([t.null, t.string]),
  type: t.union([t.null, t.string]),
})

export const SelectionOnDataFeastSchema = t.type({
  featureGroup: t.union([t.null, t.string]),
  referenceName: t.union([t.null, t.string]),
  featureList: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          title: t.union([t.null, t.string]),
          type: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnAthenaSchema = t.type({
  tableName: t.union([t.null, t.string]),
  datasetReferenceName: t.union([t.null, t.string]),
  query: t.union([t.null, t.string]),
})

export const SelectionOnSourcesSchema = t.type({
  s3: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          location: t.union([t.null, t.string]),
          referenceName: t.union([t.null, t.string]),
          metadata: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  redShift: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          location: t.union([t.null, t.string]),
          referenceName: t.union([t.null, t.string]),
          query: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  dataFeast: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          featureGroup: t.union([t.null, t.string]),
          referenceName: t.union([t.null, t.string]),
          featureList: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  title: t.union([t.null, t.string]),
                  type: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
        }),
      ])
    ),
  ]),
  athena: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          tableName: t.union([t.null, t.string]),
          datasetReferenceName: t.union([t.null, t.string]),
          query: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnSinksSchema = t.type({
  s3: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          location: t.union([t.null, t.string]),
          referenceName: t.union([t.null, t.string]),
          metadata: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  redShift: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          location: t.union([t.null, t.string]),
          referenceName: t.union([t.null, t.string]),
          query: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  dataFeast: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          featureGroup: t.union([t.null, t.string]),
          referenceName: t.union([t.null, t.string]),
          featureList: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  title: t.union([t.null, t.string]),
                  type: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
        }),
      ])
    ),
  ]),
  athena: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          tableName: t.union([t.null, t.string]),
          datasetReferenceName: t.union([t.null, t.string]),
          query: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnCustomCodeSchema = t.type({
  s3ClassName: t.union([t.null, t.string]),
  s3Path: t.union([t.null, t.string]),
  requirementFilePath: t.union([t.null, t.string]),
})

export const SelectionOnComputeMetadataSchema = t.type({
  computeType: t.union([t.null, t.string]),
  sqlQuery: t.union([t.null, t.string]),
  databricksLink: t.union([t.null, t.string]),
  customCode: t.union([
    t.null,
    t.type({
      s3ClassName: t.union([t.null, t.string]),
      s3Path: t.union([t.null, t.string]),
      requirementFilePath: t.union([t.null, t.string]),
    }),
  ]),
})

export const SelectionOnFeaturesSchema = t.type({
  name: t.union([t.null, t.string]),
  type: t.union([t.null, t.string]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  description: t.union([t.null, t.string]),
  primaryKey: t.union([t.null, t.literal(false), t.literal(true)]),
  partitionKey: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnScheduleDataSchema = t.type({
  timeStamp: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
  link: t.union([t.null, t.string]),
  sampleData: t.union([t.null, t.string]),
  errorStackTrack: t.union([t.null, t.string]),
  retryNumber: t.union([t.null, t.string]),
})

export const SelectionOnScheduleJobSchema = t.type({
  resourceTier: t.union([t.null, t.string]),
  schedule: t.union([t.null, t.string]),
  scheduleData: t.union([
    t.null,
    t.type({
      timeStamp: t.union([t.null, t.string]),
      status: t.union([t.null, t.string]),
      link: t.union([t.null, t.string]),
      sampleData: t.union([t.null, t.string]),
      errorStackTrack: t.union([t.null, t.string]),
      retryNumber: t.union([t.null, t.string]),
    }),
  ]),
})

export const SelectionOnFeatureGroupSchema = t.type({
  version: t.union([t.null, t.string]),
  name: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  description: t.union([t.null, t.string]),
  slackNotificationChannel: t.union([t.null, t.string]),
  sources: t.union([
    t.null,
    t.type({
      s3: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              location: t.union([t.null, t.string]),
              referenceName: t.union([t.null, t.string]),
              metadata: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      redShift: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              location: t.union([t.null, t.string]),
              referenceName: t.union([t.null, t.string]),
              query: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      dataFeast: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              featureGroup: t.union([t.null, t.string]),
              referenceName: t.union([t.null, t.string]),
              featureList: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      title: t.union([t.null, t.string]),
                      type: t.union([t.null, t.string]),
                    }),
                  ])
                ),
              ]),
            }),
          ])
        ),
      ]),
      athena: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              tableName: t.union([t.null, t.string]),
              datasetReferenceName: t.union([t.null, t.string]),
              query: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
    }),
  ]),
  sinks: t.union([
    t.null,
    t.type({
      s3: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              location: t.union([t.null, t.string]),
              referenceName: t.union([t.null, t.string]),
              metadata: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      redShift: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              location: t.union([t.null, t.string]),
              referenceName: t.union([t.null, t.string]),
              query: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      dataFeast: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              featureGroup: t.union([t.null, t.string]),
              referenceName: t.union([t.null, t.string]),
              featureList: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      title: t.union([t.null, t.string]),
                      type: t.union([t.null, t.string]),
                    }),
                  ])
                ),
              ]),
            }),
          ])
        ),
      ]),
      athena: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              tableName: t.union([t.null, t.string]),
              datasetReferenceName: t.union([t.null, t.string]),
              query: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
    }),
  ]),
  computeMetadata: t.union([
    t.null,
    t.type({
      computeType: t.union([t.null, t.string]),
      sqlQuery: t.union([t.null, t.string]),
      databricksLink: t.union([t.null, t.string]),
      customCode: t.union([
        t.null,
        t.type({
          s3ClassName: t.union([t.null, t.string]),
          s3Path: t.union([t.null, t.string]),
          requirementFilePath: t.union([t.null, t.string]),
        }),
      ]),
    }),
  ]),
  features: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          type: t.union([t.null, t.string]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          description: t.union([t.null, t.string]),
          primaryKey: t.union([t.null, t.literal(false), t.literal(true)]),
          partitionKey: t.union([t.null, t.literal(false), t.literal(true)]),
        }),
      ])
    ),
  ]),
  scheduleJob: t.union([
    t.null,
    t.type({
      resourceTier: t.union([t.null, t.string]),
      schedule: t.union([t.null, t.string]),
      scheduleData: t.union([
        t.null,
        t.type({
          timeStamp: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
          link: t.union([t.null, t.string]),
          sampleData: t.union([t.null, t.string]),
          errorStackTrack: t.union([t.null, t.string]),
          retryNumber: t.union([t.null, t.string]),
        }),
      ]),
    }),
  ]),
})

export const SelectionOnDataSchema = t.type({
  featureGroup: t.union([
    t.null,
    t.type({
      version: t.union([t.null, t.string]),
      name: t.union([t.null, t.string]),
      status: t.union([t.null, t.string]),
      tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
      description: t.union([t.null, t.string]),
      slackNotificationChannel: t.union([t.null, t.string]),
      sources: t.union([
        t.null,
        t.type({
          s3: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  location: t.union([t.null, t.string]),
                  referenceName: t.union([t.null, t.string]),
                  metadata: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          redShift: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  location: t.union([t.null, t.string]),
                  referenceName: t.union([t.null, t.string]),
                  query: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          dataFeast: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  featureGroup: t.union([t.null, t.string]),
                  referenceName: t.union([t.null, t.string]),
                  featureList: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          title: t.union([t.null, t.string]),
                          type: t.union([t.null, t.string]),
                        }),
                      ])
                    ),
                  ]),
                }),
              ])
            ),
          ]),
          athena: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  tableName: t.union([t.null, t.string]),
                  datasetReferenceName: t.union([t.null, t.string]),
                  query: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
        }),
      ]),
      sinks: t.union([
        t.null,
        t.type({
          s3: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  location: t.union([t.null, t.string]),
                  referenceName: t.union([t.null, t.string]),
                  metadata: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          redShift: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  location: t.union([t.null, t.string]),
                  referenceName: t.union([t.null, t.string]),
                  query: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          dataFeast: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  featureGroup: t.union([t.null, t.string]),
                  referenceName: t.union([t.null, t.string]),
                  featureList: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          title: t.union([t.null, t.string]),
                          type: t.union([t.null, t.string]),
                        }),
                      ])
                    ),
                  ]),
                }),
              ])
            ),
          ]),
          athena: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  tableName: t.union([t.null, t.string]),
                  datasetReferenceName: t.union([t.null, t.string]),
                  query: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
        }),
      ]),
      computeMetadata: t.union([
        t.null,
        t.type({
          computeType: t.union([t.null, t.string]),
          sqlQuery: t.union([t.null, t.string]),
          databricksLink: t.union([t.null, t.string]),
          customCode: t.union([
            t.null,
            t.type({
              s3ClassName: t.union([t.null, t.string]),
              s3Path: t.union([t.null, t.string]),
              requirementFilePath: t.union([t.null, t.string]),
            }),
          ]),
        }),
      ]),
      features: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              name: t.union([t.null, t.string]),
              type: t.union([t.null, t.string]),
              tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
              description: t.union([t.null, t.string]),
              primaryKey: t.union([t.null, t.literal(false), t.literal(true)]),
              partitionKey: t.union([
                t.null,
                t.literal(false),
                t.literal(true),
              ]),
            }),
          ])
        ),
      ]),
      scheduleJob: t.union([
        t.null,
        t.type({
          resourceTier: t.union([t.null, t.string]),
          schedule: t.union([t.null, t.string]),
          scheduleData: t.union([
            t.null,
            t.type({
              timeStamp: t.union([t.null, t.string]),
              status: t.union([t.null, t.string]),
              link: t.union([t.null, t.string]),
              sampleData: t.union([t.null, t.string]),
              errorStackTrack: t.union([t.null, t.string]),
              retryNumber: t.union([t.null, t.string]),
            }),
          ]),
        }),
      ]),
    }),
  ]),
})

export const SelectionOnFetchFeatureGroupSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      featureGroup: t.union([
        t.null,
        t.type({
          version: t.union([t.null, t.string]),
          name: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          description: t.union([t.null, t.string]),
          slackNotificationChannel: t.union([t.null, t.string]),
          sources: t.union([
            t.null,
            t.type({
              s3: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      location: t.union([t.null, t.string]),
                      referenceName: t.union([t.null, t.string]),
                      metadata: t.union([t.null, t.string]),
                    }),
                  ])
                ),
              ]),
              redShift: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      location: t.union([t.null, t.string]),
                      referenceName: t.union([t.null, t.string]),
                      query: t.union([t.null, t.string]),
                    }),
                  ])
                ),
              ]),
              dataFeast: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      featureGroup: t.union([t.null, t.string]),
                      referenceName: t.union([t.null, t.string]),
                      featureList: t.union([
                        t.null,
                        t.array(
                          t.union([
                            t.null,
                            t.type({
                              title: t.union([t.null, t.string]),
                              type: t.union([t.null, t.string]),
                            }),
                          ])
                        ),
                      ]),
                    }),
                  ])
                ),
              ]),
              athena: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      tableName: t.union([t.null, t.string]),
                      datasetReferenceName: t.union([t.null, t.string]),
                      query: t.union([t.null, t.string]),
                    }),
                  ])
                ),
              ]),
            }),
          ]),
          sinks: t.union([
            t.null,
            t.type({
              s3: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      location: t.union([t.null, t.string]),
                      referenceName: t.union([t.null, t.string]),
                      metadata: t.union([t.null, t.string]),
                    }),
                  ])
                ),
              ]),
              redShift: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      location: t.union([t.null, t.string]),
                      referenceName: t.union([t.null, t.string]),
                      query: t.union([t.null, t.string]),
                    }),
                  ])
                ),
              ]),
              dataFeast: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      featureGroup: t.union([t.null, t.string]),
                      referenceName: t.union([t.null, t.string]),
                      featureList: t.union([
                        t.null,
                        t.array(
                          t.union([
                            t.null,
                            t.type({
                              title: t.union([t.null, t.string]),
                              type: t.union([t.null, t.string]),
                            }),
                          ])
                        ),
                      ]),
                    }),
                  ])
                ),
              ]),
              athena: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      tableName: t.union([t.null, t.string]),
                      datasetReferenceName: t.union([t.null, t.string]),
                      query: t.union([t.null, t.string]),
                    }),
                  ])
                ),
              ]),
            }),
          ]),
          computeMetadata: t.union([
            t.null,
            t.type({
              computeType: t.union([t.null, t.string]),
              sqlQuery: t.union([t.null, t.string]),
              databricksLink: t.union([t.null, t.string]),
              customCode: t.union([
                t.null,
                t.type({
                  s3ClassName: t.union([t.null, t.string]),
                  s3Path: t.union([t.null, t.string]),
                  requirementFilePath: t.union([t.null, t.string]),
                }),
              ]),
            }),
          ]),
          features: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  type: t.union([t.null, t.string]),
                  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
                  description: t.union([t.null, t.string]),
                  primaryKey: t.union([
                    t.null,
                    t.literal(false),
                    t.literal(true),
                  ]),
                  partitionKey: t.union([
                    t.null,
                    t.literal(false),
                    t.literal(true),
                  ]),
                }),
              ])
            ),
          ]),
          scheduleJob: t.union([
            t.null,
            t.type({
              resourceTier: t.union([t.null, t.string]),
              schedule: t.union([t.null, t.string]),
              scheduleData: t.union([
                t.null,
                t.type({
                  timeStamp: t.union([t.null, t.string]),
                  status: t.union([t.null, t.string]),
                  link: t.union([t.null, t.string]),
                  sampleData: t.union([t.null, t.string]),
                  errorStackTrack: t.union([t.null, t.string]),
                  retryNumber: t.union([t.null, t.string]),
                }),
              ]),
            }),
          ]),
        }),
      ]),
    }),
  ]),
})

export const FetchFeatureGroupSchema = t.type({
  fetchFeatureGroup: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          featureGroup: t.union([
            t.null,
            t.type({
              version: t.union([t.null, t.string]),
              name: t.union([t.null, t.string]),
              status: t.union([t.null, t.string]),
              tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
              description: t.union([t.null, t.string]),
              slackNotificationChannel: t.union([t.null, t.string]),
              sources: t.union([
                t.null,
                t.type({
                  s3: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          location: t.union([t.null, t.string]),
                          referenceName: t.union([t.null, t.string]),
                          metadata: t.union([t.null, t.string]),
                        }),
                      ])
                    ),
                  ]),
                  redShift: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          location: t.union([t.null, t.string]),
                          referenceName: t.union([t.null, t.string]),
                          query: t.union([t.null, t.string]),
                        }),
                      ])
                    ),
                  ]),
                  dataFeast: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          featureGroup: t.union([t.null, t.string]),
                          referenceName: t.union([t.null, t.string]),
                          featureList: t.union([
                            t.null,
                            t.array(
                              t.union([
                                t.null,
                                t.type({
                                  title: t.union([t.null, t.string]),
                                  type: t.union([t.null, t.string]),
                                }),
                              ])
                            ),
                          ]),
                        }),
                      ])
                    ),
                  ]),
                  athena: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          tableName: t.union([t.null, t.string]),
                          datasetReferenceName: t.union([t.null, t.string]),
                          query: t.union([t.null, t.string]),
                        }),
                      ])
                    ),
                  ]),
                }),
              ]),
              sinks: t.union([
                t.null,
                t.type({
                  s3: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          location: t.union([t.null, t.string]),
                          referenceName: t.union([t.null, t.string]),
                          metadata: t.union([t.null, t.string]),
                        }),
                      ])
                    ),
                  ]),
                  redShift: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          location: t.union([t.null, t.string]),
                          referenceName: t.union([t.null, t.string]),
                          query: t.union([t.null, t.string]),
                        }),
                      ])
                    ),
                  ]),
                  dataFeast: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          featureGroup: t.union([t.null, t.string]),
                          referenceName: t.union([t.null, t.string]),
                          featureList: t.union([
                            t.null,
                            t.array(
                              t.union([
                                t.null,
                                t.type({
                                  title: t.union([t.null, t.string]),
                                  type: t.union([t.null, t.string]),
                                }),
                              ])
                            ),
                          ]),
                        }),
                      ])
                    ),
                  ]),
                  athena: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          tableName: t.union([t.null, t.string]),
                          datasetReferenceName: t.union([t.null, t.string]),
                          query: t.union([t.null, t.string]),
                        }),
                      ])
                    ),
                  ]),
                }),
              ]),
              computeMetadata: t.union([
                t.null,
                t.type({
                  computeType: t.union([t.null, t.string]),
                  sqlQuery: t.union([t.null, t.string]),
                  databricksLink: t.union([t.null, t.string]),
                  customCode: t.union([
                    t.null,
                    t.type({
                      s3ClassName: t.union([t.null, t.string]),
                      s3Path: t.union([t.null, t.string]),
                      requirementFilePath: t.union([t.null, t.string]),
                    }),
                  ]),
                }),
              ]),
              features: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      name: t.union([t.null, t.string]),
                      type: t.union([t.null, t.string]),
                      tags: t.union([
                        t.null,
                        t.array(t.union([t.null, t.string])),
                      ]),
                      description: t.union([t.null, t.string]),
                      primaryKey: t.union([
                        t.null,
                        t.literal(false),
                        t.literal(true),
                      ]),
                      partitionKey: t.union([
                        t.null,
                        t.literal(false),
                        t.literal(true),
                      ]),
                    }),
                  ])
                ),
              ]),
              scheduleJob: t.union([
                t.null,
                t.type({
                  resourceTier: t.union([t.null, t.string]),
                  schedule: t.union([t.null, t.string]),
                  scheduleData: t.union([
                    t.null,
                    t.type({
                      timeStamp: t.union([t.null, t.string]),
                      status: t.union([t.null, t.string]),
                      link: t.union([t.null, t.string]),
                      sampleData: t.union([t.null, t.string]),
                      errorStackTrack: t.union([t.null, t.string]),
                      retryNumber: t.union([t.null, t.string]),
                    }),
                  ]),
                }),
              ]),
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
