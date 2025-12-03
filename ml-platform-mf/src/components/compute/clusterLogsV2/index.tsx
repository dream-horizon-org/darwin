import {WithStyles, withStyles} from '@mui/styles'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {GetLogGroupsInput} from '../../../modules/compute/graphQL/queries/getLogGroups'
import {getLogGroups} from '../../../modules/compute/graphQL/queries/getLogGroups/index.thunk'
import {CommonState, ICommonState} from '../../../reducers/commonReducer'

import axios from 'axios'
import {useHistory} from 'react-router'
import {getEventTypes} from '../../../modules/compute/graphQL/queries/getEventTypes/index.thunk'
import {getLogComponents} from '../../../modules/compute/graphQL/queries/getLogComponents/index.thunk'
import {getLogLevels} from '../../../modules/compute/graphQL/queries/getLogLevels/index.thunk'
import {GetLogLineDetailsInput} from '../../../modules/compute/graphQL/queries/getLogLineDetails'
import {getLogDetails} from '../../../modules/compute/graphQL/queries/getLogLineDetails/index.thunk'
import {GetLogsInput} from '../../../modules/compute/graphQL/queries/getLogs'
import {getLogs} from '../../../modules/compute/graphQL/queries/getLogs/index.thunk'
import {EVENT_TYPES_WITH_FILE_LOGS} from '../../../modules/compute/pages/constant'
import {
  resetLogGroups,
  resetLogs
} from '../../../modules/compute/pages/graphqlApis/actions'
import {IComputeState} from '../../../modules/compute/pages/graphqlApis/reducer'
import {API_STATUS} from '../../../utils/apiUtils'
import {getFormattedDateTimeForCompute} from '../../../utils/getDateString'
import ClusterLogsList from '../clusterLogsList'
import ClusterLogsV2Header from '../clusterLogsV2Header'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  logGroups: IComputeState['logGroups']
  logComponents: IComputeState['logComponents']
  logLevels: IComputeState['logLevels']
  logs: IComputeState['logs']
  logDetails: IComputeState['logDetails']
  getLogComponents: () => void
  getLogGroups: (data: GetLogGroupsInput) => void
  getLogLevels: () => void
  getLogs: (data: GetLogsInput) => void
  resetLogs: () => void
  resetLogGroups: () => void
  getLogDetails: (data: GetLogLineDetailsInput) => void
  clusterId: string
  eventTypes: IComputeState['eventTypes']
  getEventTypes: () => void
}

const ClusterLogsV2 = (props: IProps) => {
  const {
    classes,
    logGroups,
    logLevels,
    logs,
    logDetails,
    getLogGroups,
    clusterId,
    logComponents,
    getLogComponents,
    getLogLevels,
    getLogs,
    resetLogs,
    resetLogGroups,
    getLogDetails,
    eventTypes,
    getEventTypes
  } = props
  const history = useHistory()
  const [selectedLogGroup, setSelectedLogGroup] = React.useState(null)
  const [components, setComponents] = React.useState({})
  const [levels, setLevels] = React.useState({})
  const [eventTypesFilter, setEventTypesFilter] = React.useState<{
    [key: string]: boolean
  }>({})
  const [offset, setOffset] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(50)
  const [displayedLogs, setDisplayedLogs] = React.useState<
    IComputeState['logs']['data']
  >([])
  const [logsLoading, setLogsLoading] = React.useState(false)
  const [recentLogsLoading, setRecentLogsLoading] = React.useState(false)
  const [openLogDetails, setOpenLogDetails] = React.useState(false)
  const [liveMode, setLiveMode] = React.useState(false)
  const [hasMoreData, setHasMoreData] = React.useState(true)
  const [lastEventId, setLastEventId] = React.useState(null)
  const [intervalId, setIntervalId] = useState(null)
  const [startDate, setStartDate] = useState<Date>(null)
  const [endDate, setEndDate] = useState<Date>(null)
  const [startTime, setStartTime] = useState<Date>(null)
  const [endTime, setEndTime] = useState<Date>(null)
  const [appliedDateFilters, setAppliedDateFilters] = useState({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null
  })
  const [queryDataParsed, setQueryDataParsed] = useState({
    logGroup: false,
    components: false,
    levels: false,
    eventTypes: false,
    startDate: false,
    endDate: false,
    startTime: false,
    endTime: false
  })
  const [initScriptLogs, setInitScriptLogs] = useState('')
  const [initScriptsLogsLoading, setInitScriptLogsLoading] = useState(false)
  const [initalSetupDone, setInitalSetupDone] = useState(false)

  const observer = useRef<any>()
  const lastElementRef = useCallback(
    (node) => {
      if (logsLoading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreData) {
          setOffset(offset + pageSize)
        }
      })

      if (node) observer.current.observe(node)
    },
    [hasMoreData, logsLoading]
  )

  const getStartTimestamp = () => {
    let newStartDate: Date = null
    if (appliedDateFilters.startDate) {
      const year = appliedDateFilters.startDate.getFullYear()
      const month = appliedDateFilters.startDate.getMonth()
      const day = appliedDateFilters.startDate.getDate()

      const hours = appliedDateFilters.startTime.getHours()
      const minutes = appliedDateFilters.startTime.getMinutes()
      const seconds = appliedDateFilters.startTime.getSeconds()

      newStartDate = new Date(year, month, day, hours, minutes, seconds)
    }

    if (selectedLogGroup?.id?.start_timestamp && newStartDate) {
      return new Date(selectedLogGroup.id.start_timestamp) > startDate
        ? selectedLogGroup.id.start_timestamp
        : newStartDate.toISOString()
    } else if (selectedLogGroup?.id?.start_timestamp) {
      return selectedLogGroup.id.start_timestamp
    } else if (newStartDate) {
      return newStartDate.toISOString()
    }

    return null
  }

  const getEndTimestamp = () => {
    let parsedEndDate: Date = null

    if (appliedDateFilters.endDate) {
      const year = appliedDateFilters.endDate.getFullYear()
      const month = appliedDateFilters.endDate.getMonth()
      const day = appliedDateFilters.endDate.getDate()

      const hours = appliedDateFilters.endTime.getHours()
      const minutes = appliedDateFilters.endTime.getMinutes()
      const seconds = appliedDateFilters.endTime.getSeconds()

      parsedEndDate = new Date(year, month, day, hours, minutes, seconds)
    }

    if (selectedLogGroup?.id?.end_timestamp && parsedEndDate) {
      return new Date(selectedLogGroup.id.end_timestamp) < parsedEndDate
        ? selectedLogGroup.id.end_timestamp
        : parsedEndDate.toISOString()
    } else if (selectedLogGroup?.id?.end_timestamp) {
      return selectedLogGroup.id.end_timestamp
    } else if (parsedEndDate) {
      return parsedEndDate.toISOString()
    }

    return null
  }

  useEffect(() => {
    getLogGroups({clusterId})
    getLogComponents()
    getLogLevels()
    getEventTypes()

    return () => {
      setDisplayedLogs([])
      setOffset(0)
      setLogsLoading(false)
      resetLogs()
      resetLogGroups()
    }
  }, [])

  useEffect(() => {
    if (!initalSetupDone) return

    if (logs?.cancel) logs.cancel()

    const severities = Object.keys(levels).filter((key) => levels[key])
    const filterComponents = Object.keys(components)
      .filter((key) => components[key])
      .map((key) => {
        const component = logComponents?.data.find(
          (component) => component.label === key
        )
        return component?.id
      })
    const filterEventTypes = Object.keys(eventTypesFilter)
      .filter((key) => eventTypesFilter[key])
      .map((key) => key)
    const start_timestamp = getStartTimestamp()
    const end_timestamp = getEndTimestamp()

    setLogsLoading(true)
    setOffset(0)
    setDisplayedLogs([])
    getLogs({
      clusterId: clusterId,
      lastEventId: null,
      offset: 0,
      pageSize: pageSize,
      filters: {
        severities: severities,
        components: filterComponents,
        event_types: filterEventTypes,
        start_timestamp: start_timestamp,
        end_timestamp: end_timestamp
      }
    })
  }, [
    selectedLogGroup,
    levels,
    components,
    appliedDateFilters,
    eventTypesFilter,
    initalSetupDone
  ])

  useEffect(() => {
    if (offset !== 0) {
      if (logs?.cancel) logs.cancel()

      const severities = Object.keys(levels).filter((key) => levels[key])
      const filterComponents = Object.keys(components)
        .filter((key) => components[key])
        .map((key) => {
          const component = logComponents?.data.find(
            (component) => component.label === key
          )
          return component?.id
        })
      const filterEventTypes = Object.keys(eventTypesFilter)
        .filter((key) => eventTypesFilter[key])
        .map((key) => key)
      const start_timestamp = getStartTimestamp()
      const end_timestamp = getEndTimestamp()

      setLogsLoading(true)
      getLogs({
        clusterId: clusterId,
        lastEventId: null,
        offset: offset,
        pageSize: pageSize,
        filters: {
          severities: severities,
          components: filterComponents,
          event_types: filterEventTypes,
          start_timestamp: start_timestamp,
          end_timestamp: end_timestamp
        }
      })
    }
  }, [offset])

  useEffect(() => {
    if (logComponents?.data) {
      setComponents(
        logComponents.data.reduce((acc, item) => {
          acc[item.label] = false
          return acc
        }, {})
      )
    }
  }, [logComponents])

  useEffect(() => {
    if (eventTypes?.data) {
      const filteredEventResponse = eventTypes.data.reduce((acc, item) => {
        acc[item.event] = item.default
        return acc
      }, {})
      setEventTypesFilter(filteredEventResponse)
    }
  }, [eventTypes])

  useEffect(() => {
    if (logLevels?.data) {
      setLevels(
        logLevels.data.reduce((acc, item) => {
          acc[item] = false
          return acc
        }, {})
      )
    }
  }, [logLevels])

  useEffect(() => {
    if (logs?.data) {
      if (recentLogsLoading) {
        setDisplayedLogs([...logs.data, ...displayedLogs])
        setRecentLogsLoading(false)
      } else {
        setDisplayedLogs([...displayedLogs, ...logs.data])
        setLogsLoading(false)

        if (logs.data.length < pageSize) {
          setHasMoreData(false)
        }
      }
    }
  }, [logs])

  useEffect(() => {
    if (
      displayedLogs.length &&
      displayedLogs[0].processed_event_id !== lastEventId
    ) {
      setLastEventId(displayedLogs[0].processed_event_id)
    }
  }, [displayedLogs])

  useEffect(() => {
    if (liveMode) {
      clearInterval(intervalId)
      setIntervalId(null)

      const interval = setInterval(() => {
        const severities = Object.keys(levels).filter((key) => levels[key])
        const filterComponents = Object.keys(components)
          .filter((key) => components[key])
          .map((key) => {
            const component = logComponents?.data.find(
              (component) => component.label === key
            )
            return component?.id
          })
        const filterEventTypes = Object.keys(eventTypesFilter)
          .filter((key) => eventTypesFilter[key])
          .map((key) => key)
        const start_timestamp = getStartTimestamp()
        const end_timestamp = getEndTimestamp()

        setRecentLogsLoading(true)
        getLogs({
          clusterId: clusterId,
          lastEventId: lastEventId,
          offset: 0,
          pageSize: pageSize,
          filters: {
            severities: severities,
            components: filterComponents,
            event_types: filterEventTypes,
            start_timestamp: start_timestamp,
            end_timestamp: end_timestamp
          }
        })
      }, 10000)

      setIntervalId(interval)
    } else {
      clearInterval(intervalId)
      setIntervalId(null)
    }
  }, [
    liveMode,
    lastEventId,
    levels,
    components,
    selectedLogGroup,
    eventTypesFilter,
    appliedDateFilters,
    initalSetupDone
  ])

  useEffect(() => {
    const searchParams = new URLSearchParams(history.location.search)

    if (selectedLogGroup?.id?.session_id || queryDataParsed.logGroup) {
      if (selectedLogGroup?.id?.session_id) {
        searchParams.set('logGroup', selectedLogGroup.id.session_id)
      } else {
        searchParams.delete('logGroup')
      }
    }

    const selectedComponents = Object.keys(components).filter(
      (key) => components[key]
    )
    if (selectedComponents.length > 0 || queryDataParsed.components) {
      if (selectedComponents.length > 0) {
        searchParams.set('components', JSON.stringify(selectedComponents))
      } else {
        searchParams.delete('components')
      }
    }

    const selectedLevels = Object.keys(levels).filter((key) => levels[key])
    if (selectedLevels.length > 0 || queryDataParsed.levels) {
      if (selectedLevels.length > 0) {
        searchParams.set('levels', JSON.stringify(selectedLevels))
      } else {
        searchParams.delete('levels')
      }
    }

    const selectedEventTypes = Object.keys(eventTypesFilter).filter(
      (key) => eventTypesFilter[key]
    )
    if (selectedEventTypes.length > 0 || queryDataParsed.eventTypes) {
      if (selectedEventTypes.length > 0) {
        searchParams.set('eventTypes', JSON.stringify(selectedEventTypes))
      } else {
        searchParams.delete('eventTypes')
      }
    }

    if (appliedDateFilters.startDate || queryDataParsed.startDate) {
      if (appliedDateFilters.startDate) {
        searchParams.set(
          'startDate',
          JSON.stringify(appliedDateFilters.startDate)
        )
      } else {
        searchParams.delete('startDate')
      }
    }

    if (appliedDateFilters.endDate || queryDataParsed.endDate) {
      if (appliedDateFilters.endDate) {
        searchParams.set('endDate', JSON.stringify(appliedDateFilters.endDate))
      } else {
        searchParams.delete('endDate')
      }
    }

    if (appliedDateFilters.startTime || queryDataParsed.startTime) {
      if (appliedDateFilters.startTime) {
        searchParams.set(
          'startTime',
          JSON.stringify(appliedDateFilters.startTime)
        )
      } else {
        searchParams.delete('startTime')
      }
    }

    if (appliedDateFilters.endTime || queryDataParsed.endTime) {
      if (appliedDateFilters.endTime) {
        searchParams.set('endTime', JSON.stringify(appliedDateFilters.endTime))
      } else {
        searchParams.delete('endTime')
      }
    }

    let search = searchParams.toString()
    history.replace({
      pathname: `/clusters/${clusterId}/logs/`,
      search: search
    })
  }, [
    selectedLogGroup,
    components,
    levels,
    eventTypesFilter,
    appliedDateFilters,
    initalSetupDone
  ])

  useEffect(() => {
    let newQueryDataParsed = {
      logGroup: false,
      components: false,
      levels: false,
      eventTypes: false,
      startDate: false,
      endDate: false,
      startTime: false,
      endTime: false
    }

    const searchParams = new URLSearchParams(history.location.search)
    const logGroupSessionId = searchParams.get('logGroup')

    if (logGroupSessionId && logGroups?.data) {
      const selectedLogGroup = logGroups.data.find(
        (logGroup) => logGroup.session_id === logGroupSessionId
      )

      if (selectedLogGroup) {
        setSelectedLogGroup({
          id: selectedLogGroup,
          label: `${getFormattedDateTimeForCompute(
            selectedLogGroup.start_timestamp
          )} ${
            selectedLogGroup.end_timestamp ? '/' : ''
          } ${getFormattedDateTimeForCompute(selectedLogGroup.end_timestamp)}`
        })
      }
      newQueryDataParsed.logGroup = true
    } else if (logGroups?.data) {
      newQueryDataParsed.logGroup = true
    }

    const queryComponents = searchParams.get('components')
    if (queryComponents && logComponents?.data?.length > 0) {
      const selectedComponents = JSON.parse(queryComponents)
      const newComponents = logComponents?.data?.reduce((acc, item) => {
        acc[item.label] = false
        return acc
      }, {})
      selectedComponents.forEach((component) => {
        newComponents[component] = true
      })
      setComponents(newComponents)
      newQueryDataParsed.components = true
    } else if (logComponents?.data?.length > 0) {
      newQueryDataParsed.components = true
    }

    const queryLevels = searchParams.get('levels')
    if (queryLevels && logLevels?.data?.length > 0) {
      const selectedLevels = JSON.parse(queryLevels)
      const newLevels = logLevels?.data?.reduce((acc, item) => {
        acc[item] = false
        return acc
      }, {})
      selectedLevels.forEach((level) => {
        newLevels[level] = true
      })
      setLevels(newLevels)
      newQueryDataParsed.levels = true
    } else if (logLevels?.data?.length > 0) {
      newQueryDataParsed.levels = true
    }

    const queryEventTypes = searchParams.get('eventTypes')
    if (queryEventTypes && eventTypes?.data?.length > 0) {
      const selectedEventTypes = JSON.parse(queryEventTypes)
      const newEventTypes = eventTypes?.data?.reduce((acc, item) => {
        acc[item.event] = item.default
        return acc
      }, {})
      selectedEventTypes.forEach((eventType) => {
        newEventTypes[eventType] = true
      })
      setEventTypesFilter(newEventTypes)
      newQueryDataParsed.eventTypes = true
    } else if (eventTypes?.data?.length > 0) {
      newQueryDataParsed.eventTypes = true
    }

    const queryStartDate = searchParams.get('startDate')
    const splittedQueryStartDate = queryStartDate
      ? queryStartDate.split('"')
      : []
    const parsedQueryStartDate =
      splittedQueryStartDate.length > 1 ? splittedQueryStartDate[1] : null
    if (parsedQueryStartDate) {
      setStartDate(new Date(parsedQueryStartDate))
    }
    newQueryDataParsed.startDate = true

    const queryEndDate = searchParams.get('endDate')
    const splittedQueryEndDate = queryEndDate ? queryEndDate.split('"') : []
    const parsedQueryEndDate =
      splittedQueryEndDate.length > 1 ? splittedQueryEndDate[1] : null
    if (parsedQueryEndDate) {
      setEndDate(new Date(parsedQueryEndDate))
    }
    newQueryDataParsed.endDate = true

    const queryStartTime = searchParams.get('startTime')
    const splittedQueryStartTime = queryStartTime
      ? queryStartTime.split('"')
      : []
    const parsedQueryStartTime =
      splittedQueryStartTime.length > 1 ? splittedQueryStartTime[1] : null
    if (parsedQueryStartTime) {
      setStartTime(new Date(parsedQueryStartTime))
    }
    newQueryDataParsed.startTime = true

    const queryEndTime = searchParams.get('endTime')
    const splittedQueryEndTime = queryEndTime ? queryEndTime.split('"') : []
    const parsedQueryEndTime =
      splittedQueryEndTime.length > 1 ? splittedQueryEndTime[1] : null
    if (parsedQueryEndTime) {
      setEndTime(new Date(parsedQueryEndTime))
    }
    newQueryDataParsed.endTime = true

    setAppliedDateFilters({
      startDate: parsedQueryStartDate ? new Date(parsedQueryStartDate) : null,
      endDate: parsedQueryEndDate ? new Date(parsedQueryEndDate) : null,
      startTime: parsedQueryStartTime ? new Date(parsedQueryStartTime) : null,
      endTime: parsedQueryEndTime ? new Date(parsedQueryEndTime) : null
    })
    setQueryDataParsed(newQueryDataParsed)
  }, [logGroups, logComponents, logLevels, eventTypes])

  useEffect(() => {
    if (logGroups?.status === API_STATUS.SUCCESS) {
      const queryLogGroup = new URLSearchParams(history.location.search).get(
        'logGroup'
      )

      if (queryLogGroup && queryLogGroup !== selectedLogGroup?.id?.session_id) {
        return
      } else if (queryLogGroup && !selectedLogGroup?.id?.session_id) {
        return
      }
    } else {
      return
    }

    if (Object.keys(components).length > 0) {
      let queryComponents = new URLSearchParams(history.location.search).get(
        'components'
      )
      if (queryComponents) {
        queryComponents = JSON.parse(queryComponents)
        if (
          queryComponents.length !==
          Object.keys(components).filter((key) => components[key]).length
        ) {
          return
        }
      }
    } else {
      return
    }

    if (Object.keys(levels).length > 0) {
      let queryLevels = new URLSearchParams(history.location.search).get(
        'levels'
      )
      if (queryLevels) {
        queryLevels = JSON.parse(queryLevels)
        if (
          queryLevels.length !==
          Object.keys(levels).filter((key) => levels[key]).length
        ) {
          return
        }
      }
    } else {
      return
    }

    if (Object.keys(eventTypesFilter).length > 0) {
      let queryEventTypes = new URLSearchParams(history.location.search).get(
        'eventTypes'
      )
      if (queryEventTypes) {
        queryEventTypes = JSON.parse(queryEventTypes)
        if (
          queryEventTypes.length !==
          Object.keys(eventTypesFilter).filter((key) => eventTypesFilter[key])
            .length
        ) {
          return
        }
      }
    } else {
      return
    }

    setInitalSetupDone(true)
  }, [
    logGroups,
    selectedLogGroup,
    logComponents,
    components,
    logLevels,
    levels,
    eventTypesFilter
  ])

  const onSelectingLogGroup = (logGroup) => {
    setSelectedLogGroup(logGroup)
  }

  const onSelectingComponent = (components) => {
    setComponents(components)
  }

  const onSelectingEventType = (eventTypes) => {
    setEventTypesFilter(eventTypes)
  }

  const onSelectingLevel = (levels) => {
    setLevels(levels)
  }

  const onViewLogLineDetailsClicked = (
    log: IComputeState['logs']['data'][0]
  ) => {
    setOpenLogDetails(true)
    if (EVENT_TYPES_WITH_FILE_LOGS.includes(log.event_type)) {
      setInitScriptLogsLoading(true)
      const filePath = log.message.split('##')[1]
      axios
        .get(filePath)
        .then((response) => {
          setInitScriptLogs(response.data)
          setInitScriptLogsLoading(false)
        })
        .catch((error) => {
          setInitScriptLogs('Error fetching logs...')
          setInitScriptLogsLoading(false)
        })
    } else {
      getLogDetails({processedEventId: log.processed_event_id})
    }
  }

  const onCloseLogDetails = () => {
    if (initScriptLogs) {
      setInitScriptLogs('')
    }
    setOpenLogDetails(false)
  }

  const onChangeLiveMode = (mode: boolean) => {
    setLiveMode(mode)
  }

  const onStartDateSelected = (date: Date) => {
    setStartDate(date)
  }

  const onEndDateSelected = (date: Date) => {
    setEndDate(date)
  }

  const onStartTimeSelected = (date: Date) => {
    setStartTime(date)
  }

  const onEndTimeSelected = (date: Date) => {
    setEndTime(date)
  }

  const onSetAppliedDateFilters = (newAppliedFilters) => {
    setAppliedDateFilters(newAppliedFilters)
  }

  const onApplyDateAndTimeFilters = () => {
    setAppliedDateFilters({
      startDate: startDate,
      endDate: endDate,
      startTime: startTime,
      endTime: endTime
    })
  }

  const onResetDateAndTimeFilters = () => {
    setStartDate(null)
    setEndDate(null)
    setStartTime(null)
    setEndTime(null)

    setAppliedDateFilters({
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null
    })
  }

  return (
    <div className={classes.container}>
      <ClusterLogsV2Header
        logGroups={logGroups}
        components={components}
        levels={levels}
        eventTypesFilter={eventTypesFilter}
        selectedLogGroup={selectedLogGroup}
        onSelectingLogGroup={onSelectingLogGroup}
        onSelectingComponent={onSelectingComponent}
        onSelectingEventType={onSelectingEventType}
        onSelectingLevel={onSelectingLevel}
        startDate={startDate}
        endDate={endDate}
        startTime={startTime}
        endTime={endTime}
        onStartDateSelected={onStartDateSelected}
        onEndDateSelected={onEndDateSelected}
        onStartTimeSelected={onStartTimeSelected}
        onEndTimeSelected={onEndTimeSelected}
        onApplyDateAndTimeFilters={onApplyDateAndTimeFilters}
        onResetDateAndTimeFilters={onResetDateAndTimeFilters}
        onSetAppliedDateFilters={onSetAppliedDateFilters}
        filterActive={Object.keys(appliedDateFilters).some(
          (key) => appliedDateFilters[key] !== null
        )}
      />

      <ClusterLogsList
        components={logComponents?.data}
        logs={displayedLogs}
        onViewLogLineDetailsClicked={onViewLogLineDetailsClicked}
        openLogDetails={openLogDetails}
        logDetails={
          initScriptLogs ? initScriptLogs : logDetails?.data?.event_data
        }
        stringify={initScriptLogs ? false : true}
        logDetailsLoading={
          initScriptsLogsLoading || logDetails.status === API_STATUS.LOADING
        }
        onCloseLogDetails={onCloseLogDetails}
        liveMode={liveMode}
        onChangeLiveMode={onChangeLiveMode}
        logsLoading={logsLoading || !initalSetupDone}
        recentLogsLoading={recentLogsLoading}
        lastElementRef={lastElementRef}
      />
    </div>
  )
}

const mapStateToProps = (state: CommonState) => {
  return {
    logGroups: state.computeReducer.logGroups,
    logComponents: state.computeReducer.logComponents,
    logLevels: state.computeReducer.logLevels,
    logs: state.computeReducer.logs,
    logDetails: state.computeReducer.logDetails,
    eventTypes: state.computeReducer.eventTypes
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getLogGroups: (data: GetLogGroupsInput) => getLogGroups(dispatch, data),
    resetLogGroups: () => dispatch(resetLogGroups()),
    getLogComponents: () => getLogComponents(dispatch),
    getLogLevels: () => getLogLevels(dispatch),
    getLogs: (data: GetLogsInput) => getLogs(dispatch, data),
    resetLogs: () => dispatch(resetLogs()),
    getLogDetails: (data: GetLogLineDetailsInput) =>
      getLogDetails(dispatch, data),
    getEventTypes: () => getEventTypes(dispatch)
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ClusterLogsV2)

export default styleComponent
