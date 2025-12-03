import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'

import {Editor} from '@monaco-editor/react'
import {CircularProgress, Switch} from '@mui/material'
import {Dialog} from '../../../bit-components/dialog/index'
import {IComputeState} from '../../../modules/compute/pages/graphqlApis/reducer'
import {getFormattedDateTimeWithSecondsForCompute} from '../../../utils/getDateString'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  components: IComputeState['logComponents']['data']
  logs: IComputeState['logs']['data']
  onViewLogLineDetailsClicked: (
    logDetails: IComputeState['logs']['data'][0]
  ) => void
  openLogDetails: boolean
  logDetails: string
  stringify: boolean
  onCloseLogDetails: () => void
  liveMode: boolean
  onChangeLiveMode: (liveMode: boolean) => void
  logsLoading: boolean
  recentLogsLoading: boolean
  lastElementRef: any
  logDetailsLoading: boolean
}

const ClusterLogsList = (props: IProps) => {
  const {
    classes,
    logs,
    onViewLogLineDetailsClicked,
    openLogDetails,
    logDetails,
    stringify,
    onCloseLogDetails,
    liveMode,
    onChangeLiveMode,
    logsLoading,
    recentLogsLoading,
    lastElementRef,
    components,
    logDetailsLoading
  } = props
  const [hoveredLog, setHoveredLog] = React.useState<number | null>(null)

  const getComponentNameFromId = (id: number) => {
    if (!id) return ''

    const component = components?.find((component) => component.id === id)
    return component?.label || ''
  }

  const getParsedLogMessage = (message: string) => {
    if (!message) return ''

    if (!message.includes('##')) return message

    const splitMessage = message.split('##')
    return splitMessage.length > 0 ? splitMessage[0] : ''
  }

  const getLogDetails = (log: string, stringify: boolean) => {
    if (!log) return ''

    if (stringify) return JSON.stringify(log, null, 2)

    return log
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.headerRow}>
          <div className={classes.headerCol}>Timestamp</div>
          <div className={classes.headerCol}>Component</div>
          <div className={`${classes.headerCol} ${classes.levelCol}`}>
            Level
          </div>
          <div className={classes.headerCol}>Message</div>
        </div>
        <div className={classes.right}>
          <div>Live Mode</div>
          <div>
            <Switch
              classes={{
                switchBase: classes.switchBase,
                track: classes.track
              }}
              checked={liveMode}
              onChange={(e) => onChangeLiveMode(e.target.checked)}
              size='small'
            />
          </div>
        </div>
      </div>
      <div className={classes.body}>
        {recentLogsLoading && (
          <div className={classes.recentLogsLoader}>
            <CircularProgress size={20} />
            <p className={classes.loaderText}>Listening new logs ...</p>
          </div>
        )}
        {logs.map((log, idx) => {
          return (
            <div
              className={classes.row}
              id={`${log.raw_event_id}`}
              ref={idx === logs.length - 1 ? lastElementRef : null}
              onMouseEnter={() => setHoveredLog(idx)}
              onMouseLeave={() => setHoveredLog(null)}
            >
              <div className={`${classes.rowCol}`}>
                <div className={classes.rectangle}></div>
                <div data-testid='cluster-logs-timestamp-filter'>
                  {getFormattedDateTimeWithSecondsForCompute(log.timestamp)}
                </div>
              </div>
              <div
                className={classes.rowCol}
                data-testid='cluster-logs-component-filter'
              >
                {getComponentNameFromId(log.source_id)}
              </div>
              <div
                className={`${classes.rowCol} ${classes.levelCol}`}
                data-testid='cluster-logs-level-filter'
              >
                {log.severity}
              </div>
              <div
                className={classes.rowCol}
                data-testid='cluster-logs-events-filter'
              >
                [{log.event_type}] {getParsedLogMessage(log.message)}.
                {hoveredLog === idx && (
                  <span
                    className={classes.link}
                    onClick={() => onViewLogLineDetailsClicked(log)}
                  >
                    View details
                  </span>
                )}
              </div>
            </div>
          )
        })}
        {logsLoading && (
          <div className={classes.loader}>
            <CircularProgress size={30} />
          </div>
        )}
        {!recentLogsLoading && !logsLoading && logs.length === 0 && (
          <div className={classes.noLogs}>No logs available</div>
        )}
      </div>

      <Dialog
        handleClose={onCloseLogDetails}
        testIdentifier='logLineDialog'
        title={'Log line details'}
        open={openLogDetails}
        dialogContent={
          <div className={classes.dialogContainer}>
            <div className={classes.dialogContentLabel}>Raw log line</div>
            <div className={classes.editorContainer}>
              {!logDetailsLoading ? (
                <Editor
                  width={'100%'}
                  height={'100%'}
                  language={'shell'}
                  loading={<CircularProgress />}
                  options={{
                    readOnly: true,
                    minimap: {
                      enabled: false
                    }
                  }}
                  value={getLogDetails(logDetails, stringify)}
                  onMount={(editor, monaco) => {
                    monaco.editor.lo
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
              ) : (
                <div className={classes.logDetailsLoader}>
                  <CircularProgress />
                </div>
              )}
            </div>
          </div>
        }
      />
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(ClusterLogsList)

export default styleComponent
