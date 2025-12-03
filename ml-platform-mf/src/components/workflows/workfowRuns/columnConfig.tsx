import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import {Tooltip} from '@mui/material'
import React from 'react'
import {Link} from 'react-router-dom'
import {TableCells} from '../../../bit-components/datatable/index'
import {TableCellAlignment} from '../../../bit-components/table-cells/tc-cell/index'
import {TagsStatus} from '../../../bit-components/tags/tags-status/index'
import {
  formattedSnakeString,
  getTagStatus
} from '../../../modules/workflows/pages/workflows/utils'
import {getTimeDifference} from '../../../utils/helper'
import {getRunIcon} from '../allWorkflows/columnConfig'
import {getFormattedDateTime} from '../allWorkflows/utils'
import TimeExceededIcon from '../timeExceededIcon'
import {RUN_ICON_SIZE} from './constants'

export type Data = {
  runId: string
  startTime: string
  duration: number
  status: string
  trigger: string
  triggerBy: string
  isRunDurationExceeded: boolean
  expectedRunDuration: number
}

export const getColumnComfig = (
  classes,
  handleMenuClick: (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    workflowRun: Data
  ) => void,
  workflow_id: string
) => {
  return [
    {
      id: 1,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <Link
              to={`/workflows/${workflow_id}/runs/${item.runId}/tasks`}
              onClick={(e) => e.stopPropagation()}
            >
              #{item.runId}
            </Link>
          )
        }
      },
      headerProps: {
        headerLabel: 'Run ID',
        align: TableCellAlignment.Left
      }
    },
    {
      id: 2,
      columnType: TableCells.TcData,
      componentProps: (item: Data) => {
        return {
          text: getFormattedDateTime(item.startTime)
        }
      },
      headerProps: {
        headerLabel: 'Start Time',
        align: TableCellAlignment.Center
      }
    },
    {
      id: 2,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <Tooltip title={`exceeded ${item.expectedRunDuration} mins`}>
              <div className={classes.workflowRunDuration}>
                <div>{getTimeDifference(item.duration)}</div>
                {item.isRunDurationExceeded && (
                  <TimeExceededIcon width={16} height={16} />
                )}
              </div>
            </Tooltip>
          )
        }
      },
      headerProps: {
        headerLabel: 'Duration',
        align: TableCellAlignment.Center
      }
    },
    {
      id: 3,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <div className={classes.workflowDetailsStatus}>
              {getRunIcon(item.status, classes, RUN_ICON_SIZE)}
              {formattedSnakeString(item.status)}
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
      columnType: TableCells.TcData,
      componentProps: (item: Data) => {
        return {
          text: item.trigger
        }
      },
      headerProps: {headerLabel: 'Trigger'}
    },
    {
      id: 5,
      columnType: TableCells.TcData,
      componentProps: (item: Data) => {
        return {
          text: item.triggerBy
        }
      },
      headerProps: {
        headerLabel: 'Triggered By',
        align: TableCellAlignment.Center
      }
    },
    {
      id: 6,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <MoreHorizIcon
              id='basic-button'
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup='true'
              aria-expanded={open ? 'true' : undefined}
              onClick={(e) => handleMenuClick(e, item)}
            />
          )
        }
      }
    }
  ]
}
