import React, {useEffect, useState} from 'react'

import Close from '@mui/icons-material/Close'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {Flow} from '../../data/types'
import {TEventData} from '../../data/types'
import {mergeSelectedEventProperties} from '../../data/utils'
import {SelectionOnVersions} from '../../graphQL/queries/getAppVersions'
import type {
  GetEventSchema,
  GetEventSchemaInput,
  SelectionOnEvents
} from '../../graphQL/queries/getEventSchema/index'
import {GQL as eventSchemaGql} from '../../graphQL/queries/getEventSchema/indexGql.js'
import {AllEventsListing} from './AllEventsListing'
import AllEventsListingHeader from './AllEventsListingHeader'
import {EventSelection} from './EventSelection.js'

export const AllEventsSchema = (props: {
  handleModalClose: (value: boolean) => void
  flow: Flow
  eventTableDetails: TEventData
  compatibleAppVersionsResp: SelectionOnVersions[]
  handleShowDialog: (showDialog: boolean) => void
}) => {
  const {
    handleModalClose,
    flow,
    eventTableDetails,
    compatibleAppVersionsResp,
    handleShowDialog
  } = props

  const [allEventsSchema, setAllEventsSchema] = useState({
    data: null,
    loading: true,
    originalData: null,
    globalProps: null
  })
  const [appVersions, setAppVersions] = useState<
    {
      id: string
      semver: string
    }[]
  >([])

  const [appVersionSemver, setAppVersionSemver] = useState<string>('')

  const [eventSelection, setEventSelection] =
    useState<SelectionOnEvents | null>(null)

  useEffect(() => {
    if (compatibleAppVersionsResp && compatibleAppVersionsResp.length > 0) {
      getAndSetEventSchemaByPlatform(compatibleAppVersionsResp[0].appName)
    }
  }, [])

  const getEventSchemaByAppVersion = async (appVersionId: string) => {
    setAllEventsSchema({
      ...allEventsSchema,
      loading: true
    })
    const eventSchemaPayload = {
      ...eventSchemaGql,
      variables: {
        appVersionId: appVersionId
      }
    }
    const eventSchemaGqlResponse = gqlRequestTyped<
      GetEventSchemaInput,
      GetEventSchema
    >(eventSchemaPayload)

    const eventSchemaResponse = await eventSchemaGqlResponse
    const data = eventSchemaResponse?.data?.getEventSchema?.data?.events || []
    const globalPropsData =
      eventSchemaResponse?.data?.getEventSchema?.data?.globalProperties
    if (flow === Flow.Edit && data?.length > 0 && eventTableDetails) {
      const selectedEvent = data.find(
        (event) =>
          event.metadata.androidfull.eventName ===
          eventTableDetails.eventData.eventName
      )
      if (selectedEvent) {
        const eventWithGlobalProps = mergeSelectedEventProperties(
          selectedEvent,
          globalPropsData
        )
        setEventSelection(eventWithGlobalProps)
      }
    }

    setAllEventsSchema({
      data: data || [],
      loading: false,
      originalData: data || [],
      globalProps: globalPropsData || []
    })
  }

  const handleFiltersAndSearch = (filterType: string, data) => {
    if (data) {
      if (filterType === 'query') {
        const filteredData = allEventsSchema?.originalData?.filter((event) => {
          return event.metadata.androidfull.eventName
            .toLowerCase()
            .includes(data.toLowerCase())
        })
        if (filteredData && filteredData.length > 0) {
          setAllEventsSchema({
            ...allEventsSchema,
            data: filteredData
          })
        }
      } else if (filterType === 'appVersion') {
        setAppVersionSemver(data.label)
        getEventSchemaByAppVersion(data.value)
      } else if (filterType === 'platform') {
        getAndSetEventSchemaByPlatform(data.value.toUpperCase())
        // const filteredData = allEventsSchema?.originalData?.filter((event) => {
        //   return event.metadata[data === 'ios' ? 'ios' : 'androidfull']
        // })
        // if (filteredData && filteredData.length > 0) {
        //   setAllEventsSchema({
        //     ...allEventsSchema,
        //     data: filteredData
        //   })
        // }
      }
    }
  }

  const getAndSetEventSchemaByPlatform = async (
    compatibleAppVersionPlatform: string
  ) => {
    let data = compatibleAppVersionsResp.find((version) => {
      return version.appName === compatibleAppVersionPlatform
    })
    try {
      const versions = [data]
        .map((version) => {
          return version.appVersions.map((appVersion) => {
            return {
              id: appVersion.id,
              semver: appVersion.codepushVersion
                ? `${appVersion.semver} - (${appVersion.codepushVersion})`
                : appVersion.semver
            }
          })
        })
        .flat()
      if (!(versions && versions.length > 0)) {
        return
      }
      setAppVersions(versions)
      setAppVersionSemver(versions[0].semver)
      getEventSchemaByAppVersion(versions[0].id)
    } catch (error) {
      setAllEventsSchema({
        data: [],
        loading: false,
        originalData: [],
        globalProps: []
      })
    }
  }

  const eventRowClickHandler = (event: SelectionOnEvents) => {
    const eventWithGlobalProps = mergeSelectedEventProperties(
      event,
      allEventsSchema.globalProps
    )
    setEventSelection(eventWithGlobalProps)
  }

  const platforms = compatibleAppVersionsResp.map((version) => {
    return version.appName
  })

  const isEditFlow = flow === Flow.Edit && eventTableDetails

  return (
    <>
      {!eventSelection && (
        <div style={{width: '100%'}}>
          <div style={{display: 'flex', color: '#D9D9D9'}}>
            <Close
              style={{marginRight: 18, cursor: 'pointer'}}
              onClick={() => handleModalClose(false)}
            />
            <span style={{fontWeight: 700, fontSize: 16}}>Add Event Table</span>
          </div>
          <AllEventsListingHeader
            appVersions={appVersions}
            handleFiltersAndSearch={handleFiltersAndSearch}
            platforms={platforms}
          />
          <AllEventsListing
            allEventsSchema={allEventsSchema}
            appVersionSemver={appVersionSemver}
            eventRowClickHandler={eventRowClickHandler}
          />
        </div>
      )}
      {eventSelection && (
        <EventSelection
          flow={flow}
          eventMetadata={eventSelection}
          onBackPress={() =>
            isEditFlow ? handleShowDialog(false) : setEventSelection(null)
          }
          closeModal={() => handleModalClose(false)}
          appVersionSemver={appVersionSemver}
          eventTableDetails={eventTableDetails}
        />
      )}
    </>
  )
}
