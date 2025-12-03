import React, {useEffect, useMemo, useState} from 'react'
import {Dropdown} from '../../bit-components/dropdown/index'

interface DropdownOptions<T> {
  label: string
  value: T
}

interface IProps<T> {
  value: T[]
  options: DropdownOptions<T>[]
  onChange: (value: T[]) => void
  disabled?: boolean
  label?: string
  dataTestid?: string
}

export const AutoCompleteWithAddOptions = <T extends any>(props: IProps<T>) => {
  const {value, options, onChange, disabled = false, label, dataTestid} = props

  const handleOnChange = (values: DropdownOptions<T>[]) => {
    const newValues = values.map((value) => value.value)
    onChange(newValues)
  }

  const dropdownValues = useMemo(() => {
    return options.filter((option) => {
      return value.includes(option.value)
    })
  }, [value, options])

  const backgroundStyle = {
    maxWidth: '500px'
  }

  return (
    <div style={backgroundStyle}>
      <Dropdown
        onChange={(e, values) => handleOnChange(values)}
        dropDownValue={dropdownValues}
        isMultipleSelection={true}
        menuLists={options || []}
        label={label || 'Add Tags'}
        disabled={disabled}
        dataTestId={dataTestid}
        fieldVariant='withOutline'
      />
    </div>
  )
}
