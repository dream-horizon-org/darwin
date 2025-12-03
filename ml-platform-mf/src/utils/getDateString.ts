import {add, addHours, addMinutes, format, isValid, sub} from 'date-fns'

export const padText = (num: number): string => {
  let numtext = `${num}`
  if (num < 10) {
    numtext = `0${num}`
  }
  return numtext
}

export const getDateString = (dateObj) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  return `${dateObj.getDate()}th ${
    months[dateObj.getMonth()]
  } ${dateObj.getFullYear()}`
}

export const getTime12Hour = (dateObj) => {
  let hour = dateObj.getHours()
  const minutes = padText(dateObj.getMinutes())
  let amPm = 'AM'
  if (hour >= 12) {
    amPm = 'PM'
    hour -= 12
  }
  hour = padText(hour)
  return `${hour}:${minutes} ${amPm}`
}

export const convertIntoIST = (gmtDate) => {
  if (isValid(new Date(gmtDate))) {
    return format(
      new Date(add(new Date(gmtDate), {hours: 5, minutes: 30})),
      'dd/MM/yyyy HH:mm'
    )
  } else {
    return 'Invalid Date'
  }
}
export const convertToIST = (gmtDate: string, dateFormat: string) => {
  if (isValid(new Date(gmtDate))) {
    return format(
      new Date(addHours(new Date(addMinutes(new Date(gmtDate), 30)), 5)),
      dateFormat
    )
  } else {
    return 'Invalid date'
  }
}
export const convertIntoGMT = (istDate) => {
  if (isValid(new Date(istDate))) {
    return format(
      new Date(sub(new Date(istDate), {hours: 5, minutes: 30})),
      'dd/MM/yyyy HH:mm'
    )
  } else {
    return 'Invalid Date'
  }
}

export const convertToGMT = (istDate: string, dateFormat: string) => {
  if (isValid(new Date(istDate))) {
    return format(
      new Date(addHours(new Date(addMinutes(new Date(istDate), -30)), -5)),
      dateFormat
    )
  } else {
    return 'Invalid date'
  }
}

export const getFormattedDate = (
  gmtDate: string,
  formats: string,
  isIST: boolean
) => {
  if (isIST) {
    return format(
      new Date(addHours(new Date(addMinutes(new Date(gmtDate), 30)), 5)),
      formats
    )
  } else {
    return format(new Date(gmtDate), formats)
  }
}

export const getFormattedDateTimeForCompute = (date) => {
  if (!date) return ''

  const dateWithMothAndDay = new Date(date)
    .toDateString()
    .split(' ')
    .slice(1)
    .join(' ')

  const dateArr = dateWithMothAndDay.split(' ')
  const newDateArr = [
    dateArr.slice(0, 2).join(' '),
    dateArr[2],
    formatTime(new Date(date))
  ]

  return newDateArr.join(', ')
}

export const getFormattedDateTimeWithSecondsForCompute = (date) => {
  if (!date) return ''

  const dateWithMothAndDay = new Date(date)
    .toDateString()
    .split(' ')
    .slice(1)
    .join(' ')

  const dateArr = dateWithMothAndDay.split(' ')
  const newDateArr = [
    dateArr.slice(0, 2).join(' '),
    dateArr[2],
    formatTimeWithSeconds(new Date(date))
  ]

  return newDateArr.join(', ')
}

export const formatTime = (date) => {
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  minutes = minutes < 10 ? '0' + minutes : minutes
  const strTime = hours + ':' + minutes + ' ' + ampm
  return strTime
}

const formatTimeWithSeconds = (date) => {
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let seconds = date.getSeconds()
  let ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  const strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm
  return strTime
}

export const getCurrentDateString = (date: string): string => {
  if (!date) return null
  // returns date format - YYYY-MM-DD
  const today: Date = date ? new Date(date) : new Date()
  const year: number = today.getFullYear()
  const month: number = today.getMonth() + 1
  const day: number = today.getDate()

  // Pad single digit month and day with leading zero if necessary
  const monthString: string = month < 10 ? `0${month}` : `${month}`
  const dayString: string = day < 10 ? `0${day}` : `${day}`

  return `${year}-${monthString}-${dayString}`
}

export const getStartOfDay = (date: string): string => {
  const startDate = getCurrentDateString(date)
  return startDate ? `${startDate}T00:00:00Z` : null
}

export const getEndOfDay = (date: string): string => {
  const endDate = getCurrentDateString(date)
  return endDate ? `${endDate}T23:59:59Z` : null
}

export const parseSeconds = (seconds: number): string => {
  seconds = Math.round(seconds)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours === 0 && minutes === 0) {
    return `${remainingSeconds}s`
  } else if (hours === 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${hours}h ${minutes}m ${remainingSeconds}s`
}
