import {useCallback, useEffect, useState} from 'react'
import {useHistory, useLocation} from 'react-router-dom'

interface UseQueryParamsInput {
  pathname?: string
  searchStr: string
}

export const useQueryParams = () => {
  const {search} = useLocation()
  const history = useHistory()

  // Decoding the search string when initializing URLSearchParams
  const query = new URLSearchParams(decodeURIComponent(search))
  const [params, setParams] = useState<URLSearchParams>(query)

  useEffect(() => {
    setParams(query)
  }, [search])
  const setQueryParams = useCallback(
    ({searchStr, pathname}: UseQueryParamsInput) => {
      // Encoding the search string when setting query parameters
      const encodedQuery = encodeURIComponent(searchStr)
      history.replace({
        pathname: pathname || window.location.pathname,
        search: encodedQuery
      })
    },
    []
  )

  return [params, setQueryParams] as const
}
