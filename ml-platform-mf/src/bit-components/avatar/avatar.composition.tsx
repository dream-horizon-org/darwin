import config from 'config'
import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {Avatar} from './avatar'
import {
  AvatarSizeList,
  AvatarVariants,
  PlayerSizeList,
  TagType,
  TagTypeList
} from './constants'

const imageLink =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'

const avatarMockFunc = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
}

export const AvatarWithImage = () => {
  avatarMockFunc()
  return (
    <CompositionWrapper lists={{size: AvatarSizeList}}>
      <Avatar src={imageLink} />
    </CompositionWrapper>
  )
}

export const AvatarWithPlaceholder = () => {
  avatarMockFunc()
  return (
    <CompositionWrapper lists={{size: AvatarSizeList}}>
      <Avatar />
    </CompositionWrapper>
  )
}

export const AvatarWithInitials = () => {
  avatarMockFunc()
  return (
    <CompositionWrapper lists={{size: AvatarSizeList}}>
      <Avatar variant={AvatarVariants.INITIALS} text={'Harsh Shah'} />
    </CompositionWrapper>
  )
}

export const PlayerAvatar = () => {
  avatarMockFunc()
  return (
    <CompositionWrapper lists={{size: AvatarSizeList}}>
      <Avatar variant={AvatarVariants.PLAYER} />
    </CompositionWrapper>
  )
}

export const PlayerAvatarWithTag = () => {
  avatarMockFunc()
  return (
    <CompositionWrapper lists={{size: PlayerSizeList, tagType: TagTypeList}}>
      <Avatar
        variant={AvatarVariants.PLAYER}
        tagType={TagType.CAPTAIN}
        tag={true}
      />
    </CompositionWrapper>
  )
}

export const UserAvatarWithTag = () => {
  avatarMockFunc()
  return (
    <CompositionWrapper lists={{size: PlayerSizeList, tagType: TagTypeList}}>
      <Avatar
        variant={AvatarVariants.USER}
        tagType={TagType.CAPTAIN}
        tag={true}
      />
    </CompositionWrapper>
  )
}
export const AvatarWithTag = () => {
  avatarMockFunc()
  return (
    <CompositionWrapper lists={{size: PlayerSizeList, tagType: TagTypeList}}>
      <Avatar src={imageLink} tag={true} tagType={TagType.CAPTAIN} />
    </CompositionWrapper>
  )
}
