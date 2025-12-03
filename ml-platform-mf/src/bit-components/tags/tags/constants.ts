export enum TagsType {
  Default = 'default',
  Valid = 'valid',
  Invalid = 'invalid',
  Neutral = 'neutral',
  Header = 'header'
}

export enum TagsSizes {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XS = 'xs'
}

export const TagsSizeList = [
  {value: TagsSizes.Medium, text: 'M'},
  {value: TagsSizes.Large, text: 'L'},

  {value: TagsSizes.Small, text: 'S'},
  {value: TagsSizes.XS, text: 'XS'}
]

export const TagsTypeList = [
  {value: TagsType.Default, text: 'Default'},
  {value: TagsType.Valid, text: 'Success'},
  {value: TagsType.Invalid, text: 'Error'},
  {value: TagsType.Neutral, text: 'Info'},
  {value: TagsType.Header, text: 'Warning'}
]
