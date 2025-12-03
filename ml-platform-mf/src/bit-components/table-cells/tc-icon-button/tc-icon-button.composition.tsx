import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {
  ActionableIconButtonSizes,
  ActionableIconButtonVariants,
  IconButtonSizes
} from '../../icon-button/index'
import {Icons} from '../../icon/index'
import {ToolTipPlacement} from '../../tooltip/index'
import {TableCellSize, TableCellStateList} from '../tc-cell/index'
import {TcIconButton} from './tc-icon-button'

export const BasicTcIconButton = () => {
  const handleOnClick = () => {
    alert('Icon-Button is clicked')
  }

  return (
    <CompositionWrapper lists={{disabled: TableCellStateList}}>
      <TcIconButton
        size={TableCellSize.Large}
        leadingIcon={Icons.ICON_HIGHLIGHT_OFF}
        onClick={handleOnClick}
        actionableVariants={ActionableIconButtonVariants.ACTIONABLE_TERTIARY}
        actionableSizes={ActionableIconButtonSizes.LARGE}
        buttonSize={IconButtonSizes.LARGE}
        actionable={true}
        isSelected={true}
      />
    </CompositionWrapper>
  )
}

export const BasicTcIconButtonWithToolTip = () => {
  const handleOnClick = () => {
    alert('Icon-Button is clicked')
  }

  return (
    <CompositionWrapper>
      <TcIconButton
        size={TableCellSize.Large}
        leadingIcon={Icons.ICON_HIGHLIGHT_OFF}
        onClick={handleOnClick}
        actionableVariants={ActionableIconButtonVariants.ACTIONABLE_TERTIARY}
        actionableSizes={ActionableIconButtonSizes.LARGE}
        buttonSize={IconButtonSizes.LARGE}
        actionable={true}
        isSelected={true}
        toolTipText={'Trail'}
        showToolTip={true}
        toolTipPlacement={ToolTipPlacement.Bottom}
      />
    </CompositionWrapper>
  )
}
