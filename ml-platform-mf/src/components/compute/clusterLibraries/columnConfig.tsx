import ReplayIcon from '@mui/icons-material/Replay'
import React, {MouseEventHandler} from 'react'
import {TableCells} from '../../../bit-components/datatable/index'
import {
  LoaderSize,
  ProgressCircle
} from '../../../bit-components/progress-circle/index'
import {TableCellAlignment} from '../../../bit-components/table-cells/tc-cell/index'

import {LibraryStatus} from '../../../gql-enums/library-status.enum'
import {CLUSTER_LIBRARY_STATUS} from '../../../modules/compute/pages/constant'

const getLibraryStatusClass = (
  classes,
  libraryStatus: string,
  clusterStatus: string
) => {
  if (libraryStatus === LibraryStatus.failed) {
    if (clusterStatus === 'inactive') {
      return classes.failedInactiveStatus
    } else {
      return classes.failedStatus
    }
  } else if (libraryStatus === LibraryStatus.success) {
    if (clusterStatus === 'inactive') {
      return classes.successInactiveStatus
    } else {
      return classes.successStatus
    }
  } else if (libraryStatus === LibraryStatus.uninstall_pending) {
    return classes.uninstallPendingStatus
  }

  return ''
}

export type Data = {
  id: number
  name: string
  version: string
  source: string
  type: string
  status: string
}

export const getColumnConfig = (
  classes,
  handleLibraryClick,
  handleLibraryInstallRetry: (libraryId: number) => void,
  libraryInstallRetryLoading: boolean,
  libraryInstallRetryId: number,
  clusterStatus: string
) => {
  return [
    {
      id: 1,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <div
              className={`${classes.statusColumn} ${getLibraryStatusClass(
                classes,
                item.status,
                clusterStatus
              )}`}
            >
              {item.status === LibraryStatus.running ? (
                <ProgressCircle size={LoaderSize.Small} />
              ) : item.status === LibraryStatus.created ? (
                '-'
              ) : (
                CLUSTER_LIBRARY_STATUS[item.status]
              )}
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: 'Status',
        align: TableCellAlignment.Left
      }
    },
    {
      id: 2,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <div
              className={`${
                item.status === LibraryStatus.running ? '' : classes.libraryName
              }`}
              onClick={(e) => {
                e.stopPropagation()
                handleLibraryClick(item.id)
              }}
            >
              {item.version ? `${item.name} (${item.version})` : item.name}
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: 'Library',
        align: TableCellAlignment.Left
      }
    },
    {
      id: 3,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: <div>{item.type}</div>
        }
      },
      headerProps: {
        headerLabel: 'Type',
        align: TableCellAlignment.Left
      }
    },
    {
      id: 4,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: <div>{item.source}</div>
        }
      },
      headerProps: {
        headerLabel: 'Source',
        align: TableCellAlignment.Left
      }
    },
    {
      id: 5,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <div
              data-testid={`workflow-list-row-action-button`}
              onClick={(e) => {
                e.stopPropagation()
                if (item.status !== LibraryStatus.failed) {
                  return
                }
                handleLibraryInstallRetry(item.id)
              }}
            >
              {libraryInstallRetryLoading &&
              libraryInstallRetryId === item.id ? (
                <ProgressCircle size={LoaderSize.Small} />
              ) : (
                <ReplayIcon
                  id='basic-button'
                  aria-controls={open ? 'basic-menu' : undefined}
                  aria-haspopup='true'
                  aria-expanded={open ? 'true' : undefined}
                  className={
                    item.status === LibraryStatus.failed
                      ? classes.retryIcon
                      : classes.disabledRetryIcon
                  }
                />
              )}
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: '',
        align: TableCellAlignment.Center
      }
    }
  ]
}
