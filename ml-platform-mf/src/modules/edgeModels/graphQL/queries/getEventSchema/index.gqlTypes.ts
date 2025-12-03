import * as t from 'io-ts'

export const GetEventSchemaInputSchema = t.partial({
  appVersionId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnAndroidfullSchema = t.type({
  name: t.string,
  expectedValue: t.string,
  rawDataType: t.string,
})

export const SelectionOnIosSchema = t.type({
  name: t.string,
  expectedValue: t.string,
  rawDataType: t.string,
})

export const SelectionOnGlobalPropertiesSchema = t.type({
  androidfull: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.string,
          expectedValue: t.string,
          rawDataType: t.string,
        }),
      ])
    ),
  ]),
  ios: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.string,
          expectedValue: t.string,
          rawDataType: t.string,
        }),
      ])
    ),
  ]),
})

export const SelectionOnPropertyMetadataSchema = t.type({
  expectedValue: t.union([t.null, t.string]),
  name: t.union([t.null, t.string]),
  rawDataType: t.union([t.null, t.string]),
})

export const SelectionOnAndroidfull1Schema = t.type({
  eventName: t.union([t.null, t.string]),
  platform: t.union([t.null, t.string]),
  propertyMetadata: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          expectedValue: t.union([t.null, t.string]),
          name: t.union([t.null, t.string]),
          rawDataType: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnIos1Schema = t.type({
  eventName: t.union([t.null, t.string]),
  platform: t.union([t.null, t.string]),
  propertyMetadata: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          expectedValue: t.union([t.null, t.string]),
          name: t.union([t.null, t.string]),
          rawDataType: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnMetadataSchema = t.type({
  androidfull: t.union([
    t.null,
    t.type({
      eventName: t.union([t.null, t.string]),
      platform: t.union([t.null, t.string]),
      propertyMetadata: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              expectedValue: t.union([t.null, t.string]),
              name: t.union([t.null, t.string]),
              rawDataType: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
    }),
  ]),
  ios: t.union([
    t.null,
    t.type({
      eventName: t.union([t.null, t.string]),
      platform: t.union([t.null, t.string]),
      propertyMetadata: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              expectedValue: t.union([t.null, t.string]),
              name: t.union([t.null, t.string]),
              rawDataType: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
    }),
  ]),
})

export const SelectionOnEventsSchema = t.type({
  metadata: t.union([
    t.null,
    t.type({
      androidfull: t.union([
        t.null,
        t.type({
          eventName: t.union([t.null, t.string]),
          platform: t.union([t.null, t.string]),
          propertyMetadata: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  expectedValue: t.union([t.null, t.string]),
                  name: t.union([t.null, t.string]),
                  rawDataType: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
        }),
      ]),
      ios: t.union([
        t.null,
        t.type({
          eventName: t.union([t.null, t.string]),
          platform: t.union([t.null, t.string]),
          propertyMetadata: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  expectedValue: t.union([t.null, t.string]),
                  name: t.union([t.null, t.string]),
                  rawDataType: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
        }),
      ]),
    }),
  ]),
})

export const SelectionOnDataSchema = t.type({
  globalProperties: t.union([
    t.null,
    t.type({
      androidfull: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              name: t.string,
              expectedValue: t.string,
              rawDataType: t.string,
            }),
          ])
        ),
      ]),
      ios: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              name: t.string,
              expectedValue: t.string,
              rawDataType: t.string,
            }),
          ])
        ),
      ]),
    }),
  ]),
  events: t.array(
    t.type({
      metadata: t.union([
        t.null,
        t.type({
          androidfull: t.union([
            t.null,
            t.type({
              eventName: t.union([t.null, t.string]),
              platform: t.union([t.null, t.string]),
              propertyMetadata: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      expectedValue: t.union([t.null, t.string]),
                      name: t.union([t.null, t.string]),
                      rawDataType: t.union([t.null, t.string]),
                    }),
                  ])
                ),
              ]),
            }),
          ]),
          ios: t.union([
            t.null,
            t.type({
              eventName: t.union([t.null, t.string]),
              platform: t.union([t.null, t.string]),
              propertyMetadata: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      expectedValue: t.union([t.null, t.string]),
                      name: t.union([t.null, t.string]),
                      rawDataType: t.union([t.null, t.string]),
                    }),
                  ])
                ),
              ]),
            }),
          ]),
        }),
      ]),
    })
  ),
})

export const SelectionOnGetEventSchemaSchema = t.type({
  data: t.type({
    globalProperties: t.union([
      t.null,
      t.type({
        androidfull: t.union([
          t.null,
          t.array(
            t.union([
              t.null,
              t.type({
                name: t.string,
                expectedValue: t.string,
                rawDataType: t.string,
              }),
            ])
          ),
        ]),
        ios: t.union([
          t.null,
          t.array(
            t.union([
              t.null,
              t.type({
                name: t.string,
                expectedValue: t.string,
                rawDataType: t.string,
              }),
            ])
          ),
        ]),
      }),
    ]),
    events: t.array(
      t.type({
        metadata: t.union([
          t.null,
          t.type({
            androidfull: t.union([
              t.null,
              t.type({
                eventName: t.union([t.null, t.string]),
                platform: t.union([t.null, t.string]),
                propertyMetadata: t.union([
                  t.null,
                  t.array(
                    t.union([
                      t.null,
                      t.type({
                        expectedValue: t.union([t.null, t.string]),
                        name: t.union([t.null, t.string]),
                        rawDataType: t.union([t.null, t.string]),
                      }),
                    ])
                  ),
                ]),
              }),
            ]),
            ios: t.union([
              t.null,
              t.type({
                eventName: t.union([t.null, t.string]),
                platform: t.union([t.null, t.string]),
                propertyMetadata: t.union([
                  t.null,
                  t.array(
                    t.union([
                      t.null,
                      t.type({
                        expectedValue: t.union([t.null, t.string]),
                        name: t.union([t.null, t.string]),
                        rawDataType: t.union([t.null, t.string]),
                      }),
                    ])
                  ),
                ]),
              }),
            ]),
          }),
        ]),
      })
    ),
  }),
})

export const GetEventSchemaSchema = t.type({
  getEventSchema: t.union([
    t.null,
    t.type({
      data: t.type({
        globalProperties: t.union([
          t.null,
          t.type({
            androidfull: t.union([
              t.null,
              t.array(
                t.union([
                  t.null,
                  t.type({
                    name: t.string,
                    expectedValue: t.string,
                    rawDataType: t.string,
                  }),
                ])
              ),
            ]),
            ios: t.union([
              t.null,
              t.array(
                t.union([
                  t.null,
                  t.type({
                    name: t.string,
                    expectedValue: t.string,
                    rawDataType: t.string,
                  }),
                ])
              ),
            ]),
          }),
        ]),
        events: t.array(
          t.type({
            metadata: t.union([
              t.null,
              t.type({
                androidfull: t.union([
                  t.null,
                  t.type({
                    eventName: t.union([t.null, t.string]),
                    platform: t.union([t.null, t.string]),
                    propertyMetadata: t.union([
                      t.null,
                      t.array(
                        t.union([
                          t.null,
                          t.type({
                            expectedValue: t.union([t.null, t.string]),
                            name: t.union([t.null, t.string]),
                            rawDataType: t.union([t.null, t.string]),
                          }),
                        ])
                      ),
                    ]),
                  }),
                ]),
                ios: t.union([
                  t.null,
                  t.type({
                    eventName: t.union([t.null, t.string]),
                    platform: t.union([t.null, t.string]),
                    propertyMetadata: t.union([
                      t.null,
                      t.array(
                        t.union([
                          t.null,
                          t.type({
                            expectedValue: t.union([t.null, t.string]),
                            name: t.union([t.null, t.string]),
                            rawDataType: t.union([t.null, t.string]),
                          }),
                        ])
                      ),
                    ]),
                  }),
                ]),
              }),
            ]),
          })
        ),
      }),
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
