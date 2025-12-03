import {Chip} from '@mui/material'
import {format} from 'date-fns'
import React from 'react'
import {alignSelf} from '../../../../../components/dataList/dataList.type'
import {SCHEDULE_JOB_BG_COLOR} from '../constants'

export const columnConfig = (classes) => [
  {
    id: 'createdAt',
    label: 'Timestamp',
    alignSelf: 'left' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72',
    jsx: (_, item) => (
      <div>{format(new Date(item.createdAt), 'dd MMM yyyy, hh:mm a')}</div>
    )
  },
  {
    id: 'jobStatusRun',
    label: 'Status',
    alignSelf: 'center' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72',
    jsx: (_, item) => (
      <Chip
        label={item.jobStatusRun.toUpperCase()}
        className={classes.chip}
        style={{background: SCHEDULE_JOB_BG_COLOR[item.jobStatusRun]}}
      />
    )
  },
  {
    id: 'yarnUrl',
    label: 'Link',
    alignSelf: 'left' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72',
    jsx: (_, item) =>
      item.yarnUrl ? (
        <a href={item.yarnUrl} className={classes.link} target='_blank'>
          {item.yarnUrl}
        </a>
      ) : (
        '-'
      )
  },
  {
    id: 'comment',
    label: 'Error Stack Trace',
    alignSelf: 'left' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72'
  }
]
