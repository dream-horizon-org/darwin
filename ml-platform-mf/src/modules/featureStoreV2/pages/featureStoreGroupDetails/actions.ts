import {
  SET_FEATURES,
  SET_FEATURE_COPY_CODES,
  SET_FEATURE_GROUP_DETAILS,
  SET_FEATURE_GROUP_ENTITIES,
  SET_FEATURE_GROUP_RUNS,
  SET_PROD_USAGE_LIST,
  SET_SELECTED_FEATURES
} from './constants'
import {IFeatureGroupDetailsState} from './reducer'

export function setFeatureGroupDetails(
  payload: IFeatureGroupDetailsState['featureGroupDetails']
) {
  return {
    type: SET_FEATURE_GROUP_DETAILS,
    payload
  }
}

export function setFeaturs(payload: IFeatureGroupDetailsState['features']) {
  return {
    type: SET_FEATURES,
    payload
  }
}

export function setProdUsageList(
  payload: IFeatureGroupDetailsState['prodUsageList']
) {
  return {
    type: SET_PROD_USAGE_LIST,
    payload
  }
}

export function setFeatureCopyCodes(
  payload: IFeatureGroupDetailsState['featureCopyCodes']
) {
  return {
    type: SET_FEATURE_COPY_CODES,
    payload
  }
}

export function setSelectedFeatures(
  payload: IFeatureGroupDetailsState['selectedFeatures']
) {
  return {
    type: SET_SELECTED_FEATURES,
    payload
  }
}

export function setFeatureGroupEntities(
  payload: IFeatureGroupDetailsState['featureGroupEntities']
) {
  return {
    type: SET_FEATURE_GROUP_ENTITIES,
    payload
  }
}

export function setFeatureGroupRuns(
  payload: IFeatureGroupDetailsState['featureGroupRuns']
) {
  return {
    type: SET_FEATURE_GROUP_RUNS,
    payload
  }
}
