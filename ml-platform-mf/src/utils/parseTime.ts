import {getHours, getMinutes} from 'date-fns'

export const parseTime = (time) => {
  const hours: number = time && getHours(new Date(time))
  const minutes: number = time && getMinutes(new Date(time))
  const updateHours = hours < 10 ? `0${hours}` : hours
  const updateMinutes = minutes < 10 ? `0${minutes}` : minutes

  return `${updateHours}:${updateMinutes}`
}

export const getMinDiff = (startDate, endDate) => {
  const msInMinute = 60 * 1000

  return Math.round(Math.abs(endDate - startDate) / msInMinute)
}
