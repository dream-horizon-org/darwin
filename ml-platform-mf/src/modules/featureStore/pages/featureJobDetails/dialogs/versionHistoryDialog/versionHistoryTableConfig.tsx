import {Chip} from '@mui/material'
import React from 'react'
import {alignSelf} from '../../../../../../components/dataList/dataList.type'
import {aliasTokens} from '../../../../../../theme.contants'

export const columnConfig = (classes) => [
  {
    id: 'version',
    label: 'Versions',
    rowSpan: 1,
    alignSelf: 'left' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72',
    jsx: (_, item) => <div>{`V ${item.version}`}</div>
  },
  {
    id: 'ownerEmail',
    label: 'Created By',
    rowSpan: 1,
    alignSelf: 'left' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72'
  },
  {
    id: 'createdAt',
    label: 'Created Date',
    rowSpan: 1,
    alignSelf: 'left' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72',
    jsx: (_, item) => <div>{new Date(item.createdDate).toDateString()}</div>
  },
  {
    id: 'status',
    label: 'Status',
    rowSpan: 1,
    alignSelf: 'center' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72',
    jsx: (_, item) => (
      <Chip
        label={item.status}
        className={classes.chip}
        style={{
          background:
            item.status === 'ACTIVE'
              ? aliasTokens.cta_success_background_color
              : aliasTokens.cta_error_background_color
        }}
      />
    )
  }
]
