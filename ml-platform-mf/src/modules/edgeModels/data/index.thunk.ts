import {ApiStatus} from '../../../gql-enums/api-status.enum'
import {API_STATUS} from '../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../utils/gqlRequestTyped'
import {
  GetFeatureGroups,
  GetFeatureGroupsInput
} from '../../featureStoreV2/graphqlAPIs/getFeatureGroups/index'
import {Mutation, MutationInput} from '../graphQL/mutations/getFileContents'

import {
  clearEdgeModelGlobalState,
  insertEventTableData,
  insertFeatureTableData,
  setCompatibleAppVersions,
  setConfigFileContents,
  setEventTableData,
  setFeatureGroups,
  setTestDataFileContents,
  updateEventTableData,
  updateFeatureTableData
} from './actions'
import {
  SelectedData,
  TEventData,
  TEventTables,
  TFeatureData,
  TFeatureGroupData
} from './types'
import {getFeaturePropsFromMapping, getPropsFromMapping} from './utils'

import {GQL as getFeatureGroupsGql} from '../../featureStoreV2/graphqlAPIs/getFeatureGroups/indexGql'
import {GQL as fileContentGql} from '../graphQL/mutations/getFileContents/indexGql.js'

export const setEventTableDataResponse = (
  dispatch,
  payload: {
    tableName: string
    eventName: string
    selectedEventProps: SelectedData
    selectedSqlQueries: string[]
    appVersionSemver: string
    expiryTimeInSecs: number
  }
) => {
  if (!payload) {
    return
  }

  const eventData: TEventTables = {
    data: [
      {
        tableName: payload.tableName,
        expiryInSecs: payload.expiryTimeInSecs,
        queries: payload.selectedSqlQueries,
        eventData: {
          eventName: payload.eventName,
          type: 'EVENT_TYPE',
          props: getPropsFromMapping(payload.selectedEventProps)
        },
        appVersionSemver: payload.appVersionSemver
      }
    ]
  }
  dispatch(setEventTableData(eventData))
}

export const insertEventDataResponse = (
  dispatch,
  payload: {
    tableName: string
    eventName: string
    selectedEventProps: SelectedData
    selectedSqlQueries: string[]
    appVersionSemver: string
    expiryInSecs: number
  }
) => {
  if (!payload) {
    return
  }

  const eventData: TEventData = {
    tableName: payload.tableName,
    expiryInSecs: payload.expiryInSecs,
    queries: payload.selectedSqlQueries,
    eventData: {
      eventName: payload.eventName,
      type: 'EVENT_TYPE',
      props: getPropsFromMapping(payload.selectedEventProps)
    },
    appVersionSemver: payload.appVersionSemver
  }
  dispatch(insertEventTableData(eventData))
}

export const updateEventDataResponse = (
  dispatch,
  payload: {
    tableName: string
    eventName: string
    selectedEventProps: SelectedData
    selectedSqlQueries: string[]
    appVersionSemver: string
    expiryInSecs: number
  }
) => {
  if (!payload) {
    return
  }

  const eventData: TEventData = {
    tableName: payload.tableName,
    expiryInSecs: payload.expiryInSecs,
    queries: payload.selectedSqlQueries,
    eventData: {
      eventName: payload.eventName,
      type: 'EVENT_TYPE',
      props: getPropsFromMapping(payload.selectedEventProps)
    },
    appVersionSemver: payload.appVersionSemver
  }
  dispatch(updateEventTableData(eventData))
}

export const clearEdgeModelDataState = (dispatch) => {
  dispatch(clearEdgeModelGlobalState())
}

export const setCompatibleAppVersionsData = (dispatch, payload: number[]) => {
  dispatch(setCompatibleAppVersions(payload))
}

export const insertFeatureDataResponse = (
  dispatch,
  payload: {
    tableName: string
    featureGroupName: string
    selectedFeatureProps: SelectedData
    selectedSqlQueries: string[]
  }
) => {
  if (!payload) {
    return
  }
  const featureGroupData: TFeatureGroupData = {
    tableName: payload.tableName,
    queries: payload.selectedSqlQueries,
    featureGroupData: {
      featureGroupName: payload.featureGroupName,
      features: getFeaturePropsFromMapping(payload.selectedFeatureProps)
    }
  }
  dispatch(insertFeatureTableData(featureGroupData))
}

export const updateFeatureDataResponse = (
  dispatch,
  payload: {
    tableName: string
    featureGroupName: string
    selectedFeatureProps: SelectedData
    selectedSqlQueries: string[]
  }
) => {
  if (!payload) {
    return
  }

  const featureGroupData: TFeatureGroupData = {
    tableName: payload.tableName,
    queries: payload.selectedSqlQueries,
    featureGroupData: {
      featureGroupName: payload.featureGroupName,
      features: getFeaturePropsFromMapping(payload.selectedFeatureProps)
    }
  }
  dispatch(updateFeatureTableData(featureGroupData))
}

export const getFeatureGroups = (
  dispatch,
  payload: GetFeatureGroupsInput,
  preLoadedData: GetFeatureGroups['getFeatureGroups']['data']
) => {
  const gql = {
    ...getFeatureGroupsGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<GetFeatureGroupsInput, GetFeatureGroups>(
    gql
  )

  dispatch(
    setFeatureGroups({
      status: API_STATUS.LOADING,
      data: null,
      error: null,
      totalRecordsCount: null,
      cancel: gqlResponse.cancel
    })
  )

  gqlResponse
    .then((response) => {
      if (response.data.getFeatureGroups.status === ApiStatus.SUCCESS) {
        dispatch(
          setFeatureGroups({
            status: API_STATUS.SUCCESS,
            data: [...response.data.getFeatureGroups.data],
            error: null,
            totalRecordsCount: response.data.getFeatureGroups.totalRecordsCount
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setFeatureGroups({
          status: API_STATUS.ERROR,
          data: [...preLoadedData],
          error: null,
          totalRecordsCount: null
        })
      )
    })
}

export const getFeatureComputeData = (dispatch, payload: MutationInput) => {
  const gql = {
    ...fileContentGql,
    variables: payload
  }
  const gqlResponse = gqlRequestTyped<MutationInput, Mutation>(gql)

  dispatch(
    setConfigFileContents({
      success: false,
      data: null,
      message: ''
    })
  )

  gqlResponse
    .then((response) => {
      if (response.data.getFileContents.status === 'SUCCESS') {
        dispatch(
          setConfigFileContents({
            success: true,
            data: response.data.getFileContents.data,
            message: response.data.getFileContents.message
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setConfigFileContents({
          success: false,
          data: null,
          message: 'Error'
        })
      )
    })
}

export const getTestDataFileContents = (dispatch, payload: MutationInput) => {
  const gql = {
    ...fileContentGql,
    variables: payload
  }
  const gqlResponse = gqlRequestTyped<MutationInput, Mutation>(gql)

  dispatch(
    setTestDataFileContents({
      success: false,
      data: null,
      message: ''
    })
  )

  gqlResponse
    .then((response) => {
      if (response.data.getFileContents.status === 'SUCCESS') {
        dispatch(
          setTestDataFileContents({
            success: true,
            data: response.data.getFileContents.data,
            message: response.data.getFileContents.message
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setTestDataFileContents({
          success: false,
          data: null,
          message: 'Error'
        })
      )
    })
}
