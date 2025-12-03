import {alignSelf} from '../../../../../components/dataList/dataList.type'

export const columnConfig = (classes) => [
  {
    id: 'title',
    label: 'Title',
    rowSpan: 1,
    alignSelf: 'left' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72'
  },
  {
    id: 'type',
    label: 'Type',
    rowSpan: 1,
    alignSelf: 'left' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72'
  },
  {
    id: 'key',
    label: 'Primary Key',
    rowSpan: 1,
    alignSelf: 'center' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72'
  }
]
