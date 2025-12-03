import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import React from 'react'
import {TableCellSize} from '../table-cells/tc-cell/index'
import {Datatable} from './datatable'
import {ColumnConfig} from './datatable.type'
import {childColSpan} from './utils'
export type DatatableChildBodyProps<T, K> = {
  expandRow: boolean
  row: T
  childColumnConfig?: Array<ColumnConfig<K>>
  childTableKey?: string
  columnConfig: Array<ColumnConfig<T>>
  enableSelection?: boolean
  indexKeyName: string
  theme?: string
}

export default function DatatableChildBody<T, K>(
  props: DatatableChildBodyProps<T, K>
) {
  const {
    childColumnConfig,
    indexKeyName,
    columnConfig,
    enableSelection,
    childTableKey,
    expandRow,
    row,
    theme
  } = props
  return (
    <TableRow>
      <TableCell colSpan={childColSpan(columnConfig, enableSelection)}>
        <Collapse in={expandRow} timeout='auto' unmountOnExit>
          <Box sx={{margin: 1}}>
            {childColumnConfig && (
              <Datatable
                theme={theme}
                size={TableCellSize.Large}
                enablePagination={false}
                enableSelection={false}
                indexKeyName={indexKeyName}
                columnConfig={childColumnConfig}
                data={childTableKey && row[childTableKey]}
              />
            )}
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  )
}
