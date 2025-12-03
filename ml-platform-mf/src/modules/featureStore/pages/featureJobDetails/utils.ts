export const isListNotEmpty = <T>(data: Array<T | null> | null): boolean => {
  if (!data) {
    return false
  } else if (
    Array.isArray(data) &&
    (!data.length || data.filter((d) => d !== null).length < 1)
  ) {
    return false
  }
  return true
}
