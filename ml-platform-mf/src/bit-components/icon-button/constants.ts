export enum IconButtonSizes {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}
export enum IconButtonVariants {
  PRIMARY = 'primary',
  SECONDARY = 'secondary'
}
export enum ActionableIconButtonVariants {
  ACTIONABLE_PRIMARY = 'actionablePrimary',
  ACTIONABLE_SECONDARY = 'actionableSecondary',
  ACTIONABLE_TERTIARY = 'actionableTertiary'
}
export enum ActionableIconButtonSizes {
  EXTRA_SMALL = 'extraSmall',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

export const IconButtonStateList = [
  {value: false, text: 'False'},
  {value: true, text: 'True'}
]

export const IconButtonVariantList = [
  {value: IconButtonVariants.PRIMARY, text: 'primary'},
  {value: IconButtonVariants.SECONDARY, text: 'secondary'}
]

export const ActionableIconButtonVariantsList = [
  {value: ActionableIconButtonVariants.ACTIONABLE_PRIMARY, text: 'primary'},
  {value: ActionableIconButtonVariants.ACTIONABLE_SECONDARY, text: 'secondary'},
  {value: ActionableIconButtonVariants.ACTIONABLE_TERTIARY, text: 'tertiary'}
]
export const IconButtonSizesList = [
  {value: IconButtonSizes.LARGE, text: 'L'},
  {value: IconButtonSizes.MEDIUM, text: 'M'},
  {value: IconButtonSizes.SMALL, text: 'S'}
]
export const ActionableIconButtonSizesList = [
  {value: ActionableIconButtonSizes.LARGE, text: 'L'},
  {value: ActionableIconButtonSizes.MEDIUM, text: 'M'},
  {value: ActionableIconButtonSizes.SMALL, text: 'S'},
  {value: ActionableIconButtonSizes.EXTRA_SMALL, text: 'XS'}
]
