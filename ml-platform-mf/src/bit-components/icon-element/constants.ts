export enum IconSizes {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}
export enum IconVariants {
  PRIMARY = 'primary',
  SUCCESS = 'success',
  ERROR = 'error'
}

export const IconStateList = [
  {value: false, text: 'False'},
  {value: true, text: 'True'}
]
export const IconVariantsList = [
  {value: IconVariants.PRIMARY, text: 'primary'},
  {value: IconVariants.SUCCESS, text: 'success'},
  {value: IconVariants.ERROR, text: 'error'}
]
export const IconSizetsList = [
  {value: IconSizes.MEDIUM, text: 'M'},
  {value: IconSizes.LARGE, text: 'L'},
  {value: IconSizes.SMALL, text: 'S'}
]
