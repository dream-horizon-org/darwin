import {IColumnConfig} from '../../types/columnConfig.type'

export const getExpansionList = (
  data,
  expandAll: boolean,
  defaultList = {},
  indexKeyName
) => {
  if (expandAll) {
    const expansionList = {}
    data.map((item) => {
      expansionList[item[indexKeyName]] = true
    })
    return expansionList
  } else {
    return defaultList
  }
}

export const getDataListColumnLength = (columnConfig: Array<IColumnConfig>) => {
  const children = columnConfig.filter((item) => item.children !== undefined)
  let childrenLength: number
  if (children.length > 0) {
    childrenLength = children.reduce(
      (previousValue: number, currentValue: IColumnConfig) => {
        return previousValue + currentValue.children.length
      },
      0
    )
    return childrenLength + columnConfig.length
  }
  return columnConfig.length + 1
}
