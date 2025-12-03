import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import {CircularProgress, Tooltip} from '@mui/material'
import cronstrue from 'cronstrue'
import React, {MouseEventHandler} from 'react'
import {Link} from 'react-router-dom'
import {TableCells} from '../../../bit-components/datatable/index'
import {
  LoaderSize,
  ProgressCircle
} from '../../../bit-components/progress-circle/index'
import {TableCellAlignment} from '../../../bit-components/table-cells/tc-cell'
import {Tags, TagsType} from '../../../bit-components/tags/tags'
import {TagsStatus} from '../../../bit-components/tags/tags-status/index'
import {
  CRON_EXPRESSION_TITLE_TRUNCATE_LENGTH,
  OWNER_TRUNCATE_LENGTH,
  RECENTLY_CREATED_TITLE_TRUNCATE_LENGTH,
  TAG_LABEL_TRUNCATE_LENGTH,
  WORKFLOW_DESCRIPTION_TRUNCATE_LENGTH,
  WORKFLOW_NAME_TRUNCATE_LENGTH
} from '../../../modules/workflows/pages/workflows/constants'
import {
  formattedSnakeString,
  getTagStatus
} from '../../../modules/workflows/pages/workflows/utils'
import {truncate} from '../../../utils/helper'
import TimeExceededIcon from '../timeExceededIcon'
import {
  DURATION_EXCEEDED,
  FAILED_RUN,
  NUMBER_OF_TAGS_TO_SHOW,
  QUEUED_RUN,
  RUNNING_RUN,
  RUN_ICON_SIZE,
  SKIPPED_RUN,
  START_INDEX_OF_THE_ARRAY,
  SUCCESS_RUN,
  WORKFLOW_RUN_STATUS
} from './constant'
import {getFormattedDateTime} from './utils'

export type Data = {
  id: string
  workflowName: string
  displayName: string
  description: string
  schedule: string
  status: string
  tags: string[]
  lastRunDetails: {
    run_status: string
    is_run_duration_exceeded: boolean
    expected_run_duration: number
  }[]
  nextRun: string
  owner: string
}

export const getRunIcon = (run: string, classes, size) => {
  if (run === RUNNING_RUN) {
    return (
      <div className={`${classes.runningIcon} ${classes.runStatusAlignment}`}>
        <CircularProgress size={size} />
      </div>
    )
  } else if (run === SUCCESS_RUN) {
    return (
      <CheckCircleOutlineOutlinedIcon
        className={`${classes.runStatus} ${classes.successIcon} ${classes.runStatusAlignment} ${classes.iconDimension}`}
      />
    )
  } else if (run === FAILED_RUN) {
    return (
      <ErrorOutlineOutlinedIcon
        className={`${classes.runStatus} ${classes.errorIcon} ${classes.runStatusAlignment} ${classes.iconDimension}`}
      />
    )
  } else if (run === QUEUED_RUN) {
    return (
      <AccessTimeIcon
        className={`${classes.runStatus} ${classes.disabledIcon} ${classes.runStatusAlignment} ${classes.iconDimension}`}
      />
    )
  } else if (run === SKIPPED_RUN) {
    return (
      <DoNotDisturbIcon
        className={`${classes.runStatus} ${classes.skippedIcon} ${classes.runStatusAlignment} ${classes.iconDimension}`}
      />
    )
  } else {
    return (
      <ErrorOutlineOutlinedIcon
        className={`${classes.runStatus} ${classes.errorIcon} ${classes.runStatusAlignment} ${classes.iconDimension}`}
      />
    )
  }

  return <></>
}

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

export const getPopoutOptions = (tags: string[]) => {
  return tags.slice(NUMBER_OF_TAGS_TO_SHOW).map((tag) => ({
    label: tag
  }))
}

export const getColumnComfig = (
  classes,
  handleShowMoreTagsClicked: (
    e: React.MouseEvent<HTMLSpanElement>,
    item: Data
  ) => void,
  handleMenuClick: (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    workflow: Data
  ) => void
) => {
  return [
    {
      id: 1,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <Link
              data-testid='workflow-row'
              to={`/workflows/${item.id}/runs`}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <Tooltip
                  title={
                    item.displayName.length > WORKFLOW_NAME_TRUNCATE_LENGTH
                      ? item.displayName
                      : ''
                  }
                >
                  <div
                    data-testid='workflow-row-name'
                    className={classes.workflowName}
                  >
                    {truncate(item.displayName, WORKFLOW_NAME_TRUNCATE_LENGTH)}
                  </div>
                </Tooltip>
                <Tooltip
                  title={
                    item.description.length >
                    WORKFLOW_DESCRIPTION_TRUNCATE_LENGTH
                      ? item.description
                      : ''
                  }
                >
                  <div className={classes.workflowDescription}>
                    {truncate(
                      item.description,
                      WORKFLOW_DESCRIPTION_TRUNCATE_LENGTH
                    )}
                  </div>
                </Tooltip>
              </div>
            </Link>
          )
        }
      },
      headerProps: {
        headerLabel: 'Name',
        align: TableCellAlignment.Center
      }
    },
    {
      id: 2,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        const cronExpression = item?.schedule
          ? item.schedule === '@once'
            ? '@once'
            : cronstrue.toString(item?.schedule, {
                throwExceptionOnParseError: false,
                verbose: true
              })
          : 'N/A'
        return {
          jsx: (
            <Tooltip
              title={
                cronExpression.length > CRON_EXPRESSION_TITLE_TRUNCATE_LENGTH
                  ? cronExpression
                  : ''
              }
            >
              <span className={classes.scheduleDescription}>
                {truncate(
                  cronExpression,
                  CRON_EXPRESSION_TITLE_TRUNCATE_LENGTH
                )}
              </span>
            </Tooltip>
          )
        }
      },
      headerProps: {
        headerLabel: 'Schedule',
        align: TableCellAlignment.Center
      }
    },
    {
      id: 3,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <div
              data-testid={`workflow-row-status-${item.status}`}
              data-cy='workflow-row-status'
            >
              <TagsStatus
                status={getTagStatus(item.status)}
                text={formattedSnakeString(item.status)}
              />
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: 'Status',
        align: TableCellAlignment.Center
      }
    },
    {
      id: 4,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <div className={classes.marginTags}>
              {getTagsToShow(item.tags)}
              <span
                aria-describedby={item.id}
                onClick={(ev) => {
                  handleShowMoreTagsClicked(ev, item)
                }}
              >
                {getNumberOfTagsToBeShown(item.tags, classes)}
              </span>
            </div>
          )
        }
      },
      headerProps: {headerLabel: 'Tags', align: TableCellAlignment.Center}
    },
    {
      id: 5,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <div className={classes.lastRunDetails}>
              {(item.lastRunDetails || []).length === 0 && 'No runs yet!'}
              {(item.lastRunDetails || []).slice(0, 5).map((run) => (
                <Tooltip
                  title={
                    run.is_run_duration_exceeded
                      ? `${
                          WORKFLOW_RUN_STATUS[run.run_status]
                        }: ${DURATION_EXCEEDED}`
                      : WORKFLOW_RUN_STATUS[run.run_status]
                  }
                >
                  <div className={classes.workflowIconContainer}>
                    {getRunIcon(run.run_status, classes, RUN_ICON_SIZE)}
                    {run.is_run_duration_exceeded && (
                      <div className={classes.timeExceededIcon}>
                        <TimeExceededIcon width={14} height={14} />
                      </div>
                    )}
                  </div>
                </Tooltip>
              ))}
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: 'Last 5 Runs',
        align: TableCellAlignment.Center
      }
    },
    {
      id: 6,
      columnType: TableCells.TcData,
      componentProps: (item: Data) => {
        return {text: getFormattedDateTime(item.nextRun)}
      },
      headerProps: {headerLabel: 'Next Run', align: TableCellAlignment.Center}
    },
    {
      id: 7,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <Tooltip
              title={
                item.owner.length > OWNER_TRUNCATE_LENGTH ? item.owner : ''
              }
            >
              <div>
                {item.owner
                  ? truncate(item.owner, OWNER_TRUNCATE_LENGTH)
                  : 'N/A'}
              </div>
            </Tooltip>
          )
        }
      },
      headerProps: {headerLabel: 'Owner', align: TableCellAlignment.Center}
    },
    {
      id: 7,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <div data-testid={`workflow-list-row-action-button`}>
              <MoreHorizIcon
                id='basic-button'
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup='true'
                aria-expanded={open ? 'true' : undefined}
                onClick={(e) => handleMenuClick(e, item)}
              />
            </div>
          )
        }
      }
    }
  ]
}
