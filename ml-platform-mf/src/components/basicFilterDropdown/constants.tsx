export const maxCharLimit = 15

export interface IBasicFilterDropdownValues {
  [key: string]: boolean
}

export interface IBasicFilterDropdown<T> {
  name: T
  values: IBasicFilterDropdownValues
}
