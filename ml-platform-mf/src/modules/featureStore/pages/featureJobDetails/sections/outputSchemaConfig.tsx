import React from 'react'
import {alignSelf} from '../../../../../components/dataList/dataList.type'

const getTagsJSX = (tags: string[]) => {
  return tags.map((tag, index) =>
    index === tags.length - 1 ? <span>#{tag}</span> : <span>#{tag}, </span>
  )
}

export const columnConfig = () => [
  {
    id: 'name',
    label: 'Title',
    alignSelf: 'left' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72',
    jsx: (_, item) => <div>{item.name}</div>
  },
  {
    id: 'type',
    label: 'Type',
    alignSelf: 'left' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72',
    jsx: (_, item) => <div>{item.type}</div>
  },
  {
    id: 'tags',
    label: 'Tags',
    alignSelf: 'left' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72',
    jsx: (_, item) => {
      return getTagsJSX(item.tags)
    }
  },
  {
    id: 'description',
    label: 'Description',
    alignSelf: 'left' as alignSelf,
    headerCellClass: 'tableHeaderCellBold',
    dataCellClass: 'tableRowHeight72',
    jsx: (_, item) => <div>{item.description}</div>
  }
]
