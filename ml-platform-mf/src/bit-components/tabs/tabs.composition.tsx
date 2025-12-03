import React, {useState} from 'react'
import {CompositionWrapper} from '../composition-wrapper/composition-wrapper'
import {Tabs} from './tabs'
import {basicTab, groupOfTabs, tabWithIcon} from './utils'

export const BasicTabs = () => {
  const [value, setValue] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <CompositionWrapper>
      <Tabs onChange={handleChange} value={value} tabLabels={basicTab} />
    </CompositionWrapper>
  )
}

BasicTabs.compositionName = 'Tabs'

export const GroupOfTabs = () => {
  const [value, setValue] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <CompositionWrapper>
      <Tabs onChange={handleChange} value={value} tabLabels={groupOfTabs} />
    </CompositionWrapper>
  )
}

export const TabWithIcon = () => {
  const [value, setValue] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <CompositionWrapper>
      <Tabs onChange={handleChange} value={value} tabLabels={tabWithIcon} />
    </CompositionWrapper>
  )
}
