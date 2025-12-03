import React, {useState} from 'react'
import {Icons} from '../icon/index'
import {
  ActionableIconButtonSizes,
  ActionableIconButtonSizesList,
  ActionableIconButtonVariants,
  ActionableIconButtonVariantsList,
  IconButtonSizesList,
  IconButtonStateList,
  IconButtonVariantList
} from './constants'
import {IconButton} from './icon-button'

import {CompositionWrapper} from '../composition-wrapper/index'

export const PrimaryIconButton = () => {
  const handleOnClick = () => {
    alert('Icon-Button is clicked')
  }

  return (
    <CompositionWrapper
      lists={{
        size: IconButtonSizesList,
        disabled: IconButtonStateList,
        variant: IconButtonVariantList
      }}
    >
      <IconButton
        leadingIcon={Icons.ICON_HIGHLIGHT_OFF}
        onClick={handleOnClick}
      />
    </CompositionWrapper>
  )
}
PrimaryIconButton.compositionName = 'Icon button'

/* Note :- Actionable icon buttons composition below . */

export const ActionableIconButton = () => {
  const [isActive, setIsActive] = useState(false)
  const handleOnClick = () => {
    alert('Icon-Button is clicked')
    setIsActive(!isActive)
  }

  return (
    <CompositionWrapper
      lists={{
        actionableSizes: ActionableIconButtonSizesList,
        actionableVariants: ActionableIconButtonVariantsList,
        disabled: IconButtonStateList
      }}
    >
      <IconButton
        leadingIcon={Icons.ICON_HIGHLIGHT_OFF}
        onClick={handleOnClick}
        actionableVariants={ActionableIconButtonVariants.ACTIONABLE_PRIMARY}
        actionableSizes={ActionableIconButtonSizes.LARGE}
        actionable={true}
        isActive={isActive}
      />
    </CompositionWrapper>
  )
}
