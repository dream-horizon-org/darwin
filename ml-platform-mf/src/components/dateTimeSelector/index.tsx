import React from 'react'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {Popover, TextField} from '@mui/material'
import Button from '@mui/material/Button'
import {WithStyles, withStyles} from '@mui/styles'
import styles, {timePickerDarkStyle, timePickerPoperDarkStyle} from './indexJSS'

import {DatePicker} from '../../bit-components/date-picker/date-picker/index'

import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns'
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider'
import {TimePicker as MaterialUTimePicker} from '@mui/x-date-pickers/TimePicker'

const maxCharLimit = 15

const timeSelections = [
  {
    label: 'Last 1 hour',
    getStartDate: () => {
      return new Date()
    },
    getEndDate: () => {
      return new Date()
    },
    getStartTime: () => {
      const startTime = new Date()
      startTime.setHours(startTime.getHours() - 1)
      return startTime
    },
    getEndTime: () => {
      return new Date()
    }
  },
  {
    label: 'Last 3 hour',
    getStartDate: () => {
      return new Date()
    },
    getEndDate: () => {
      return new Date()
    },
    getStartTime: () => {
      const startTime = new Date()
      startTime.setHours(startTime.getHours() - 3)
      return startTime
    },
    getEndTime: () => {
      return new Date()
    }
  },
  {
    label: 'Last 6 hour',
    getStartDate: () => {
      return new Date()
    },
    getEndDate: () => {
      return new Date()
    },
    getStartTime: () => {
      const startTime = new Date()
      startTime.setHours(startTime.getHours() - 6)
      return startTime
    },
    getEndTime: () => {
      return new Date()
    }
  },
  {
    label: 'Last 12 hour',
    getStartDate: () => {
      return new Date()
    },
    getEndDate: () => {
      return new Date()
    },
    getStartTime: () => {
      const startTime = new Date()
      startTime.setHours(startTime.getHours() - 12)
      return startTime
    },
    getEndTime: () => {
      return new Date()
    }
  },
  {
    label: 'Last 24 hour',
    getStartDate: () => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 1)
      return startDate
    },
    getEndDate: () => {
      return new Date()
    },
    getStartTime: () => {
      return new Date()
    },
    getEndTime: () => {
      return new Date()
    }
  },
  {
    label: 'Last 2 days',
    getStartDate: () => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 2)
      return startDate
    },
    getEndDate: () => {
      return new Date()
    },
    getStartTime: () => {
      return new Date()
    },
    getEndTime: () => {
      return new Date()
    }
  },
  {
    label: 'Last 7 days',
    getStartDate: () => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
      return startDate
    },
    getEndDate: () => {
      return new Date()
    },
    getStartTime: () => {
      return new Date()
    },
    getEndTime: () => {
      return new Date()
    }
  }
]

interface IProps extends WithStyles<typeof styles> {
  filterName: string
  startTime: Date
  endTime: Date
  startDate: Date
  endDate: Date
  onStartDateSelected: (date: Date) => void
  onEndDateSelected: (date: Date) => void
  onStartTimeSelected: (date: Date) => void
  onEndTimeSelected: (date: Date) => void
  onApplyDateAndTimeFilters: () => void
  onResetDateAndTimeFilters: () => void
  filterActive: boolean
  onSetAppliedDateFilters: (newAppliedFilters: any) => void
}

const DateTimeSelector = (props: IProps) => {
  const {
    classes,
    filterName,
    startTime,
    endTime,
    startDate,
    endDate,
    onStartDateSelected,
    onEndDateSelected,
    onStartTimeSelected,
    onEndTimeSelected,
    onApplyDateAndTimeFilters,
    onResetDateAndTimeFilters,
    filterActive,
    onSetAppliedDateFilters
  } = props
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const dark = timePickerDarkStyle()
  const darkPaper = timePickerPoperDarkStyle()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'date-popover' : undefined

  const onTimeSelectionClicked = (timeSelection: any) => {
    onStartDateSelected(timeSelection.getStartDate())
    onEndDateSelected(timeSelection.getEndDate())
    onStartTimeSelected(timeSelection.getStartTime())
    onEndTimeSelected(timeSelection.getEndTime())
    handleClose()
    onSetAppliedDateFilters({
      startDate: timeSelection.getStartDate(),
      endDate: timeSelection.getEndDate(),
      startTime: timeSelection.getStartTime(),
      endTime: timeSelection.getEndTime()
    })
  }

  const isApplyDateAndTimeFiltersDisabled = () => {
    return !startDate || !endDate || !startTime || !endTime
  }

  return (
    <div>
      <Button
        id='demo-customized-button'
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        variant='contained'
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        className={`${classes.filterButton} ${filterActive ? 'active' : ''}`}
      >
        {filterName.length > maxCharLimit
          ? filterName.substring(0, maxCharLimit) + '...'
          : filterName}{' '}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <div className={classes.popoverContainer}>
          <div className={classes.left}>
            {timeSelections.map((timeSelection) => {
              return timeSelection.label === 'Last 3 hour' ? (
                <div
                  onClick={() => onTimeSelectionClicked(timeSelection)}
                  data-testid='timestamp-drop-filter'
                >
                  {timeSelection.label}
                </div>
              ) : (
                <div onClick={() => onTimeSelectionClicked(timeSelection)}>
                  {timeSelection.label}
                </div>
              )
            })}
            <div className='selected'>Custom</div>
          </div>
          <div className={classes.right}>
            <div className={classes.datePicker}>
              <DatePicker
                label='Start Date'
                onChange={onStartDateSelected}
                value={startDate}
                theme='dark'
              />
            </div>
            <div className={classes.timePicker}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <MaterialUTimePicker
                  label={'Start Timestamp'}
                  value={startTime}
                  onChange={onStartTimeSelected}
                  renderInput={(params) => (
                    <TextField {...params} sx={dark} className='medium' />
                  )}
                  ampm={true}
                  PopperProps={{
                    sx: darkPaper
                  }}
                />
              </LocalizationProvider>
            </div>

            <div className={classes.datePicker}>
              <DatePicker
                label='End Date'
                value={endDate}
                onChange={onEndDateSelected}
              />
            </div>
            <div className={classes.timePicker}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <MaterialUTimePicker
                  label={'End Timestamp'}
                  value={endTime}
                  onChange={onEndTimeSelected}
                  renderInput={(params) => (
                    <TextField {...params} sx={dark} className='medium' />
                  )}
                  ampm={true}
                  PopperProps={{
                    sx: darkPaper
                  }}
                />
              </LocalizationProvider>
            </div>

            <div className={classes.actions}>
              <Button
                color='primary'
                onClick={() => {
                  onResetDateAndTimeFilters()
                }}
              >
                Clear
              </Button>

              <Button
                variant='contained'
                color='primary'
                autoFocus
                disabled={isApplyDateAndTimeFiltersDisabled()}
                onClick={() => {
                  handleClose()
                  onApplyDateAndTimeFilters()
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </Popover>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(DateTimeSelector)

export default styleComponent
