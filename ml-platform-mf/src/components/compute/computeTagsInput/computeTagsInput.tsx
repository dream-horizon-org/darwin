import React, {useEffect, useState} from 'react'
import {Dropdown} from '../../../bit-components/dropdown/index'

interface IProps {
  tags?: Array<any>
  updateTags: (tags: Array<string>) => void
  disabled?: boolean
  menuList?: Array<{label: string; id: string}>
  label?: string
  canAddNewOption?: boolean
}

export const BasicDropdownWithAddNewOption = (props: IProps) => {
  const {
    tags = [],
    updateTags,
    disabled,
    menuList,
    label,
    canAddNewOption = true
  } = props

  useEffect(() => {
    const defaultTags = tags.map((t, idx) => ({label: t, id: idx + 1}))
    setNames(defaultTags)
    setDropValue(defaultTags)
  }, [tags])

  const [names, setNames] = useState([])

  const [dropValue, setDropValue] = useState<
    Array<{label: string; id: number}>
  >([])

  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value: Array<{label: string; id: number}>
  ) => {
    setDropValue(value.filter((v) => v && v.label.trim()))
    // updateTags(value.map((v) => v.label))
  }

  const handleEnterKeyPressed = (value: {label: string; id: number}) => {
    if (!value || !value.label.trim()) return
    setNames((prevNames) => [value, ...prevNames])
    setDropValue((prevDropValue) => [...prevDropValue, value])
    // return;
    // updateTags([...dropValue, value].map(v => v.label))
  }
  const backgroundStyle = {
    maxWidth: '500px'
  }

  return (
    <div style={backgroundStyle}>
      <Dropdown
        fieldVariant='withOutline'
        onChange={changeValue}
        dropDownValue={dropValue}
        isMultipleSelection={true}
        menuLists={menuList || []}
        label={label || 'Add Tags'}
        canAddNewOption={canAddNewOption}
        handleEnterKey={handleEnterKeyPressed}
        onBlur={() => updateTags(dropValue.map((d) => d.label))}
        disabled={disabled}
      />
    </div>
  )
}
