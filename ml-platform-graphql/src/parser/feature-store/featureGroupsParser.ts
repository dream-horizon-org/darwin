import * as dateFormat from 'dateformat'
import {IFeatureGroupRes, IFeatureGroupsRes} from './types'

export const getFeatureGroupUpdatedTime = async (
  featureGroupName: IFeatureGroupRes['title'],
  lastValueUpdated: string,
  request: any
) => {
  return new Promise((resolve) => {
    request.loader.getFeatureGroupRunsLoader
      .load(
        JSON.stringify({
          fg_name: featureGroupName,
        })
      )
      .then((res) => {
        resolve(
          res?.data?.length > 0
            ? dateFormat(
                Number(res.data[0].executionTime) * 1000,
                'mmm d, yyyy, hh:MM TT'
              )
            : lastValueUpdated
        )
      })
      .catch((err) => {
        resolve(lastValueUpdated)
      })
  })
}

const getFeatureGroupsUpdatedTime = (
  featureGroups: IFeatureGroupsRes['data'],
  request: any
) => {
  const getfeatureGroupsUpdatedTimePromises = featureGroups.map(
    (featureGroup) => {
      return getFeatureGroupUpdatedTime(
        featureGroup.title,
        featureGroup.lastValueUpdated,
        request
      )
    }
  )
  return Promise.all(getfeatureGroupsUpdatedTimePromises).then((res) => {
    return featureGroups.map((featureGroup, index) => {
      return {
        ...featureGroup,
        lastValueUpdated: res[index],
      }
    })
  })
}

export const featureGroupsParser = async (
  data: IFeatureGroupsRes,
  request: any
) => {
  const finalFeatureGroups = await getFeatureGroupsUpdatedTime(
    data.data,
    request
  )
  return {
    ...data,
    data: finalFeatureGroups,
  }
}
