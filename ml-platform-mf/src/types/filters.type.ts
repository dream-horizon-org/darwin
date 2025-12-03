export interface IOwner {
  name: string
  selected: boolean
}

export interface ITag {
  name: string
  selected: boolean
}

export interface IFilters {
  owners: IOwner[]
  tags: ITag[]
}

export const OWNER = 'OWNER'
export const TAG = 'TAG'
