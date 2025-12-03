type Datasource = {
  datasource: string
  location: string
}

type Features = {
  name: string
  type: string
  tags: string[]
  description: string
}

type FeatureGroupDetailsData = {
  status: string
  message: string
  data: {
    name: string
    tags: string[]
    version: number
    description: string
    ownerEmail: string
    slackNotificationChannel: string
    sources: Datasource[]
    sinks: Datasource[]
    computeMetadata: {computeType: string; databricksLink: string}
    features: Features[]
    status: string
    createdDate: string
  }
}

type ParsedDataSource = {
  location: string
}

type Sources = {
  s3: ParsedDataSource[]
  redShift: ParsedDataSource[]
  dataFeast: ParsedDataSource[]
  athena: ParsedDataSource[]
}

const sourcesTypes = {
  s3: 's3',
  redShift: 'redShift',
  dataFeast: 'dataFeast',
  athena: 'athena',
}

export const featureGroupDetailsParser = (
  featureGroupDetailsData: FeatureGroupDetailsData
) => {
  const featureGroupDetails = featureGroupDetailsData.data
  if (!featureGroupDetails) {
    return {}
  }

  const processedRes = {
    status: featureGroupDetailsData.status,
    message: featureGroupDetailsData.message,
    data: {
      featureGroup: {
        version: featureGroupDetails.version,
        name: featureGroupDetails.name,
        status: featureGroupDetails.status,
        tags: featureGroupDetails.tags,
        description: featureGroupDetails.description,
        slackNotificationChannel: featureGroupDetails.slackNotificationChannel,
        computeMetadata: featureGroupDetails.computeMetadata,
        features: featureGroupDetails.features,
      },
    },
  }

  const sources: Sources = {
    s3: [],
    redShift: [],
    dataFeast: [],
    athena: [],
  }
  featureGroupDetails.sources.forEach((source) => {
    if (source.datasource === sourcesTypes.s3) {
      sources.s3.push({
        location: source.location,
      })
    } else if (source.datasource === sourcesTypes.redShift) {
      sources.redShift.push({
        location: source.location,
      })
    } else if (source.datasource === sourcesTypes.dataFeast) {
      sources.dataFeast.push({
        location: source.location,
      })
    } else if (source.datasource === sourcesTypes.athena) {
      sources.athena.push({
        location: source.location,
      })
    }
  })

  const sinks: Sources = {
    s3: [],
    redShift: [],
    dataFeast: [],
    athena: [],
  }

  featureGroupDetails.sinks.forEach((sink) => {
    if (sink.datasource === sourcesTypes.s3) {
      sinks.s3.push({
        location: sink.location,
      })
    }
  })

  processedRes.data.featureGroup['sources'] = sources
  processedRes.data.featureGroup['sinks'] = sinks
  return processedRes
}
