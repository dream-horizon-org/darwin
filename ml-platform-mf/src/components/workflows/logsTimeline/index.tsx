import CloseIcon from '@mui/icons-material/Close'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import {Dialog, DialogContent, DialogTitle, IconButton} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'
import {getFormattedDateTimeForCompute} from '../../../utils/getDateString'
import {eventIcons} from './constant'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {}

const events = [
  {
    timestamp: '2021-10-10T10:10:10.000Z',
    status: 'failed',
    message: 'Run failed'
  },
  {
    timestamp: '2021-10-10T10:10:10.000Z',
    status: 'running',
    message: 'Cluster is running'
  },
  {
    timestamp: '2021-10-10T10:10:10.000Z',
    status: 'started',
    message: 'Started By Mohit s.'
  }
]

const LogsTimeline = (props: IProps) => {
  const {classes} = props
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  const getEventIconClass = (eventName: string) => {
    if (eventName === 'started') {
      return classes.startingIcon
    } else if (eventName === 'failed') {
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

  return (
    <div>
      <button onClick={handleClickOpen}>Open Dialog</button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <div>Task Events</div>
          <IconButton
            aria-label='close'
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {events.map((event, idx) => {
            return (
              <TimelineItem>
                <TimelineOppositeContent>
                  <span className={classes.description}>
                    {getFormattedDateTimeForCompute(event.timestamp)}
                  </span>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <span
                    className={`${getEventIcon(event.status)} ${
                      classes.eventIcon
                    } ${getEventIconClass(event.status)}`}
                  />
                  {idx < events.length - 1 && (
                    <TimelineConnector
                      className={`${classes.connector} ${classes.longConnector}`}
                    />
                  )}
                </TimelineSeparator>
                <TimelineContent className={classes.timelineContent}>
                  <span className={classes.text}>{event.message}</span>
                </TimelineContent>
              </TimelineItem>
            )
          })}
        </DialogContent>
      </Dialog>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(LogsTimeline)

export default styleComponent
