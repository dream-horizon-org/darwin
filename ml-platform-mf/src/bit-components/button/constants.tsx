export enum ButtonSizes {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}
export enum ButtonVariants {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary'
}

export enum ButtonTypes {
  SUBMIT = 'submit'
}

export enum ButtonAriaHasPopup {
  MENU = 'menu',
  LISTBOX = 'listbox',
  TREE = 'tree',
  GRID = 'grid',
  DIALOG = 'dialog',
  TRUE = 'true'
}

export const ButtonStateList = [
  {value: false, text: 'False'},
  {value: true, text: 'True'}
]

export const ButtonVariantsList = [
  {value: ButtonVariants.PRIMARY, text: 'primary'},
  {value: ButtonVariants.SECONDARY, text: 'secondary'},
  {value: ButtonVariants.TERTIARY, text: 'tertiary'}
]

export const ButtonSizetsList = [
  {value: ButtonSizes.LARGE, text: 'large'},
  {value: ButtonSizes.MEDIUM, text: 'medium'},
  {value: ButtonSizes.SMALL, text: 'small'}
]
