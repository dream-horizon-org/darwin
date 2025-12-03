export enum TableCellSize {
  Large = 'large',
  Medium = 'medium',
  Small = 'small'
}

export enum TableCellSeverity {
  Default = 'default',
  Success = 'success'
}

export enum TableCellType {
  ParentHeader = 'parentHeader',
  Header = 'header',
  Body = 'body'
}
export enum TableCellAlignment {
  Center = 'center',
  Left = 'left',
  Right = 'right'
}

export const TableCellSizeList = [
  {value: TableCellSize.Large, text: 'L'},
  {value: TableCellSize.Medium, text: 'M'},
  {value: TableCellSize.Small, text: 'S'}
]

export const TableCellAlignmentList = [
  {value: TableCellAlignment.Left, text: 'Left'},
  {value: TableCellAlignment.Center, text: 'Center'},
  {value: TableCellAlignment.Right, text: 'Right'}
]

export const TableCellStateList = [
  {value: false, text: 'False'},
  {value: true, text: 'True'}
]
