import EntityList from '../../../../components/featureStore/entityList'
import FeatureList from '../../../../components/featureStore/featureList'
import RunsList from '../../../../components/featureStore/runsList/index'
import {routes} from '../../../../constants'

export const SET_FEATURE_GROUP_DETAILS = 'setFeatureGroupDetails'
export const SET_FEATURES = 'setFeatures'
export const SET_PROD_USAGE_LIST = 'setProdUsageList'
export const SET_FEATURE_COPY_CODES = 'setFeatureCopyCodes'
export const SET_SELECTED_FEATURES = 'setSelectedFeatures'
export const SET_FEATURE_GROUP_ENTITIES = 'setFeatureGroupEntities'
export const SET_FEATURE_GROUP_RUNS = 'setFeatureGroupRuns'
export interface ITab {
  name: string
  path: string
  target: string | any
  icon: string | any
  Component: any
  type?: string
}

export const featureGroupTypes = {
  online: 'online',
  offline: 'offline'
}

export const tabs: ITab[] = [
  {
    name: 'Features',
    path: routes.feature,
    target: null,
    icon: null,
    Component: FeatureList
  },
  {
    name: 'Entity',
    path: routes.feature,
    target: null,
    icon: null,
    Component: EntityList,
    type: featureGroupTypes.online
  },
  {
    name: 'Runs',
    path: routes.feature,
    target: null,
    icon: null,
    Component: RunsList,
    type: featureGroupTypes.offline
  }
  // {
  //   name: 'Usage',
  //   path: routes.feature,
  //   target: null,
  //   icon: null,
  //   Component: null
  // },
  // {
  //   name: 'Great Expectations',
  //   path: '',
  //   target: '_blank',
  //   icon: '',
  //   Component: null
  // }
]
