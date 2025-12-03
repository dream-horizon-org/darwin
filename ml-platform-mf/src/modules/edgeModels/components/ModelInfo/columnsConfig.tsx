import Button from '@mui/material/Button'
import React from 'react'
import {TableCells} from '../../../../bit-components/datatable/constants'
import {TableCellAlignment} from '../../../../bit-components/table-cells/tc-cell/index'
import {
  TagsStatus,
  TagsStatusTypes
} from '../../../../bit-components/tags/tags-status/index'
import {CompatibleAppVersionStatus} from '../../../../gql-enums/compatible-app-version-status.enum'
import {DeploymentTableHeader} from '../../data/types'
import type {SelectionOnCompatibleAppVersions} from '../../graphQL/queries/getModelDeploymentForId'
import {UserAction, USER_ACTIONS_Enum} from './Actions'

export const getAction = (status) => {
  if (
    status === CompatibleAppVersionStatus.EVENTS_VALIDATION_FAILED ||
    status === CompatibleAppVersionStatus.FEATURE_COMPUTE_VALIDATION_FAILED ||
    status === CompatibleAppVersionStatus.ARTIFACT_CREATION_FAILED ||
    status === CompatibleAppVersionStatus.CI_FAILED
  ) {
    return USER_ACTIONS_Enum.UPDATE
  } else if (status === CompatibleAppVersionStatus.READY_TO_PUBLISH) {
    return USER_ACTIONS_Enum.PUBLISH
  } else if (status === CompatibleAppVersionStatus.READY_FOR_CI) {
    return USER_ACTIONS_Enum.RUNCI
  } else {
    return null
  }
}

export const getTagStatus = (status: string) => {
  switch (status) {
    case CompatibleAppVersionStatus.VALIDATING_EVENTS:
    case CompatibleAppVersionStatus.VALIDATING_FEATURE_COMPUTE:
    case CompatibleAppVersionStatus.CREATING_ARTIFACT:
      return TagsStatusTypes.Draft
    case CompatibleAppVersionStatus.EVENTS_VALIDATION_SUCCESS:
    case CompatibleAppVersionStatus.FEATURE_COMPUTE_VALIDATION_SUCCESS:
    case CompatibleAppVersionStatus.CI_SUCCESS:
      return TagsStatusTypes.Functional
    case CompatibleAppVersionStatus.READY_FOR_CI:
    case CompatibleAppVersionStatus.RUNNING_CI:
    case CompatibleAppVersionStatus.READY_TO_PUBLISH:
    case CompatibleAppVersionStatus.LIVE:
      return TagsStatusTypes.Active
    case CompatibleAppVersionStatus.EVENTS_VALIDATION_FAILED:
    case CompatibleAppVersionStatus.FEATURE_COMPUTE_VALIDATION_FAILED:
    case CompatibleAppVersionStatus.ARTIFACT_CREATION_FAILED:
    case CompatibleAppVersionStatus.CI_FAILED:
      return TagsStatusTypes.Error
    default:
      return TagsStatusTypes.Information
  }
}

export const getColumnConfig = () => [
  {
    id: 1,
    columnType: TableCells.TcData,
    headerProps: {
      headerLabel: DeploymentTableHeader.APPVERSION,
      align: TableCellAlignment.Left
    },
    componentProps: (item: SelectionOnCompatibleAppVersions) => ({
      text:
        item.semver + (item.codepushVersion ? ` - ${item.codepushVersion}` : '')
    })
  },
  {
    id: 2,
    columnType: TableCells.TcCustomJSX,
    headerProps: {
      headerLabel: DeploymentTableHeader.STATUS,
      align: TableCellAlignment.Left
    },
    componentProps: (item: SelectionOnCompatibleAppVersions) => ({
      jsx: <TagsStatus status={getTagStatus(item.status)} text={item.status} />
    })
  },
  {
    id: 3,
    columnType: TableCells.TcData,
    headerProps: {
      headerLabel: DeploymentTableHeader.APPNAME,
      align: TableCellAlignment.Left
    },
    componentProps: (item: SelectionOnCompatibleAppVersions) => ({
      text: item.appName
    })
  },
  {
    id: 4,
    columnType: TableCells.TcCustomJSX,
    headerProps: {
      headerLabel: DeploymentTableHeader.ACTION, // Update with the appropriate header
      align: TableCellAlignment.Left
    },
    componentProps: (item: any) => {
      return {
        jsx: getUserAction(
          {action: getAction(item.status), id: item.id},
          item.deploymentId,
          item.refresh
        )
      }
    }
  }
]

export const getUserAction = (
  info: any,
  deployment: string,
  refresh: () => void
) => {
  const _meta = info

  if (!_meta) {
    return <>-</>
  }

  if (_meta.action === USER_ACTIONS_Enum.RUNCI) {
    return (
      <UserAction
        state={USER_ACTIONS_Enum.RUNCI}
        refresh={refresh}
        appVersion={_meta.id}
        deployment={deployment}
      />
    )
  }

  if (_meta.action === USER_ACTIONS_Enum.PUBLISH) {
    return (
      <UserAction
        state={USER_ACTIONS_Enum.PUBLISH}
        refresh={refresh}
        appVersion={_meta.id}
        deployment={deployment}
      />
    )
  }

  if (_meta.action === USER_ACTIONS_Enum.UPDATE) {
    return (
      <UserAction
        state={USER_ACTIONS_Enum.UPDATE}
        refresh={refresh}
        appVersion={_meta.id}
        deployment={deployment}
      />
    )
  }

  return <>{_meta.status}</>
}
