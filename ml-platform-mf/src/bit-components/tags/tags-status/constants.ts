export enum TagsStatusTypes {
  Active = 'Active',
  Information = 'Information',
  Draft = 'Draft',
  Paused = 'Paused',
  Error = 'Error',
  Functional = 'Functional'
}

export const TagsStatusList = [
  {value: TagsStatusTypes.Active, text: 'Active'},
  {value: TagsStatusTypes.Information, text: 'Information'},
  {value: TagsStatusTypes.Draft, text: 'Draft'},
  {value: TagsStatusTypes.Paused, text: 'Paused'},
  {value: TagsStatusTypes.Error, text: 'Error'},
  {value: TagsStatusTypes.Functional, text: 'Functional'}
]
