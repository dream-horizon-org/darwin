import {getFeatureGroupUpdatedTime} from './featureGroupsParser'
import {IFeatureGroupDetailsRes} from './types'

export const featureGroupParser = async (
  data: IFeatureGroupDetailsRes,
  request: any
) => {
  const res = (await getFeatureGroupUpdatedTime(
    data.data.title,
    data.data.lastValueUpdated,
    request
  )) as string

  data.data = {
    ...data.data,
    lastValueUpdated: res,
  }

  return data
}
