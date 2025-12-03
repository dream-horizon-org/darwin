import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import withStyles from '@mui/styles/withStyles'
import React, {useCallback, useMemo, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import SearchBar from '../../../../components/searchBar'
import {CommonState} from '../../../../reducers/commonReducer'
import {setInitialEventTableData} from '../../data/actions'
import {
  Flow,
  SelectedData,
  TableTypeEnum,
  TEventData,
  TEventTables
} from '../../data/types'
import {hasTableDelta} from '../../data/utils'
import type {
  SelectionOnEvents,
  SelectionOnPropertyMetadata
} from '../../graphQL/queries/getEventSchema/index'
import {defaultExpiryTimeInSecs} from './constants'
import EventPropSelection from './EventPropSelection'
import styles from './EventSelectionJSS'
import SqlQueryListing from './SqlQueryListing'
function EventSelectionImpl(props: {
  flow: Flow
  eventMetadata: SelectionOnEvents
  onBackPress: () => void
  closeModal: () => void
  appVersionSemver: string
  eventTableDetails: TEventData
  initialEventTableDetails: TEventTables
  classes
}) {
  const {
    flow,
    eventMetadata,
    onBackPress,
    closeModal,
    appVersionSemver,
    eventTableDetails,
    initialEventTableDetails,
    classes
  } = props

  const platformEventData = eventMetadata.metadata.androidfull
    ? eventMetadata.metadata.androidfull
    : eventMetadata.metadata.ios

  const [selected, setSelected] = useState<SelectedData>(new Map())
  const [searchValue, setSearchValue] = useState<string>('')
  const [eventData, setEventData] = useState<SelectionOnPropertyMetadata[]>(
    platformEventData.propertyMetadata
  )
  const [defaultTableName, setDefaultTableName] = useState<string>(
    flow === Flow.CREATE || (flow === Flow.Edit && !eventTableDetails)
      ? platformEventData.eventName
      : eventTableDetails?.tableName || platformEventData.eventName // fallback to default if eventTableDetails is undefined
  )

  const [showSqlQueries, setShowSqlQueries] = useState(false)
  const [expiryTimeInSecs, setExpiryTimeInSecs] = useState(
    flow === Flow.Edit && eventTableDetails
      ? eventTableDetails.expiryInSecs
      : defaultExpiryTimeInSecs
  )

  const handlePropSelection = (selectedData: SelectedData) => {
    setSelected(selectedData)
  }

  const handlePropNameSearch = useCallback(
    (searchString: string) => {
      const newMetaData = {...eventMetadata}
      const searchData = newMetaData.metadata.androidfull
        ? newMetaData.metadata.androidfull.propertyMetadata
        : newMetaData.metadata.ios.propertyMetadata
      const filteredData = searchData.filter((row) =>
        row.name.toLowerCase().includes(searchString.toLowerCase())
      )
      setEventData(filteredData)
      setSearchValue(searchString)
    },
    [eventMetadata, searchValue]
  )

  if (showSqlQueries) {
    return (
      <SqlQueryListing
        flow={flow}
        tableType={TableTypeEnum.EVENT}
        eventTableDetails={eventTableDetails}
        featureGroupTableDetails={undefined}
        selectedProps={selected}
        onBackPress={() => setShowSqlQueries(false)}
        tableName={defaultTableName}
        eventName={platformEventData.eventName}
        expiryTimeInSecs={expiryTimeInSecs}
        closeModal={closeModal}
        appVersionSemver={appVersionSemver}
      />
    )
  }

  let modifiedEventPropsWithCreatedAt = [...eventData]
  modifiedEventPropsWithCreatedAt.unshift({
    name: 'created_at',
    rawDataType: 'integer',
    expectedValue: ''
  })

  return (
    <div className={classes.container}>
      <div className={classes.eventSelectionHeader}>
        <ArrowBackIcon className={classes.backButton} onClick={onBackPress} />
        <span className={classes.eventNameSpan}>
          {platformEventData.eventName}
        </span>
      </div>
      <div className={classes.searchRow}>
        <div className={classes.searchContainer}>
          <div className={classes.searchBarSection}>
            <SearchBar
              placeholder='Search By Prop Name'
              value={searchValue}
              onValueChange={handlePropNameSearch}
            />
          </div>
        </div>
      </div>
      <EventPropSelection
        flow={flow}
        eventTableDetails={eventTableDetails}
        eventProps={modifiedEventPropsWithCreatedAt}
        handlePropSelection={handlePropSelection}
      />
      <EventPropTableFooter
        flow={flow}
        eventTableDetails={eventTableDetails}
        initialEventTableDetails={initialEventTableDetails}
        selectedProps={selected}
        expiryTimeInSecs={expiryTimeInSecs}
        handlePropTableNext={() => setShowSqlQueries(true)}
        handleTableNameChange={(e) => setDefaultTableName(e.target.value)}
        handleExpiryTimeChange={(e) =>
          setExpiryTimeInSecs(Number(e.target.value))
        }
        defaultTableName={defaultTableName}
        classes={classes}
      />
    </div>
  )
}

function EventPropTableFooter(props: {
  flow: Flow
  eventTableDetails: TEventData
  initialEventTableDetails: TEventTables
  selectedProps: SelectedData
  expiryTimeInSecs: number
  handlePropTableNext: () => void
  handleTableNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleExpiryTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  defaultTableName: string
  classes
}) {
  const {
    flow,
    eventTableDetails,
    initialEventTableDetails,
    selectedProps,
    expiryTimeInSecs,
    handlePropTableNext,
    handleTableNameChange,
    handleExpiryTimeChange,
    defaultTableName,
    classes
  } = props
  const length = selectedProps.size
  const propText = length > 0 ? `${length} Props - ` : ''

  const [isTableNameValid, setIsTableNameValid] = useState(true)

  const handleNext = () => {
    if (eventTableDetails && flow === Flow.Edit) {
      const originalTable = initialEventTableDetails.data.find(
        (table) => table.tableName === eventTableDetails.tableName
      )

      const hasDelta = hasTableDelta(
        originalTable,
        expiryTimeInSecs,
        selectedProps
      )

      if (hasDelta && defaultTableName === originalTable.tableName) {
        setIsTableNameValid(false)
        return
      } else {
        setIsTableNameValid(true)
      }
    }
    handlePropTableNext()
  }

  return (
    <div className={classes.footerContainer}>
      <div className={classes.footerLeft}>
        <span className={classes.labelText}>
          {propText} Event Table Name &nbsp;
        </span>
        <TextField
          size='small'
          className={classes.textField}
          placeholder='Event table name'
          variant='outlined'
          defaultValue={defaultTableName}
          onChange={handleTableNameChange}
          error={!isTableNameValid}
          helperText={!isTableNameValid ? 'Table name already exists' : ''}
        />
        <span className={classes.expiryLabelText}>
          Expiry Time(in secs) &nbsp;
        </span>
        <TextField
          size='small'
          className={classes.textField}
          placeholder='Expiry Time'
          variant='outlined'
          defaultValue={
            flow === Flow.Edit && eventTableDetails
              ? eventTableDetails.expiryInSecs
              : defaultExpiryTimeInSecs
          }
          onChange={handleExpiryTimeChange}
          style={{width: 96}}
          type='number'
        />
      </div>

      <div className={classes.btnContainer}>
        <Button
          onClick={handleNext}
          disabled={length < 2}
          variant='contained'
          className={classes.buttonText}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    setInitialEventTableDetails: (payload: TEventTables) => {
      dispatch(setInitialEventTableData(payload))
    }
  }
}

const mapStateToProps = (state: CommonState) => ({
  initialEventTableDetails: state.edgeModelsReducer.initialEventTableDetails
})

export const EventSelection = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(EventSelectionImpl)
