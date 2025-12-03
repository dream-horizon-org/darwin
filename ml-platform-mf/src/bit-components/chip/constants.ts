export enum ChipSizes {
  Small = 'small',
  Medium = 'medium'
}

export enum ChipIcons {
  LeadingIcon = 'leadingIcon',
  TrailingIcon = 'trailingIcon',
  WithoutIcon = 'withoutIcon',
  LeadingAndTrailingIcon = 'leadingAndTrailingIcon'
}

export const ChipStateList = [
  {value: false, text: 'False'},
  {value: true, text: 'True'}
]

export const ChipSizesList = [
  {value: ChipSizes.Medium, text: 'medium'},
  {value: ChipSizes.Small, text: 'small'}
]
