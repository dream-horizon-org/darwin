import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {Icons} from '../icon/index'
import {IconSizetsList, IconStateList, IconVariantsList} from './constants'
import {IconElement} from './icon-element'
import {renderIcon} from './utils'

export const PrimaryIconSmallElement = () => {
  renderIcon()
  return (
    <CompositionWrapper
      lists={{
        size: IconSizetsList,
        severity: IconVariantsList,
        disabled: IconStateList
      }}
    >
      <IconElement
        dataTestId={'primary-small'}
        leadingIcon={Icons.ICON_AC_UNIT}
      />
    </CompositionWrapper>
  )
}
PrimaryIconSmallElement.compositionName = 'Icon Element'
