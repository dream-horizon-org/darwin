import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'

import styles from './indexJSS'

export interface IRowData {
  entityName: string
  joinKeys: Array<string>
  type: Array<string>
  description: string
}

interface HeadCell {
  disablePadding: boolean
  id: keyof IRowData
  label: string
  numeric: boolean
}

const headCells: readonly HeadCell[] = [
  {
    id: 'entityName',
    numeric: false,
    disablePadding: false,
    label: 'Entity Name'
  },
  {
    id: 'joinKeys',
    numeric: false,
    disablePadding: false,
    label: 'Join Keys'
  },
  {
    id: 'type',
    numeric: false,
    disablePadding: false,
    label: 'Type'
  },
  {
    id: 'description',
    numeric: false,
    disablePadding: false,
    label: 'Description'
  }
]

interface EnhancedTableProps extends WithStyles<typeof styles> {
  rowCount: number
}

const EnhancedTableHead = (props: EnhancedTableProps) => {
  const {classes} = props

  return (
    <TableHead
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}
    >
      <TableRow className={classes.headRow}>
        {headCells
          .filter((headCell) => !headCell.numeric)
          .map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'center' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              rowSpan={2}
              className={classes.customCell}
            >
              {headCell.label}
            </TableCell>
          ))}
      </TableRow>
      <TableRow className={classes.headRow}>
        {headCells
          .filter((headCell) => headCell.numeric)
          .map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'center' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              className={classes.customCell}
            >
              {headCell.label}
            </TableCell>
          ))}
      </TableRow>
    </TableHead>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(EnhancedTableHead)

export default styleComponent
