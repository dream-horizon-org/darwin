import React from 'react'
import {
  Avatar,
  AvatarProps as BITAvatarProps,
  AvatarSizes,
  AvatarVariants
} from '../../avatar/index'
import {Chip, ChipProps as BITChipProps, ChipSizes} from '../../chip/index'
import {Tags, TagsProps as BITTagsProps, TagsSizes} from '../../tags/tags/index'
import {TableCellSize} from '../tc-cell/index'
import {TcAvatarsType} from './constants'

export interface AvatarProps extends Omit<BITAvatarProps, 'text'> {
  text?: string
}
export interface TagsProps extends Omit<BITTagsProps, 'label'> {
  label?: string
}
export interface ChipProps extends Omit<BITChipProps, 'label'> {
  label?: string
}

interface TableCellProps {
  item: string
  type: TcAvatarsType
  size: TableCellSize
  src?: string
  variant?: AvatarVariants
  componentProps?: AvatarProps | TagsProps | ChipProps
  theme?: string
}

export function TableCell({
  item,
  size,
  type,
  variant,
  src,
  componentProps,
  theme
}: TableCellProps) {
  const getTagSize = () => {
    switch (size) {
      case TableCellSize.Large:
        return TagsSizes.Medium
      case TableCellSize.Medium:
        return TagsSizes.Medium
      case TableCellSize.Small:
        return TagsSizes.Small
      default:
        return TagsSizes.Medium
    }
  }
  const getChipSize = () => {
    switch (size) {
      case TableCellSize.Large:
        return ChipSizes.Medium
      case TableCellSize.Medium:
        return ChipSizes.Medium
      case TableCellSize.Small:
        return ChipSizes.Small
      default:
        return ChipSizes.Medium
    }
  }
  const getAvatarSize = () => {
    switch (size) {
      case TableCellSize.Large:
        return AvatarSizes.LARGE
      case TableCellSize.Medium:
        return AvatarSizes.MEDIUM
      case TableCellSize.Small:
        return AvatarSizes.SMALL
      default:
        return AvatarSizes.MEDIUM
    }
  }
  switch (type) {
    case TcAvatarsType.Chips: {
      const chipProps = componentProps as ChipProps
      return (
        <Chip theme={theme} {...chipProps} size={getChipSize()} label={item} />
      )
    }
    case TcAvatarsType.Avatars: {
      const avatarProps = componentProps as AvatarProps
      return (
        <Avatar
          {...avatarProps}
          size={getAvatarSize()}
          text={item}
          variant={variant}
          src={src}
          theme={theme}
        />
      )
    }
    default: {
      const tagsProps = componentProps as TagsProps
      return <Tags {...tagsProps} size={getTagSize()} label={item} />
    }
  }
}
TableCell.defaultProps = {
  theme: 'dark'
}
export interface MockDataProps {
  id: number
  text: string
  src?: string
}
export const mockData: MockDataProps[] = [
  {
    id: 1,
    text: 'Harsh Shah',
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
  },
  {
    id: 2,
    text: 'Shah Harsh',
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
  },
  {
    id: 3,
    text: 'Aayush Bhargava',
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
  },
  {
    id: 4,
    text: 'Bhargava Aayush',
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
  },
  {
    id: 5,
    text: 'Kuldeep Singh',
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
  },
  {
    id: 6,
    text: 'Singh Kuldeep',
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
  }
]
