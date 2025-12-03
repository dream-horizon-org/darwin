import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {Icons} from '../icon/index'
import {Chip} from './chip'
import {ChipSizes, ChipSizesList, ChipStateList} from './constants'
import {mockAvatarLInk} from './utils'

export const BasicChip = () => {
  return (
    <CompositionWrapper lists={{disabled: ChipStateList, size: ChipSizesList}}>
      <Chip label='Label' onClick={() => {}} />
    </CompositionWrapper>
  )
}
BasicChip.compositionName = 'Chip'

export const SelectedChip = () => {
  return (
    <CompositionWrapper lists={{disabled: ChipStateList, size: ChipSizesList}}>
      <Chip selected={true} label='Label' onClick={() => {}} />
    </CompositionWrapper>
  )
}

export const LeadingIcon = () => {
  return (
    <CompositionWrapper lists={{disabled: ChipStateList, size: ChipSizesList}}>
      <Chip
        leadingIcon={Icons.ICON_ADD_OUTLINED}
        label='Label'
        onClick={() => {}}
      />
    </CompositionWrapper>
  )
}

export const DeleteOption = () => {
  return (
    <CompositionWrapper lists={{disabled: ChipStateList, size: ChipSizesList}}>
      <Chip
        onDelete={() => {}}
        leadingIcon={Icons.ICON_ADD_OUTLINED}
        label='Label'
        onClick={() => {}}
      />
    </CompositionWrapper>
  )
}
export const TrailingIcon = () => {
  return (
    <CompositionWrapper lists={{disabled: ChipStateList, size: ChipSizesList}}>
      <Chip
        size={ChipSizes.Medium}
        tarilingIcon={Icons.ICON_EXPAND_MORE}
        onClick={() => {
          alert('Clicked')
        }}
        label='Label'
      />
    </CompositionWrapper>
  )
}

export const Avatar = () => {
  return (
    <CompositionWrapper lists={{disabled: ChipStateList, size: ChipSizesList}}>
      <Chip size={ChipSizes.Medium} avatarSrc={mockAvatarLInk} label='Label' />
    </CompositionWrapper>
  )
}
