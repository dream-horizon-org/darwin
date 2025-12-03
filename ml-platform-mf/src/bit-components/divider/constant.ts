export enum DividerTypes {
  Dashed = 'dashed',
  Solid = 'solid'
}

export enum DividerAlignment {
  Vertical = 'vertical',
  Horizontal = 'horizontal'
}

export enum DividerSeverity {
  Default = 'default',
  Generic = 'generic'
}

export const DividerAlignmentList = [
  {value: DividerAlignment.Horizontal, text: 'horizontal'},
  {value: DividerAlignment.Vertical, text: 'vertical'}
]

export const DividerTypeList = [
  {value: DividerTypes.Solid, text: 'solid'},
  {value: DividerTypes.Dashed, text: 'dashed'}
]
