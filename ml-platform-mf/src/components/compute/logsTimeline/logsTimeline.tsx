import LaunchIcon from '@mui/icons-material/Launch'
import Timeline from '@mui/lab/Timeline'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineOppositeContent, {
  timelineOppositeContentClasses
} from '@mui/lab/TimelineOppositeContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {getFormattedDateTimeForCompute} from '../../../utils/getDateString'
import {eventIcons} from './eventIcons'
import styles from './logsTimelineJSS'

interface IProps extends WithStyles<typeof styles> {
  onEventLinkClicked: (clusterRuntimeId: string) => void
  collapsedEventsData?: any
  eventsData?: any
  clusterRuntimeId?: string
  lastElementRef?: any
  computeCurrentStatus: string
}

const logsTimeline = (props: IProps) => {
  const {
    classes,
    onEventLinkClicked,
    collapsedEventsData,
    eventsData,
    clusterRuntimeId,
    lastElementRef,
    computeCurrentStatus
  } = props

  const getEventIconClass = (eventName: string) => {
    if (eventName === 'Starting' || eventName === 'Started') {
      return classes.startingIcon
    } else if (eventName === 'Stopped') {
      return classes.stoppedIcon
    }

    return eventIcons.all
  }

  const getEventIcon = (eventName: string) => {
    if (eventIcons[eventName]) {
      return eventIcons[eventName]
    }

    return eventIcons.all
  }

  const getLogsLink = (description: string) => {
    let [text, link] = description.split('##')
    if (link) {
      return (
        <>
          {text}
          <a
            href={link}
            target='_blank'
            rel='noopener noreferrer'
            className={classes.logsLink}
          >
            <span className={'text-part'}>View Logs</span>{' '}
            <LaunchIcon sx={{height: '16px', width: '20px'}} />
            {/* <span className={`${Icons.ICON_OPEN_IN_NEW} icon-part`} /> */}
          </a>
        </>
      )
    }
    return <>{text}</>
  }

  return (
    <div className={classes.container} ref={lastElementRef}>
      <div className={classes.scrollContainer}>
        <Timeline
          sx={{
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.25
            }
          }}
        >
          {collapsedEventsData && (
            <>
              <TimelineItem>
                <TimelineOppositeContent>
                  <span className={classes.description}>
                    {getFormattedDateTimeForCompute(
                      collapsedEventsData.last_event.timestamp
                    )}
                  </span>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <span
                    className={`${getEventIcon(
                      collapsedEventsData.last_event.event_name
                    )} ${classes.eventIcon} ${getEventIconClass(
                      collapsedEventsData.last_event.event_name
                    )}`}
                  />
                  {collapsedEventsData.count_of_events > 1 && (
                    <TimelineConnector className={classes.connector} />
                  )}
                </TimelineSeparator>
                <TimelineContent>
                  <span className={classes.text}>
                    {collapsedEventsData.last_event.event_name} -
                  </span>
                  <span className={classes.description}>
                    {getLogsLink(
                      collapsedEventsData.last_event.event_description
                    )}
                  </span>
                </TimelineContent>
              </TimelineItem>
              {collapsedEventsData.count_of_events > 1 && (
                <TimelineItem>
                  <TimelineOppositeContent></TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineConnector
                      className={`${classes.connector} ${classes.eventLinkSeprator}`}
                    />
                  </TimelineSeparator>
                  <TimelineContent
                    className={classes.eventLink}
                    onClick={() => onEventLinkClicked(clusterRuntimeId)}
                  >
                    {collapsedEventsData.count_of_events} Events
                  </TimelineContent>
                </TimelineItem>
              )}

              {collapsedEventsData.count_of_events > 1 && (
                <TimelineItem>
                  <TimelineOppositeContent>
                    <span className={classes.description}>
                      {getFormattedDateTimeForCompute(
                        collapsedEventsData.first_event.timestamp
                      )}
                    </span>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <span
                      className={`${getEventIcon(
                        collapsedEventsData.first_event.event_name
                      )} ${classes.eventIcon} ${getEventIconClass(
                        collapsedEventsData.first_event.event_name
                      )}`}
                    />
                  </TimelineSeparator>
                  <TimelineContent>
                    <span className={classes.text}>
                      {collapsedEventsData.first_event.event_name} -
                    </span>
                    <span className={classes.description}>
                      {getLogsLink(
                        collapsedEventsData.first_event.event_description
                      )}
                    </span>
                  </TimelineContent>
                </TimelineItem>
              )}
            </>
          )}

          {eventsData && (
            <>
              {eventsData.map((event, idx) => {
                return (
                  <TimelineItem>
                    <TimelineOppositeContent>
                      <span className={classes.description}>
                        {getFormattedDateTimeForCompute(event.timestamp)}
                      </span>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <span
                        className={`${getEventIcon(event.event_name)} ${
                          classes.eventIcon
                        } ${getEventIconClass(event.event_name)}`}
                      />
                      {idx < eventsData.length - 1 && (
                        <TimelineConnector
                          className={`${classes.connector} ${classes.longConnector}`}
                        />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <span className={classes.text}>{event.event_name} -</span>
                      <span className={classes.description}>
                        {getLogsLink(event.event_description)}
                      </span>
                    </TimelineContent>
                  </TimelineItem>
                )
              })}
            </>
          )}
        </Timeline>
      </div>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(logsTimeline)

export default styleComponent
