import {Tooltip} from '@mui/material'
import React from 'react'
import {TableCells} from '../../../../../bit-components/datatable/constants'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../../../bit-components/icon-button/index'
import {Icons} from '../../../../../bit-components/icon/index'
import {TableCellAlignment} from '../../../../../bit-components/table-cells/tc-cell/index'
import {
  TagsStatus,
  TagsStatusTypes
} from '../../../../../bit-components/tags/tags-status/index'
import {Tags, TagsType} from '../../../../../bit-components/tags/tags/index'
import {CompatibleAppVersionStatus} from '../../../../../gql-enums/compatible-app-version-status.enum'
import {truncate} from '../../../../../utils/helper'
import {
  DeploymentStatusTypes,
  NUMBER_OF_TAGS_TO_SHOW,
  START_INDEX_OF_THE_ARRAY,
  TAG_LABEL_TRUNCATE_LENGTH
} from '../../../data/constants'
import {ModelTableHeader} from '../../../data/types'
import {getISTDate} from '../../../data/utils'
import type {SelectionOnMlModelDeployments} from '../../../graphQL/queries/getModelDeployments/index'
import {CiEnum, CiStatus} from './Status'

export const getTagsToShow = (tags: string[]) => {
  if (!tags.length) return 'N/A'
  return tags
    .slice(START_INDEX_OF_THE_ARRAY, NUMBER_OF_TAGS_TO_SHOW)
    .map((tag) => (
      <Tooltip title={tag.length > TAG_LABEL_TRUNCATE_LENGTH ? tag : ''}>
        <div>
          <Tags
            label={truncate(tag, TAG_LABEL_TRUNCATE_LENGTH)}
            type={TagsType.Default}
          />
        </div>
      </Tooltip>
    ))
}

export const getNumberOfTagsToBeShown = (tags: string[], classes) => {
  return tags.length > NUMBER_OF_TAGS_TO_SHOW ? (
    <span className={classes.showMore}>
      +{tags.length - NUMBER_OF_TAGS_TO_SHOW}
    </span>
  ) : (
    ''
  )
}

export const getTagStatus = (status: string) => {
  if (
    status === DeploymentStatusTypes.READY ||
    status === DeploymentStatusTypes.DEPLOYED ||
    status === DeploymentStatusTypes.READY_TO_TEST ||
    status === DeploymentStatusTypes.TESTING
  ) {
    return TagsStatusTypes.Active
  } else if (status === DeploymentStatusTypes.FAILED) {
    return TagsStatusTypes.Error
  }

  return TagsStatusTypes.Information
}

export const getCIStatus = (
  info: SelectionOnMlModelDeployments['compatibleAppVersions'],
  deployment: string,
  refresh: () => void
) => {
  const _meta = info[0]

  if (!_meta) {
    return <>-</>
  }

  if (_meta.status === CompatibleAppVersionStatus.READY_FOR_CI) {
    return (
      <CiStatus
        state={CiEnum.TRIGGER}
        refresh={refresh}
        appVersion={_meta.id}
        deployment={deployment}
      />
    )
  }

  if (_meta.status === CompatibleAppVersionStatus.READY_TO_PUBLISH) {
    return (
      <CiStatus
        state={CiEnum.PUBLISH}
        refresh={refresh}
        appVersion={_meta.id}
        deployment={deployment}
      />
    )
  }

  if (_meta.status === CompatibleAppVersionStatus.LIVE) {
    return (
      <div>
        <span style={{marginRight: 5}}>Live</span>
        <IconButton
          leadingIcon={Icons.ICON_CHECK}
          size={IconButtonSizes.SMALL}
          actionableVariants={ActionableIconButtonVariants.ACTIONABLE_PRIMARY}
        />
      </div>
    )
  }

  return <>{_meta.status}</>
}

export const getPopoutOptions = (tags: string[]) => {
  return tags.slice(NUMBER_OF_TAGS_TO_SHOW).map((tag) => ({
    label: tag
  }))
}

export const getColumnComfig = (
  classes,
  handleShowMoreTagsClicked: (
    e: React.MouseEvent<HTMLSpanElement>,
    item: SelectionOnMlModelDeployments
  ) => void
) => {
  return [
    {
      id: 1,
      columnType: TableCells.TcData,
      headerProps: {
        headerLabel: ModelTableHeader.NAME,
        align: TableCellAlignment.Left
      },
      componentProps: (item: SelectionOnMlModelDeployments) => {
        return {text: item.deploymentName}
      }
    },
    {
      id: 2,
      columnType: TableCells.TcCustomJSX,
      headerProps: {
        headerLabel: ModelTableHeader.TAGS,
        align: TableCellAlignment.Left
      },
      componentProps: (item: SelectionOnMlModelDeployments) => {
        return {
          jsx: (
            <div className={classes.marginTags}>
              {getTagsToShow(item.tags)}
              <span
                aria-describedby={item.modelName}
                onClick={(ev) => {
                  handleShowMoreTagsClicked(ev, item)
                }}
                style={{alignContent: 'center'}}
              >
                {getNumberOfTagsToBeShown(item.tags, classes)}
              </span>
            </div>
          )
        }
      }
    },
    {
      id: 3,
      columnType: TableCells.TcData,
      headerProps: {
        headerLabel: ModelTableHeader.OWNER,
        align: TableCellAlignment.Left
      },
      componentProps: (item: SelectionOnMlModelDeployments) => {
        return {text: item.owner}
      }
    },
    {
      id: 4,
      columnType: TableCells.TcData,
      headerProps: {
        headerLabel: ModelTableHeader.LAST_MODIFIED,
        align: TableCellAlignment.Left
      },
      componentProps: (item: SelectionOnMlModelDeployments) => {
        return {text: getISTDate(item.createdAt)}
      }
    }
  ]
}
