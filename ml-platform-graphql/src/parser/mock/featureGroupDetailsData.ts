export const featureGroupDetailsAPIData = {
  status: 'Success',
  message: 'data fetched successfully',
  data: {
    name: 'test1',
    tags: ['test1_tag_1', 'test1_tag_2', 'test1_tag_3', 'test1_tag_4'],
    version: 1,
    description: 'test1_Description for Feature  1',
    ownerEmail: 'user1@example.com',
    slackNotificationChannel: 'test_slack_channel',
    sources: [
      {datasource: 'redShift', location: 'test1_table-1'},
      {datasource: 's3', location: 'test1_fg-0'},
    ],
    sinks: [{datasource: 's3', location: 'test1/bucket/path'}],
    computeMetadata: {computeType: 'DATABRICKS', databricksLink: 'test/url'},
    features: [
      {
        name: 'test1_feature-1',
        type: 'int',
        tags: ['test1_tag-1', 'test1_tag-2'],
        description: 'test1_abc',
      },
      {
        name: 'test1_feature-2',
        type: 'int',
        tags: ['test1_tag-1', 'test1_tag-2'],
        description: 'abc',
      },
    ],
    status: 'ACTIVE',
    createdDate: '2022-07-04 17:10:47.486121',
  },
}

export const featureGroupDetailsParsedResponse = {
  status: 'Success',
  message: 'data fetched successfully',
  data: {
    featureGroup: {
      name: 'test1',
      tags: ['test1_tag_1', 'test1_tag_2', 'test1_tag_3', 'test1_tag_4'],
      version: 1,
      description: 'test1_Description for Feature  1',
      slackNotificationChannel: 'test_slack_channel',
      computeMetadata: {computeType: 'DATABRICKS', databricksLink: 'test/url'},
      features: [
        {
          name: 'test1_feature-1',
          type: 'int',
          tags: ['test1_tag-1', 'test1_tag-2'],
          description: 'test1_abc',
        },
        {
          name: 'test1_feature-2',
          type: 'int',
          tags: ['test1_tag-1', 'test1_tag-2'],
          description: 'abc',
        },
      ],
      status: 'ACTIVE',
      sources: {
        s3: [{location: 'test1_fg-0'}],
        redShift: [{location: 'test1_table-1'}],
        dataFeast: [],
        athena: [],
      },
      sinks: {
        s3: [{location: 'test1/bucket/path'}],
        redShift: [],
        dataFeast: [],
        athena: [],
      },
    },
  },
}
