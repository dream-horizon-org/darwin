import {useEffect, useMemo, useRef} from 'react'

export const useDebounce = (
  task: () => void,
  waitTime: number,
  dependencies: any[],
  options?: {
    avoidWaitOnFirstRender?: boolean
    avoidCallOnFirstRender?: boolean
  }
) => {
  const firstRender = useRef(true)
  useEffect(() => {
    const time =
      options !== undefined && options.avoidWaitOnFirstRender === true
        ? firstRender.current
          ? 0
          : waitTime
        : waitTime
    const taskToDebounce = setTimeout(() => {
      if (
        options !== undefined &&
        options.avoidCallOnFirstRender === true &&
        firstRender.current === true
      ) {
        null
      } else {
        task()
      }
      firstRender.current = false
    }, time)

    return () => {
      clearTimeout(taskToDebounce)
    }
  }, dependencies)
}
