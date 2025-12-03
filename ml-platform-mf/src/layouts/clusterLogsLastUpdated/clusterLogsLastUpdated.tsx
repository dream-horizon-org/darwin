import React, {useEffect, useState} from 'react'
import {getMinDiff} from '../../utils/parseTime'

interface IProps {
  lastUpdatedTime: Date
}

const clusterLogsLastUpdate = (props: IProps) => {
  const {lastUpdatedTime} = props
  const [lastUpdated, setLastUpdated] = useState(null)
  let event

  useEffect(() => {
    setLastUpdated(getMinDiff(lastUpdatedTime, new Date()))
    if (event) {
      clearInterval(event)
    }
    event = setInterval(() => {
      setLastUpdated(getMinDiff(lastUpdatedTime, new Date()))
    }, 60 * 1000)

    return () => {
      clearInterval(event)
    }
  }, [lastUpdatedTime])

  return <p>Last updated {lastUpdated} mins ago</p>
}

export default clusterLogsLastUpdate
