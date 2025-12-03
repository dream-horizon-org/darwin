import {useEffect, useRef} from 'react'

export const usePolling = (
  callback: () => void,
  delay: number,
  stopPolling: boolean
) => {
  useEffect(() => {
    const tick = () => {
      callback()
    }

    if (stopPolling) {
      return
    }

    const id = setInterval(tick, delay)
    return () => clearInterval(id)
  }, [delay, stopPolling])
}
