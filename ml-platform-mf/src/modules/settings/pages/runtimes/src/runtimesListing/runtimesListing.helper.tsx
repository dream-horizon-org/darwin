import {ClassNameMap} from '@mui/styles'
import React from 'react'
import {TableCells} from '../../../../../../bit-components/datatable/constants'
import {ColumnConfig} from '../../../../../../bit-components/datatable/datatable.type'
import {TableCellAlignment} from '../../../../../../bit-components/table-cells/tc-cell/index'
import {RuntimeStatus} from '../../../../../../gql-enums/runtime-status.enum'
import {toTitleCase} from '../../../../../../utils/helper'
import {GetRuntimesInformation} from '../../../../graphqlApi/runtimes/getRunetimesInformation'
import {RuntimeListingTableData} from '../../../../interfaces/runtimes'

const getDateString = (date: string) => {
  const dateObj = new Date(date)
  const dateString = dateObj.toLocaleDateString()
  const timeString = dateObj.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
    timeZone: 'IST'
  })

  const formattedTimeString = timeString.replace('am', 'AM').replace('pm', 'PM')
  return `${dateString}, ${formattedTimeString}`
}

export const transformData = (
  data: GetRuntimesInformation
): RuntimeListingTableData[] => {
  const tableData: RuntimeListingTableData[] = []
  data?.getRuntimesInformation?.data?.forEach((runtime) => {
    tableData.push({
      addedBy: runtime.added_by,
      dateAdded: runtime.date_added,
      runtimeName: runtime.name,
      status: runtime.status
    })
  })

  return tableData
}

const getIndicatorColor = (status: RuntimeStatus) => {
  switch (status) {
    case RuntimeStatus.ACTIVE:
      return '#11A93C'
    case RuntimeStatus.CREATING:
      return '#A780E9'
    case RuntimeStatus.FAILED:
      return '#FF4281'
    default:
      return '#FFFFFF'
  }
}

export const getColumnConfig = (
  classes: ClassNameMap
): ColumnConfig<RuntimeListingTableData>[] => {
  const columnConfig: ColumnConfig<RuntimeListingTableData>[] = [
    {
      id: 1,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <div className={classes.columnContainer}>
              <p data-test-id='byor-listing-runtime-name'>{item.runtimeName}</p>
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: 'Name',
        align: TableCellAlignment.Left
      }
    },
    {
      id: 2,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <div className={classes.columnContainer}>
              <p>{getDateString(item.dateAdded)}</p>
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: 'Date Added',
        align: TableCellAlignment.Left
      }
    },
    {
      id: 3,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <div className={classes.columnContainer}>
              <p>{item.addedBy}</p>
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: 'Added By',
        align: TableCellAlignment.Left
      }
    },
    {
      id: 4,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <div className={classes.columnContainer}>
              <div
                className={classes.statusIndicator}
                style={{
                  backgroundColor: getIndicatorColor(
                    item.status as RuntimeStatus
                  )
                }}
              ></div>
              <p>{toTitleCase(item.status)}</p>
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: 'Status',
        align: TableCellAlignment.Left
      }
    }
  ]
  return columnConfig
}
