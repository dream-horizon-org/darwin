export const truncate = (str: string, length: number) => {
  if (str && str.length > length) {
    return str.slice(0, length) + '...'
  }
  return str
}

// function to get time difference in seconds or minutes or hours or days
export const getTimeDifference = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const remainingSeconds = seconds % 3600
  const minutes = Math.floor(remainingSeconds / 60)
  // const truncatedMilliseconds = Math.floor((remainingSeconds % 60) * 1000)

  let formattedTime = ''

  if (hours > 0) {
    formattedTime += `${hours}h `
  }

  if (minutes > 0 || hours > 0) {
    formattedTime += `${minutes}m `
  }

  if (seconds > 0 || (hours === 0 && minutes === 0)) {
    formattedTime += `${Math.floor(remainingSeconds % 60)}s `
  }

  // formattedTime += `${truncatedMilliseconds}ms`

  return formattedTime
}

export const getInternationalNumberFormat = (num: any) => {
  if (!num) return 0
  num = Number(num)
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt: string) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export const parseBooleanString = (str: string): boolean => {
  return str.toLowerCase() === 'true' || false
}
