import React, {useState} from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {ToggleButtonType, ToggleButtonVariants} from '../../toggle-button/index'
import {TableCellSize} from '../tc-cell/index'
import {TcToggleButton} from './tc-toggle-button'

export const BasicTcToggleButton = () => {
  const list = [
    {value: 'one', text: 'one', disabled: true},
    {value: 'two', text: 'two', testIdentifier: 'button-1'}
  ]
  const [currentValue, setCurrentValue] = useState('')
  const handleChange = (e, b) => {
    setCurrentValue(b)
  }

  return (
    <CompositionWrapper>
      <TcToggleButton
        size={TableCellSize.Medium}
        list={list}
        handleChange={handleChange}
        buttonType={ToggleButtonType.STRING}
        currentValue={currentValue}
        variant={ToggleButtonVariants.PRIMARY}
      />
    </CompositionWrapper>
  )
}

BasicTcToggleButton.compositionName = 'Tc Toggle Button'
