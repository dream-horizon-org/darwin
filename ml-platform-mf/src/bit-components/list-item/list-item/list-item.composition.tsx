import ListItemText from '@mui/material/ListItemText'
import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {Icons} from '../../icon/index'
import {ListItem} from './list-item'
import {iconMockFun, mockAvatarLInk} from './utils'

export const ListItemChildren = () => {
  iconMockFun()
  const children = () => {
    return <ListItemText style={{color: '#d9d9d9'}}>Title</ListItemText>
  }

  return (
    <div>
      <ListItem>{children()}</ListItem>
    </div>
  )
}
export const BasicListItem = () => {
  iconMockFun()

  return (
    <CompositionWrapper>
      <ListItem text={'Title Name'} />
    </CompositionWrapper>
  )
}

// Default list items
export const DefaultListItem = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem text={'Title Name'} avatarSrc={mockAvatarLInk} />
    </CompositionWrapper>
  )
}

export const SelectedDefaultListItem = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        avatarSrc={mockAvatarLInk}
        isSelected={true}
      />
    </CompositionWrapper>
  )
}
export const DisabledDefaultListItem = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem text={'Title Name'} avatarSrc={mockAvatarLInk} disabled />
    </CompositionWrapper>
  )
}

export const SubtitleListItem = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        secondaryText={'Subtitle'}
        avatarSrc={mockAvatarLInk}
      />
    </CompositionWrapper>
  )
}
export const AvatarTextSubtitleListItem = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        secondaryText={'Subtitle'}
        avatarText={'Hello'}
      />
    </CompositionWrapper>
  )
}

export const SelectedSubtitleListItem = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        secondaryText={'Subtitle'}
        avatarSrc={mockAvatarLInk}
        isSelected
      />
    </CompositionWrapper>
  )
}
export const DisabledSubtitleListItem = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        secondaryText={'Subtitle'}
        avatarSrc={mockAvatarLInk}
        disabled
      />
    </CompositionWrapper>
  )
}
export const ActionDefaultListItem = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        avatarSrc={mockAvatarLInk}
        buttonText={'Button'}
      />
    </CompositionWrapper>
  )
}

export const ActionDisabledListItem = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        avatarSrc={mockAvatarLInk}
        buttonText={'Button'}
        disabled
      />
    </CompositionWrapper>
  )
}
export const ActionSelectedListItem = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        avatarSrc={mockAvatarLInk}
        buttonText={'Button'}
        isSelected
      />
    </CompositionWrapper>
  )
}
export const ActionListItem = () => {
  iconMockFun()

  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        secondaryText={'Subtitle'}
        avatarSrc={mockAvatarLInk}
        buttonText={'Button'}
      />
    </CompositionWrapper>
  )
}

export const SelectedActionListItem = () => {
  iconMockFun()

  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        secondaryText={'Subtitle'}
        avatarSrc={mockAvatarLInk}
        buttonText={'Button'}
        isSelected
      />
    </CompositionWrapper>
  )
}
export const DisabledActionListItem = () => {
  iconMockFun()

  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        secondaryText={'Subtitle'}
        avatarSrc={mockAvatarLInk}
        buttonText={'Button'}
        disabled
      />
    </CompositionWrapper>
  )
}

export const IconListItem = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem text={'Title Name'} icon={Icons.ICON_ADD} />
    </CompositionWrapper>
  )
}

export const IconListItemWithSubtitle = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        secondaryText={'Subtitle'}
        icon={Icons.ICON_ADD}
      />
    </CompositionWrapper>
  )
}

export const IconActionListItem = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        icon={Icons.ICON_AIRPLANEMODE_ACTIVE}
        buttonText={'Button'}
      />
    </CompositionWrapper>
  )
}
export const IconActionSubItem = () => {
  iconMockFun()
  return (
    <CompositionWrapper>
      <ListItem
        text={'Title Name'}
        icon={Icons.ICON_AIRPLANEMODE_ACTIVE}
        buttonText={'Button'}
        secondaryText={'Subtitle'}
      />
    </CompositionWrapper>
  )
}
