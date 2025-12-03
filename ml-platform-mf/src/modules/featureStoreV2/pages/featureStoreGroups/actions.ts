import {
  SET_FEATURE_GROUPS,
  SET_FEATURE_GROUPS_COUNT,
  SET_FEATURE_GROUP_FILTERS
} from './constants'
import {IFeatureGroupsState} from './reducer'

export function setFeatureGroups(
  payload: IFeatureGroupsState['featureGroups']
) {
  return {
    type: SET_FEATURE_GROUPS,
    payload
  }
}
export function setFeatureGroupFilters(
  payload: IFeatureGroupsState['featureGroupFilters']
) {
  return {
    type: SET_FEATURE_GROUP_FILTERS,
    payload
  }
}

export function setFeatureGroupsCount(
  payload: IFeatureGroupsState['featureGroupsCount']
) {
  return {
    type: SET_FEATURE_GROUPS_COUNT,
    payload
  }
}
