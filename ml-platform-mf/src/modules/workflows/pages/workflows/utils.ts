import {TagsStatusTypes} from '../../../../bit-components/tags/tags-status/index'
import {TagsType} from '../../../../bit-components/tags/tags/index'
import {routes} from '../../../../constants'
import {TAB_CONFIG} from '../../../compute/pages/constant'
import {getKeyByValue} from '../../../compute/pages/utils'
import {
  WORKFLOW_STANDARDS_ACTIVE,
  WORKFLOW_STANDARDS_FAIL,
  WORKFLOW_STANDARDS_INACTIVE,
  WORKFLOW_STANDARDS_SUCCESS
} from './constants'

export const getTagStatus = (status: string) => {
  if (
    status === WORKFLOW_STANDARDS_ACTIVE ||
    status === WORKFLOW_STANDARDS_SUCCESS
  ) {
    return TagsStatusTypes.Active
  } else if (
    status === WORKFLOW_STANDARDS_FAIL ||
    status === WORKFLOW_STANDARDS_INACTIVE
  ) {
    return TagsStatusTypes.Error
  }
  // Because of this, information is displaying upon fetching Status.
  return TagsStatusTypes.Information
}

export const formattedSnakeString = (str: string) => {
  if (!str) {
    return str
  }
  const splitStr = str.split('_')
  if (splitStr.length === 1) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  } else {
    return (
      splitStr[0].charAt(0).toUpperCase() +
      splitStr[0].slice(1) +
      ' ' +
      splitStr[1].charAt(0).toUpperCase() +
      splitStr[1].slice(1)
    )
  }
}

export const getTagsType = (status: string) => {
  if (status === WORKFLOW_STANDARDS_ACTIVE) {
    return TagsType.Valid
  } else if (status === WORKFLOW_STANDARDS_INACTIVE) {
    return TagsType.Invalid
  } else if (status === WORKFLOW_STANDARDS_FAIL) {
    return TagsType.Invalid
  }
}

export const onClusterLinkClicked = (linkType: string, clusterId: string) => {
  if (linkType === 'dashboard') {
    const path = routes.clusterEditPage
      .replace(':clusterId', clusterId)
      .replace(':tab', getKeyByValue(TAB_CONFIG, 3))
    window.open(path, '_blank')
  } else if (linkType === 'events') {
    const path = routes.clusterEditPage
      .replace(':clusterId', clusterId)
      .replace(':tab', getKeyByValue(TAB_CONFIG, 2))
    window.open(path, '_blank')
  }
}
