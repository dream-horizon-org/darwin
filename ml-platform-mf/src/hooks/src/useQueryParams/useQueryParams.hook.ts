import {useCallback, useEffect, useMemo, useState} from 'react'
import {useHistory, useLocation} from 'react-router-dom'

export const useQueryParams = <T>() => {
  const location = useLocation()
  const history = useHistory()
  const [params, setParams] = useState<T>({} as T)

  useEffect(() => {
    if (location.search) {
      setParams(JSON.parse(decodeURIComponent(location.search.slice(1))))
    } else {
      setParams({} as T)
    }
  }, [location.search])

  const setQueryParams = useCallback(
    (newParams: Partial<T>) => {
      const newQueryParams = {
        ...params,
        ...newParams
      }
      const newQuery = encodeURIComponent(JSON.stringify(newQueryParams))
      history.replace({
        search: `?${newQuery}`
      })
      setParams(newQueryParams)
    },
    [params]
  )

  return [params, setQueryParams] as const
}
