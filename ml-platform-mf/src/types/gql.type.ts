type GQLError<T> = {
  locations?: {
    line: number
    column: number
  }[]
  error?: T
  status?: number
  message: string
  path?: string[]
}

export interface GQLResponse<T, Error = string> {
  data?: T | null
  errors?: GQLError<Error>[]
}
