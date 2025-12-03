import {ClassNameMap} from '@mui/styles'
import React from 'react'
import {TableCells} from '../../../../../bit-components/datatable/constants'
import {ColumnConfig} from '../../../../../bit-components/datatable/index'
import {TableCellAlignment} from '../../../../../bit-components/table-cells/tc-cell/index'
import {SelectionOnGetAllCodespaces} from '../../../graphQL/queries/getAllCodespaces'
export type TableData = SelectionOnGetAllCodespaces['data'][0]

export const getColumnConfig = (
  classes: ClassNameMap
): ColumnConfig<TableData>[] => {
  return [
    {
      id: 1,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: <p className={classes.tableTextBlue}>{item.codespace.name}</p>
        }
      },
      headerProps: {
        align: TableCellAlignment.Left,
        headerLabel: 'Codespace'
      }
    },
    {
      id: 2,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: <p className={classes.tableText}>{item.project.name}</p>
        }
      },
      headerProps: {
        align: TableCellAlignment.Left,
        headerLabel: 'Project'
      }
    },
    {
      id: 3,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <p className={classes.tableText}>
              {item.cores.consumed} / {item.cores.total}
            </p>
          )
        }
      },
      headerProps: {
        align: TableCellAlignment.Left,
        headerLabel: 'Core'
      }
    },
    {
      id: 4,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: (
            <p className={classes.tableText}>
              {item.memory.consumed} / {item.memory.total}
            </p>
          )
        }
      },
      headerProps: {
        align: TableCellAlignment.Left,
        headerLabel: 'Memory'
      }
    },
    {
      id: 5,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: <p className={classes.tableText}>{item.attached_since}</p>
        }
      },
      headerProps: {
        align: TableCellAlignment.Left,
        headerLabel: 'Attached From'
      }
    },
    {
      id: 1,
      columnType: TableCells.TcCustomJSX,
      componentProps(item) {
        return {
          jsx: <p className={classes.tableText}>{item.user}</p>
        }
      },
      headerProps: {
        align: TableCellAlignment.Left,
        headerLabel: 'User'
      }
    }
  ]
}
