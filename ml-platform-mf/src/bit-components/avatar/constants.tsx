export enum AvatarSizes {
  EXTRASMALL = 'extrasmall',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  MINI = 'mini'
}

export enum TagType {
  CAPTAIN = 'captain',
  VICECAPTAIN = 'vicecaptain'
}

export enum AvatarVariants {
  PLAYER = 'player',
  USER = 'user',
  INITIALS = 'initials'
}

export const AvatarSizeList = [
  {value: AvatarSizes.LARGE, text: 'large'},
  {value: AvatarSizes.MEDIUM, text: 'medium'},
  {value: AvatarSizes.SMALL, text: 'small'},
  {value: AvatarSizes.EXTRASMALL, text: 'extrasmall'},
  {value: AvatarSizes.MINI, text: 'mini'}
]

export const PlayerSizeList = [
  {value: AvatarSizes.LARGE, text: 'large'},
  {value: AvatarSizes.MEDIUM, text: 'medium'},
  {value: AvatarSizes.SMALL, text: 'small'},
  {value: AvatarSizes.EXTRASMALL, text: 'extrasmall'}
]

export const TagTypeList = [
  {value: TagType.CAPTAIN, text: 'captain'},
  {value: TagType.VICECAPTAIN, text: 'vice captain'}
]
