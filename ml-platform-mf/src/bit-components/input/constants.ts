export enum InputSizes {
  SMALL = 'small',
  MEDIUM = 'medium'
}

export enum FieldVariants {
  OUTLINED = 'withOutline',
  STANDARD = 'withoutOutline'
}
export const fieldVariantsList = [
  {value: FieldVariants.OUTLINED, text: 'with Outline'},
  {value: FieldVariants.STANDARD, text: 'without Outline'}
]
export const InputSizetsList = [
  {value: InputSizes.MEDIUM, text: 'M'},
  {value: InputSizes.SMALL, text: 'S'}
]
export const InputStateList = [
  {value: false, text: 'False'},
  {value: true, text: 'True'}
]
