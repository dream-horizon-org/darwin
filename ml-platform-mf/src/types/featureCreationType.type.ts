export type featureCreationForm = {
  state: string
  name: string
  description: string
  slackNotification: string
  resourceTier: string
  schedule: string
  tags: string[]
  primaryKeys: {id: string; columnName: string; dataType: string}[]
  s3Path: string
  s3ClassName: string
  sqlQuery: string
}
