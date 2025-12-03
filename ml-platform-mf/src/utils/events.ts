import config from 'config'
import {getSession} from './session'
import {getUserDetails} from './user'

export const logEvent = (eventType: string, severity: string) => {
  const userDetails = getUserDetails()

  fetch(config.eventsTrackingUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-event-source': 'darwin_ui'
    },
    body: JSON.stringify({
      event_type: eventType,
      severity,
      session_id: getSession()?.id || null,
      source: 'DARWIN_UI_EVENT',
      metadata: {
        user_id: userDetails?.userId || null,
        name: userDetails?.name || null,
        email: userDetails?.email || null
      }
    })
  })
}
