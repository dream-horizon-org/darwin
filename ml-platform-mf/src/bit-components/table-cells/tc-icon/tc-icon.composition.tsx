import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {ActionableIconButtonVariants} from '../../icon-button/index'
import {Icons} from '../../icon/index'
import {TableCellSize} from '../tc-cell/index'
import {TcIcon} from './tc-icon'

export const BasicTcIcon = () => {
  const handleOnClick = () => {
    alert('Icon-Button is clicked')
  }
  return (
    <CompositionWrapper>
      <TcIcon
        size={TableCellSize.Large}
        leadingIcon={Icons.ICON_HIGHLIGHT_OFF}
        onClick={handleOnClick}
        actionableVariants={ActionableIconButtonVariants.ACTIONABLE_PRIMARY}
      />
    </CompositionWrapper>
  )
}

BasicTcIcon.compositionName = 'Tc Icon'
