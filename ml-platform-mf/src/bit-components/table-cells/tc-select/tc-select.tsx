import React from 'react'
import {Checkbox} from '../../checkbox/index'
import {
  handleRadioSelect,
  handleSelect,
  isSelected
} from '../../datatable/index'
import {Radio} from '../../radio/index'
import {TableCellType, TcCell} from '../tc-cell/index'
export type TcSelectProps<T> = {
  type?: TableCellType
  singleSelection?: boolean
  row: T
  selectedRow: number[]
  setSelectedRow: React.Dispatch<React.SetStateAction<number[]>>
  indexKeyName: string
  enableSelection?: boolean
  allRowSelected?: boolean
  disableSelected?: boolean
  defaultSelection?: number | Array<number>
  disableItems?: Array<number>
  theme?: string
}

export function TcSelect<T>({
  type,
  allRowSelected,
  disableItems,
  disableSelected,
  defaultSelection,
  enableSelection,
  singleSelection,
  row,
  setSelectedRow,
  selectedRow,
  indexKeyName,
  theme
}: TcSelectProps<T>) {
  const isDisabledRow =
    (disableSelected &&
      Array.isArray(defaultSelection) &&
      defaultSelection.includes(row[indexKeyName])) ||
    allRowSelected ||
    (disableItems &&
      Array.isArray(disableItems) &&
      disableItems.includes(row[indexKeyName]))
  const enableSelections = enableSelection ? enableSelection : false
  const defaultSelections = defaultSelection ? defaultSelection : []
  return (
    <TcCell type={type} theme={theme}>
      {singleSelection ? (
        <Radio
          theme={theme}
          checked={isSelected(
            row[indexKeyName],
            enableSelections,
            defaultSelections,
            selectedRow
          )}
          value={indexKeyName}
          onChange={() => handleRadioSelect(row[indexKeyName], setSelectedRow)}
        />
      ) : (
        <Checkbox
          theme={theme}
          disabled={isDisabledRow}
          checked={isSelected(
            row[indexKeyName],
            enableSelections,
            defaultSelections,
            selectedRow
          )}
          onChange={() => {
            handleSelect(row[indexKeyName], selectedRow, setSelectedRow)
          }}
        />
      )}
    </TcCell>
  )
}

TcSelect.defaultProps = {
  theme: 'dark'
}
