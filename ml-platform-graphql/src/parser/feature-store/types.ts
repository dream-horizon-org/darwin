export interface IFeatureGroupRes {
  title: string
  description: string
  version: number
  allVersions: number[]
  featuresCount: number
  createdBy: string
  tags: string[]
  type: string
  typesAvailable: string[]
  lastValueUpdated: string
  lastFiveRuns: string[]
  copyCode: {
    name: string
    value: string
  }[]
}

export interface ICopyCode {
  name: string
  value: string
}

export interface IFeatureGroupSinks {
  location: string
  type: string
}

export interface IFeatureGroupDetailsData {
  id: string
  title: string
  description: string
  version: number
  allVersions: number[]
  lastValueUpdated: string
  createdBy: string
  tags: string[]
  type: string
  typesAvailable: string[]
  copyCode: ICopyCode[]
  sinks: IFeatureGroupSinks[]
}

export interface IFeatureGroupDetailsRes {
  status: string
  statusCode: number
  data: IFeatureGroupDetailsData
}

export interface IFeatureGroupsRes {
  status: string
  statusCode: number
  resultSize: number
  pageSize: number
  offset: number
  totalRecordsCount: number
  data: IFeatureGroupRes[]
}
