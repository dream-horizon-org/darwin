import React from 'react'
import {useLocation} from 'react-router'

export default function useQuery() {
  const {search} = useLocation()

  return React.useMemo(() => new URLSearchParams(search), [search])
}

export const QueryParams = {
  QUERY: 'q',
  TYPE: 't'
}

export const WorkflowsQueryParams = {
  QUERY: 'q',
  FILTERS: 'filters'
}

export const ComputeQueryParams = {
  QUERY: 'q',
  FILTERS: 'filters'
}

export const featureStoreQueryParams = {
  QUERY: 'q',
  FILTERS: 'filters'
}
