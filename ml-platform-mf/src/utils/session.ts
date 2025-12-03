import {v4 as uuidv4} from 'uuid'

const isSessionExpired = (session: any) => {
  const sessionCreatedAt = new Date(session.createdAt)
  const now = new Date()
  const diff = now.getTime() - sessionCreatedAt.getTime()
  return diff > 1000 * 60 * 60 * 24 // 24 hours
}

const getSessionFromLocalStorage = () => {
  const session = localStorage.getItem('user-session')

  if (!session) return null

  const parsedSession = JSON.parse(session)
  if (isSessionExpired(parsedSession)) {
    localStorage.removeItem('user-session')
    return null
  }

  return parsedSession
}

const createSession = () => {
  const newSession = {
    id: uuidv4(),
    createdAt: new Date().toISOString()
  }
  localStorage.setItem('user-session', JSON.stringify(newSession))
  return newSession
}

export const getSession = () => {
  let session = getSessionFromLocalStorage()
  if (session) return session

  session = createSession()
  return session
}
