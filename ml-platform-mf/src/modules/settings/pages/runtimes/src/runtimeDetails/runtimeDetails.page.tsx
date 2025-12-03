import Editor from '@monaco-editor/react'
import {CircularProgress} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useCallback, useEffect, useState} from 'react'
import {useHistory, useParams} from 'react-router'
import {
  ActionableIconButtonVariants,
  IconButton
} from '../../../../../../bit-components/icon-button/index'
import {Icons} from '../../../../../../bit-components/icon/index'
import {RuntimeStatus} from '../../../../../../gql-enums/runtime-status.enum'
import {usePolling, usePreventNavigation} from '../../../../../../hooks'
import {EventTypes, SeverityTypes} from '../../../../../../types/events.types'
import {logEvent} from '../../../../../../utils/events'
import {useGQL} from '../../../../../../utils/useGqlRequest'
import {
  GetRuntimeDetails,
  GetRuntimeDetailsInput
} from '../../../../graphqlApi/runtimes/getRuntimeDetails'
import {GetRuntimeDetailsSchema} from '../../../../graphqlApi/runtimes/getRuntimeDetails/index.gqlTypes'
import {GQL as GetRuntimeDetailsGQL} from '../../../../graphqlApi/runtimes/getRuntimeDetails/indexGql'
import styles from './runtimeDetailsJSS'

interface IProps extends WithStyles<typeof styles> {}

const RuntimeDetailsPage = (props: IProps) => {
  const {classes} = props
  const RELOAD_BUTTON_IS_AVAILABLE = false
  const POLLING_INTERVAL = 5000
  const [status, setStatus] = useState<RuntimeStatus | null>(null)
  const [logs, setLogs] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date(Date.now()))
  const history = useHistory()
  const goBack = () => {
    history.push('/settings/runtimes')
  }
  const {
    output: {
      response: runtimeDetails,
      errors: runtimeDetailsErrors,
      loading: runtimeDetailsLoading
    },
    triggerGQLCall: getRuntimeDetails
  } = useGQL<GetRuntimeDetailsInput, GetRuntimeDetails>()

  const triggerGetRuntimeDetails = useCallback(
    (input: GetRuntimeDetailsInput) => {
      return getRuntimeDetails(
        {
          ...GetRuntimeDetailsGQL,
          variables: input
        },
        GetRuntimeDetailsSchema
      )
    },
    []
  )

  useEffect(() => {
    triggerGetRuntimeDetails({
      runtimeName: params.runtimeName
    })

    logEvent(EventTypes.CUSTOM_RUNTIME.DETAILS_OPEN, SeverityTypes.INFO)
  }, [])
  usePolling(
    () =>
      triggerGetRuntimeDetails({
        runtimeName: params.runtimeName
      }),
    POLLING_INTERVAL,
    status === RuntimeStatus.ACTIVE ||
      runtimeDetailsLoading ||
      status === RuntimeStatus.FAILED
  )

  useEffect(() => {
    if (runtimeDetails) {
      setStatus(runtimeDetails?.getRuntimeDetails?.status)
      setLogs(runtimeDetails?.getRuntimeDetails?.logs)
      setLastUpdated(new Date(Date.now()))
    }
  }, [runtimeDetails])

  const params = useParams<{runtimeName: string}>()

  const getLastFetchedText = (lastUpdated: Date) => {
    const timeString = lastUpdated.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })

    const formattedTimeString = timeString
      .replace('am', 'AM')
      .replace('pm', 'PM')
      .split('+')[0]

    return formattedTimeString
  }
  return (
    <div className={classes.container}>
      <div className={classes.headerContainer}>
        <div className={classes.iconContainer}>
          <IconButton
            leadingIcon={Icons.ICON_ARROW_BACK}
            onClick={goBack}
            actionableVariants={ActionableIconButtonVariants.ACTIONABLE_PRIMARY}
            actionable
          />
        </div>
        <h1 className={classes.runtimeName}>{params.runtimeName}</h1>
        <div className={classes.refreshContainer}>
          <p className={classes.lastUpdatedText}>
            Last fetched: {getLastFetchedText(lastUpdated)}
          </p>
          {RELOAD_BUTTON_IS_AVAILABLE && (
            <div className={classes.iconContainer}>
              <IconButton
                leadingIcon={Icons.ICON_REFRESH}
                onClick={() => {
                  triggerGetRuntimeDetails({
                    runtimeName: params.runtimeName
                  })
                }}
                actionableVariants={
                  ActionableIconButtonVariants.ACTIONABLE_PRIMARY
                }
                actionable
                disabled={runtimeDetailsLoading}
              />
            </div>
          )}
        </div>
      </div>
      <div className={classes.contentContainer}>
        <h1 className={classes.contentContainerHeader}>Creation Log</h1>
        {!logs && runtimeDetailsLoading && (
          <div className={classes.loadingContainer}>
            <CircularProgress />
          </div>
        )}
        {logs && (
          // Docker file
          <div
            className={classes.editorContainer}
            data-testid='runtime-creation-logs'
          >
            <Editor
              width={'100%'}
              height={'100%'}
              language={'dockerfile'}
              loading={<CircularProgress />}
              options={{
                readOnly: true,
                minimap: {
                  enabled: false
                }
              }}
              value={logs}
              onMount={(editor, monaco) => {
                monaco.editor.defineTheme('myTheme', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [],
                  colors: {
                    'editor.foreground': '#D9D9D9',
                    'editor.background': '#121212'
                  }
                })

                monaco.editor.setTheme('myTheme')
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const StyledComponent = withStyles(styles, {withTheme: true})(
  RuntimeDetailsPage
)
export default StyledComponent
