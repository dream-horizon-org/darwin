import React from 'react'
import {AvatarVariants} from '../../avatar/index'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {TagsType} from '../../tags/tags/index'
import {TableCellSize} from '../tc-cell/index'
import {TcAvatarsType} from './constants'
import {TcAvatars} from './tc-avatars'
import {mockData} from './tc-avatars.config'

export const BasicTcAvatars = () => {
  return (
    <CompositionWrapper>
      <TcAvatars
        type={TcAvatarsType.Tags}
        displayKey={'text'}
        data={mockData}
        componentProps={{
          label: TagsType.Default
        }}
      />
    </CompositionWrapper>
  )
}
BasicTcAvatars.compositionName = 'Tc Avatars + Tags'

export const BasicTcAvatarsWithAvatars = () => {
  return (
    <CompositionWrapper>
      <TcAvatars
        type={TcAvatarsType.Avatars}
        displayKey={'text'}
        srcKey={'src'}
        data={mockData}
      />
    </CompositionWrapper>
  )
}
BasicTcAvatarsWithAvatars.compositionName = 'Tc Avatars'

export const BasicTcAvatarsWithTotalElements = () => {
  return (
    <CompositionWrapper>
      <TcAvatars
        size={TableCellSize.Large}
        type={TcAvatarsType.Tags}
        displayKey={'text'}
        data={mockData}
        totalElements={2}
      />
    </CompositionWrapper>
  )
}
BasicTcAvatarsWithTotalElements.compositionName = 'Tc Avatars + Total Element'

export const BasicTcAvatarsWithInitials = () => {
  return (
    <CompositionWrapper>
      <TcAvatars
        type={TcAvatarsType.Avatars}
        displayKey={'text'}
        data={mockData}
        variant={AvatarVariants.INITIALS}
      />
    </CompositionWrapper>
  )
}

BasicTcAvatarsWithInitials.compositionName = 'Tc Avatars + Initials'
