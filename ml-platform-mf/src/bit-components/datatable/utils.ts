import {enableChildTableSpan, enableSelectionSpan} from './constants'
export const hexToRGB = (hex: string, opacity: number) => {
  const hexRegex = new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')
  const isValidHex = hexRegex.test(hex)
  if (isValidHex) {
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16)

    if (opacity) {
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    } else {
      return `rgba(${r}, ${g}, ${b})`
    }
  }
  return hex
}

const getDefaultData = (defaultSelection: number | Array<number>) => {
  if (defaultSelection) {
    if (Array.isArray(defaultSelection)) {
      return [...defaultSelection]
    } else {
      return [defaultSelection]
    }
  }
  return []
}

export const resetSelectedState = (
  defaultSelection: number | Array<number>,
  setSelectedRow: React.Dispatch<React.SetStateAction<number[]>>
) => {
  setSelectedRow(getDefaultData(defaultSelection))
}

const updateSelectedState = <T>(
  disableItems: Array<number>,
  data: Array<T>,
  indexKeyName: string,
  setSelectedRow: React.Dispatch<React.SetStateAction<number[]>>
) => {
  const filteredData =
    disableItems && Array.isArray(disableItems)
      ? data.filter(
          (row, index) => !disableItems.includes(row[indexKeyName] || index)
        )
      : data
  setSelectedRow(filteredData.map((row, index) => row[indexKeyName] || index))
}

export const handleSelectAll = <T>(
  event: React.ChangeEvent<HTMLInputElement>,
  disableItems: Array<number>,
  data: Array<T>,
  indexKeyName: string,
  setSelectedRow: React.Dispatch<React.SetStateAction<number[]>>,
  defaultSelection: number | Array<number>
) => {
  if (event.target.checked) {
    updateSelectedState(disableItems, data, indexKeyName, setSelectedRow)
    return
  }
  resetSelectedState(defaultSelection, setSelectedRow)
}

export const handleRadioSelect = <T>(
  id: number,
  setSelectedRow: React.Dispatch<React.SetStateAction<number[]>>,
  onRowClick?: (row: T) => void,
  row?: T
) => {
  setSelectedRow([id])
  onRowClick?.(row as T)
}

export const isSelected = (
  id: number,
  enableSelection: boolean,
  defaultSelection: number | Array<number>,
  selectedRow: number[]
): boolean => {
  if (enableSelection) {
    if (Array.isArray(defaultSelection) && selectedRow.length === 0) {
      return defaultSelection.includes(id)
    } else {
      return selectedRow && selectedRow.indexOf(id) !== -1
    }
  } else {
    return false
  }
}

export const isLastEdited = <T>(
  row: T,
  lastEditedRowKey: string | null | undefined,
  lastEditedRowKeyValue: string | number | boolean | null | undefined
): boolean => {
  if (lastEditedRowKey && lastEditedRowKeyValue)
    return row[lastEditedRowKey] === lastEditedRowKeyValue ? true : false
  return false
}

export const createSortHandler =
  (property, order, onRequestSort) => (event) => {
    onRequestSort(event, property, order)
  }

export const handleSelect = <T>(
  id: number,
  selectedRows: number[],
  setSelectedRow: React.Dispatch<React.SetStateAction<number[]>>,
  onRowClick?: (row: T) => void,
  row?: T
) => {
  const selectedIndex: number = selectedRows.indexOf(id)
  let newSelected: number[] = []

  if (selectedIndex === -1) {
    newSelected = newSelected.concat(selectedRows, id)
  } else {
    newSelected = newSelected.concat(
      selectedRows.slice(0, selectedIndex),
      selectedRows.slice(selectedIndex + 1)
    )
  }
  setSelectedRow(newSelected)
  onRowClick?.(row as T)
}

export const childColSpan = (
  columnConfig,
  enableSelection?: boolean
): number => {
  if (enableSelection)
    return columnConfig.length + enableChildTableSpan + enableSelectionSpan
  else return columnConfig.length + enableChildTableSpan
}
