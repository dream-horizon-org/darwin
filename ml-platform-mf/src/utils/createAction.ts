export type SFA<T, P> = {type: T; payload?: P}
export const createAction = <T, P>(type: T, payload?: P): SFA<T, P> => ({
  type,
  payload
})
