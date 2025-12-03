import Add from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import withStyles from '@mui/styles/withStyles'
import React, {useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {SqlEditor} from '../../../../components/sqlEditor/sqlEditor'
import {CommonState} from '../../../../reducers/commonReducer'
import {
  insertEventDataResponse,
  insertFeatureDataResponse,
  updateEventDataResponse,
  updateFeatureDataResponse
} from '../../data/index.thunk'

import {Flow, SelectedData} from '../../data/types'
import {TableTypeEnum} from '../../data/types'
import {TEventData, TFeatureGroupData} from '../../data/types'
import {getDefaultCreateQuery, getInitialQuery} from '../../data/utils'
import styles from './SqlQueryListingJSS'

function SqlQueryListingImpl(props: {
  flow: Flow
  tableType: String
  eventTableDetails: TEventData
  featureGroupTableDetails: TFeatureGroupData
  onBackPress: () => void
  closeModal: () => void
  selectedProps: SelectedData
  tableName: string
  eventName: string
  setEventTableData: (payload) => void
  updateEventTable: (payload) => void
  setFeatureTableData: (payload) => void
  updateFeatureTable: (payload) => void
  appVersionSemver: string
  expiryTimeInSecs: number
  classes
}) {
  const {
    flow,
    tableType,
    eventTableDetails,
    featureGroupTableDetails,
    onBackPress,
    selectedProps,
    tableName,
    eventName,
    closeModal,
    setEventTableData,
    updateEventTable,
    setFeatureTableData,
    updateFeatureTable,
    appVersionSemver,
    expiryTimeInSecs,
    classes
  } = props

  const defaultCreateQuery = getDefaultCreateQuery(tableName, selectedProps)

  const initialQueries = getInitialQuery(
    flow,
    eventTableDetails,
    featureGroupTableDetails,
    defaultCreateQuery
  )

  const queryMap = new Map<number, string>()
  queryMap.set(0, defaultCreateQuery)

  const showEditorInEditFlow =
    flow === Flow.Edit && !eventTableDetails && !featureGroupTableDetails

  const [showSqlEditor, setShowSqlEditor] = useState<boolean>(
    flow === Flow.CREATE || showEditorInEditFlow ? true : false
  )
  const [sqlQueries, setSqlQueries] = useState(
    new Map<number, string>(initialQueries)
  )
  const [sqlQuery, setSqlQuery] = useState<{
    index: number
    query: string
  }>({
    index: 0,
    query: queryMap.get(0)
  })

  const handleSaveQuery = (index: number, query: string) => {
    if (!query) return
    setSqlQuery({
      index: index,
      query: query
    })
    const newMap = new Map(sqlQueries)
    newMap.set(index, query)
    setSqlQueries(newMap)
    setShowSqlEditor(false)
  }

  const handleNext = () => {
    if (tableType === TableTypeEnum.EVENT) {
      const eventData = {
        tableName,
        eventName,
        selectedEventProps: selectedProps,
        selectedSqlQueries: Array.from(sqlQueries.values()),
        appVersionSemver: appVersionSemver,
        expiryInSecs: expiryTimeInSecs
      }

      if (eventTableDetails && flow === Flow.Edit) {
        updateEventTable(eventData)
      } else {
        setEventTableData(eventData)
      }
    } else {
      const featureGroupData = {
        tableName,
        featureGroupName: eventName,
        selectedFeatureProps: selectedProps,
        selectedSqlQueries: Array.from(sqlQueries.values())
      }
      if (featureGroupTableDetails && flow === Flow.Edit) {
        updateFeatureTable(featureGroupData)
      } else {
        setFeatureTableData(featureGroupData)
      }
    }

    closeModal()
  }

  return (
    <div className={classes.container}>
      <div className={classes.eventSelectionHeader}>
        <ArrowBackIcon className={classes.backButton} onClick={onBackPress} />
        <span style={{fontWeight: 700, fontSize: 16}}>{eventName}</span>
      </div>
      {!showSqlEditor && (
        <div className={classes.addQueryHeading}>
          <h4>Queries</h4>
          <Button
            size='small'
            startIcon={<Add />}
            onClick={() => {
              setSqlQuery({
                index: sqlQueries.size,
                query: ''
              })
              setShowSqlEditor(true)
            }}
            className={classes.buttonText}
          >
            Add Query
          </Button>
        </div>
      )}
      {!showSqlEditor && (
        <div className={classes.queryListWrapper}>
          {Array.from(sqlQueries).map(([index, query]) => (
            <div key={index} className={classes.queryList}>
              <Button
                size='small'
                onClick={() => {
                  setSqlQuery({
                    index: index,
                    query: query
                  })
                  setShowSqlEditor(true)
                }}
                className={classes.buttonText}
              >
                {'query - ' + (index + 1).toString()}
              </Button>
              <DeleteIcon
                onClick={() => {
                  const newMap = new Map(sqlQueries)
                  newMap.delete(index)
                  setSqlQueries(newMap)
                }}
                className={classes.deleteIcon}
              />
            </div>
          ))}
        </div>
      )}

      {showSqlEditor && (
        <div className={classes.querySection}>
          <SqlEditor
            mode='sql'
            text={sqlQuery.query}
            onBeforeChange={(editor, data, value) => {
              setSqlQuery({
                index: sqlQuery.index,
                query: value
              })
            }}
          />
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <Button
              size='medium'
              onClick={(e) => handleSaveQuery(sqlQuery.index, sqlQuery.query)}
              className={classes.buttonText}
            >
              Add
            </Button>
            <Button
              size='medium'
              onClick={() => setShowSqlEditor(false)}
              type='reset'
              className={classes.buttonText}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      {!showSqlEditor && (
        <div className={classes.nextButton}>
          <Button
            size='medium'
            onClick={handleNext}
            disabled={sqlQueries.size === 0}
            className={classes.buttonText}
            variant='contained'
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    setEventTableData: (payload) => {
      insertEventDataResponse(dispatch, payload)
    },
    setFeatureTableData: (payload) => {
      insertFeatureDataResponse(dispatch, payload)
    },
    updateEventTable: (payload) => {
      updateEventDataResponse(dispatch, payload)
    },
    updateFeatureTable: (payload) => {
      updateFeatureDataResponse(dispatch, payload)
    }
  }
}

const mapStateToProps = (state: CommonState) => ({
  eventTablesDetails: state.edgeModelsReducer.eventTablesDetails,
  featureGroupTablesDetails: state.edgeModelsReducer.featureGroupTablesDetails
})

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(SqlQueryListingImpl)

export default styleComponent
