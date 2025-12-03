export const getTimeDiff = (timeStamp) => {
  const timeObj = {
    mins: 0,
    hrs: 0,
    days: 0
  }
  const timeDiff = Math.abs(
    new Date().valueOf() - new Date(timeStamp).valueOf()
  )
  timeObj.mins = Math.floor(timeDiff / 1000 / 60)

  timeObj.hrs = Math.floor(timeObj.mins / 60)
  timeObj.days = Math.floor(timeObj.hrs / 24)

  return (
    (timeObj.days && `${timeObj.days} day${timeObj.days > 1 ? 's' : ''} ago`) ||
    (timeObj.hrs && `${timeObj.hrs} hr${timeObj.hrs > 1 ? 's' : ''} ago`) ||
    (timeObj.mins && `${timeObj.mins} min${timeObj.mins > 1 ? 's' : ''} ago`) ||
    (timeObj.mins === 0 && `Just Now`)
  )
}

export const getIntialsFromEmail = (email: string) => {
  if (!email) {
    return 'NA'
  }

  const names = email.split('@')
  const parts = names[0].split('.')
  if (parts.length > 1) {
    return `${parts[0][0].toUpperCase()}${parts[1][0].toUpperCase()}`
  } else {
    return `${parts[0][0].toUpperCase()}${parts[0][1].toUpperCase()}`
  }
}

export const getProjectName = (name: string) => {
  if (name.length > 25) {
    return `${name.substring(0, 25)}...`
  }

  return name
}
