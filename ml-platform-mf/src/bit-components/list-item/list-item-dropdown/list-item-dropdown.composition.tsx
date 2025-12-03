import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {Icons} from '../../icon/index'
import {Tags} from '../../tags/tags/index'
import {IconPosition} from './constants'
import {ListItemDropdown} from './list-item-dropdown'
import {iconMockFun, mockAvatarLInk} from './utils'

type BasicListItemProps = {
  onClick: () => void
}
export const BasicListItemDropdown = ({onClick}: BasicListItemProps) => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItemDropdown
        text='Dropdown Item'
        onClick={onClick}
        testIdentifier='testIdentifier'
      />
    </CompositionWrapper>
  )
}

export const SelectedBasicListItemDropdown = ({
  onClick
}: BasicListItemProps) => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItemDropdown
        text='Dropdown Item'
        onClick={onClick}
        isSelected={true}
        testIdentifier='testIdentifier'
      />
    </CompositionWrapper>
  )
}

export const BasicListItemDropdownWithIcon = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItemDropdown text='Dropdown Item' icon={Icons.ICON_ACCESS_ALARM} />
    </CompositionWrapper>
  )
}
export const SelectedListItemDropdown = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItemDropdown
        text='Dropdown Item'
        isSelected={true}
        icon={Icons.ICON_ACCESS_ALARM}
        iconPosition={IconPosition.LEFT}
      />
    </CompositionWrapper>
  )
}

export const ListItemDropdownSecondary = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItemDropdown text='Dropdown Item' secondaryText={'Secondary Text'} />
    </CompositionWrapper>
  )
}
export const SelectedListItemDropdownSecondary = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItemDropdown
        text='Dropdown Item'
        isSelected={true}
        secondaryText={'Secondary Text'}
      />
    </CompositionWrapper>
  )
}
export const ListItemDropdownWithAvatar = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItemDropdown
        text='Dropdown Item'
        icon={Icons.ICON_ACCESS_ALARM}
        iconPosition={IconPosition.LEFT}
        secondaryText={'Secondary Text'}
        avatarSrc={mockAvatarLInk}
      />
    </CompositionWrapper>
  )
}

export const SelectedListItemDropdownWithAvatar = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItemDropdown
        text='Dropdown Item'
        isSelected={true}
        icon={Icons.ICON_ACCESS_ALARM}
        iconPosition={IconPosition.LEFT}
        secondaryText={'Secondary Text'}
        avatarSrc={mockAvatarLInk}
      />
    </CompositionWrapper>
  )
}
export const ListItemDropdownWithRightAvatar = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItemDropdown
        text='Dropdown Item'
        icon={Icons.ICON_ACCESS_ALARM}
        secondaryText={'Secondary Text'}
        avatarSrc={mockAvatarLInk}
      />
    </CompositionWrapper>
  )
}

export const SelectedListItemDropdownWithRightAvatar = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItemDropdown
        text='Dropdown Item'
        isSelected={true}
        icon={Icons.ICON_ACCESS_ALARM}
        secondaryText={'Secondary Text'}
        avatarSrc={mockAvatarLInk}
      />
    </CompositionWrapper>
  )
}
export const ListItemDropdownWithCheckBox = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItemDropdown
        text='Dropdown Item'
        renderCheckBox={true}
        iconPosition={IconPosition.LEFT}
        isSelectedCheckBox={false}
      />
    </CompositionWrapper>
  )
}

export const BasicListItemDropdownWithIconAndTags = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItemDropdown text='Dropdown Item' icon={Icons.ICON_ACCESS_ALARM}>
        <div style={{padding: '0px 0px 0px 10px'}}>
          <Tags label='New Tag'></Tags>
        </div>
      </ListItemDropdown>
    </CompositionWrapper>
  )
}
