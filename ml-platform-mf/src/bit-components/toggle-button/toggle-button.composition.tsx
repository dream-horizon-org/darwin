import React, {useState} from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {ToggleButtonType, ToggleButtonVariantsList} from './constants'
import {ToggleButton} from './toggle-button'
import {mockListIconButton, mockListTextButton} from './utils'

export const PrimaryToggleButton = () => {
  const list = [
    {value: 'one', text: 'one', disabled: true},
    {value: 'two', text: 'two', testIdentifier: 'button-1'}
  ]
  const [currentValue, setCurrentValue] = useState('')
  const handleChange = (e, b) => {
    setCurrentValue(b)
  }

  return (
    <CompositionWrapper
      lists={{variant: ToggleButtonVariantsList}}
      component={(props) => {
        return (
          <ToggleButton
            {...props}
            list={list}
            handleChange={handleChange}
            currentValue={currentValue}
            buttonType={ToggleButtonType.STRING}
          />
        )
      }}
    ></CompositionWrapper>
  )
}

PrimaryToggleButton.compositionName = 'Toggle Button + Disabled'

export const StringToggleButton = () => {
  const [currentValue, setCurrentValue] = useState('')
  const handleChange = (e, b) => {
    setCurrentValue(b)
  }

  return (
    <CompositionWrapper
      lists={{variant: ToggleButtonVariantsList}}
      component={(props) => (
        <ToggleButton
          {...props}
          list={mockListTextButton}
          handleChange={handleChange}
          buttonType={ToggleButtonType.STRING}
          currentValue={currentValue}
        />
      )}
    />
  )
}
StringToggleButton.compositionName = 'Toggle Button + String'

export const IconToggleButton = () => {
  const [currentValue, setCurrentValue] = useState('')
  const handleChange = (e, b) => {
    setCurrentValue(b)
  }

  return (
    <CompositionWrapper
      lists={{variant: ToggleButtonVariantsList}}
      component={(props) => (
        <ToggleButton
          {...props}
          list={mockListIconButton}
          handleChange={handleChange}
          buttonType={ToggleButtonType.ICON}
          currentValue={currentValue}
        />
      )}
    />
  )
}

IconToggleButton.compositionName = 'Toggle Button + Icon'
