import {Tooltip as TooltipMUI} from '@mui/material'
import {ClassNameMap} from '@mui/styles'
import React from 'react'
import {Link} from 'react-router-dom'
import {ClusterStatus, ClusterStatusIndicator, UsageIndicator} from '../..'
import {
  ColumnConfig,
  TableCells
} from '../../../../../bit-components/datatable/index'
import {Icons} from '../../../../../bit-components/icon/index'
import {TableCellAlignment} from '../../../../../bit-components/table-cells/tc-cell/index'
import {
  Tooltip,
  ToolTipPlacement
} from '../../../../../bit-components/tooltip/index'
import {routes} from '../../../../../constants'
import {getFormattedDateTimeForCompute} from '../../../../../utils/getDateString'
import {truncate} from '../../../../../utils/helper'
import {
  CLUSTER_NAME_TRUNCATE_LENGTH,
  CREATED_BY_TRUNCATE_LENGTH,
  RUNTIME_NAME_TRUNCATE_LENGTH
} from '../../../pages/constant'

export interface TableData {
  cluster_id: string
  cluster_name: string
  status: string
  codespaces: number
  runtime: string
  cores: {
    consumed: number
    total: number
  }
  memory: {
    consumed: number
    total: number
  }
  cost: number
  tags: string[]
  last_used_on: string
  created_by: string
  created_on: string
}

export type SORTABLE_COLUMNS = {
  [key in keyof TableData]: {
    id: number
    name: string
  }
}

export const COLUMNS_TO_SORT: SORTABLE_COLUMNS = {
  cluster_id: {
    id: 0,
    name: 'ID'
  },
  cluster_name: {
    id: 1,
    name: 'Cluster Name'
  },
  codespaces: {
    id: 2,
    name: 'Codespaces'
  },
  runtime: {
    id: 3,
    name: 'Runtime'
  },
  status: {
    id: 4,
    name: 'Status'
  },
  tags: {
    id: 5,
    name: 'Tags'
  },
  cores: {
    id: 6,
    name: 'Cores'
  },
  cost: {
    id: 7,
    name: 'Cost'
  },
  memory: {
    id: 8,
    name: 'Memory'
  },
  created_by: {
    id: 9,
    name: 'Created By'
  },
  last_used_on: {
    id: 10,
    name: 'Last Used On'
  },
  created_on: {
    id: 11,
    name: 'Created On (IST)'
  }
}

const getPercenatge = (consumed: number, total: number) => {
  return Math.round((consumed / total) * 100)
}

export const getColumnConfig = (
  classes: ClassNameMap
): ColumnConfig<TableData>[] => {
  return [
    {
      id: COLUMNS_TO_SORT.cluster_name.id,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <TooltipMUI
              title={
                item.cluster_name.length > CLUSTER_NAME_TRUNCATE_LENGTH
                  ? item.cluster_name
                  : ''
              }
            >
              <Link
                to={`/clusters/${item.cluster_id}/configuration/`}
                className={classes.clusterName}
                onClick={(e) => e.stopPropagation()}
              >
                <div data-testid='cluster-list-cluster-name'>
                  {truncate(item.cluster_name, CLUSTER_NAME_TRUNCATE_LENGTH)}
                </div>
              </Link>
            </TooltipMUI>
          )
        }
      },
      headerProps: {
        headerLabel: COLUMNS_TO_SORT.cluster_name.name,
        align: TableCellAlignment.Left
      }
    },
    {
      id: COLUMNS_TO_SORT.status.id,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <div data-testid='cluster-list-cluster-status'>
              <ClusterStatusIndicator
                status={item.status as ClusterStatus}
                simpleText={false}
              />
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: COLUMNS_TO_SORT.status.name,
        align: TableCellAlignment.Left
      }
    },
    // {
    //   id: COLUMNS_TO_SORT.codespaces.id,
    //   columnType: TableCells.TcCustomJSX,
    //   componentProps(item) {
    //     return {
    //       jsx: <h1 className={classes.codespaces}>{item.codespaces}</h1>
    //     }
    //   },

    //   headerProps: {
    //     headerLabel: COLUMNS_TO_SORT.codespaces.name,
    //     align: TableCellAlignment.Left
    //   }
    // },
    {
      id: COLUMNS_TO_SORT.runtime.id,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <TooltipMUI
              title={
                item.runtime.length > RUNTIME_NAME_TRUNCATE_LENGTH
                  ? item.runtime
                  : ''
              }
            >
              <h1 className={classes.runtime}>
                {truncate(item.runtime, RUNTIME_NAME_TRUNCATE_LENGTH)}
              </h1>
            </TooltipMUI>
          )
        }
      },

      headerProps: {
        headerLabel: COLUMNS_TO_SORT.runtime.name,
        align: TableCellAlignment.Left
      }
    },
    {
      id: COLUMNS_TO_SORT.cores.id,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <div className={classes.statsContainer}>
              <div className={classes.statsTopContainer}>
                <h1 className={classes.consumedStatsText}>
                  {item?.cores?.total}
                  <span className={classes.consumedStatsTagText}>Cores</span>
                </h1>
                <h1 className={classes.statsPercentageText}>
                  {item.cores.consumed || 0}%
                </h1>
              </div>
              <div className={classes.statsBottomContainer}>
                <UsageIndicator
                  usage={item.cores.consumed}
                  maxUsage={item.cores.total}
                />
              </div>
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: COLUMNS_TO_SORT.cores.name,
        align: TableCellAlignment.Left,
        trailingToolTipIcon: Icons.ICON_ERROR_OUTLINE,
        trailingToolTipText: 'Total cores required and used by the cluster'
      }
    },
    {
      id: COLUMNS_TO_SORT.memory.id,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <div className={classes.statsContainer}>
              <div className={classes.statsTopContainer}>
                <h1 className={classes.consumedStatsText}>
                  {item?.memory?.total}
                  <span className={classes.consumedStatsTagText}>GB</span>
                </h1>
                <h1 className={classes.statsPercentageText}>
                  {item.memory.consumed}%
                </h1>
              </div>
              <div className={classes.statsBottomContainer}>
                <UsageIndicator
                  usage={item.memory.consumed}
                  maxUsage={item.memory.total}
                />
              </div>
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: COLUMNS_TO_SORT.memory.name,
        align: TableCellAlignment.Left,
        trailingToolTipIcon: Icons.ICON_ERROR_OUTLINE,
        trailingToolTipText: 'Total Memory required and used by the cluster'
      }
    },
    // featureFlags.COMPUTE.LIST_PAGE.CLUSTER_LISTING_TABLE.COST && {
    //   id: 7,
    //   columnType: TableCells.TcCustomJSX,
    //   componentProps(item) {
    //     return {
    //       jsx: (
    //         <h1 className={classes.costText}>
    //           ${Number(item.cost).toLocaleString('en-US')}
    //         </h1>
    //       )
    //     }
    //   },
    //   headerProps: {
    //     headerLabel: COLUMNS_TO_SORT.cost,
    //     align: TableCellAlignment.Left
    //   }
    // },
    {
      id: COLUMNS_TO_SORT.tags.id,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <div className={classes.tagsContainer}>
              {item.tags.length === 0 && <div>N/A</div>}
              {item.tags.slice(0, 2).map((tag) => (
                <div className={classes.tag}>{tag}</div>
              ))}
              {item.tags.length > 2 && (
                <Tooltip
                  placement={ToolTipPlacement.Bottom}
                  title={item.tags
                    .slice(2)
                    .map((tag) => tag)
                    .join(', ')}
                >
                  <p className={classes.extraTagsText}>{`+${
                    item.tags.length - 2
                  }`}</p>
                </Tooltip>
              )}
            </div>
          )
        }
      },
      headerProps: {
        align: TableCellAlignment.Left,
        headerLabel: COLUMNS_TO_SORT.tags.name
      }
    },
    {
      id: COLUMNS_TO_SORT.created_by.id,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <TooltipMUI
              title={
                item.created_by.length > CREATED_BY_TRUNCATE_LENGTH
                  ? item.created_by
                  : ''
              }
            >
              <h1
                className={classes.createdBy}
                data-testid='cluster-list-cluster-user'
              >
                {truncate(item.created_by, CREATED_BY_TRUNCATE_LENGTH)}
              </h1>
            </TooltipMUI>
          )
        }
      },
      headerProps: {
        headerLabel: COLUMNS_TO_SORT.created_by.name,
        align: TableCellAlignment.Left
      }
    },
    {
      id: COLUMNS_TO_SORT.last_used_on.id,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <h1 className={classes.createdOn}>
              {getFormattedDateTimeForCompute(item.last_used_on)}
            </h1>
          )
        }
      },
      headerProps: {
        headerLabel: COLUMNS_TO_SORT.last_used_on.name,
        align: TableCellAlignment.Left
      }
    },
    {
      id: COLUMNS_TO_SORT.created_on.id,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <h1 className={classes.createdOn}>
              {getFormattedDateTimeForCompute(item.created_on)}
            </h1>
          )
        }
      },
      headerProps: {
        headerLabel: COLUMNS_TO_SORT.created_on.name,
        align: TableCellAlignment.Left
      }
    }
  ]
}
