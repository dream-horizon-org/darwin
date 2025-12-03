import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import Button from '@mui/material/Button'
import Menu, {MenuProps} from '@mui/material/Menu'
import {styled} from '@mui/material/styles'
import React from 'react'
import {
  Button as SportaButton,
  ButtonSizes,
  ButtonVariants
} from '../../bit-components/button/index'

import {WithStyles, withStyles} from '@mui/styles'
import {DateRangePicker} from 'react-date-range'
import 'react-date-range/dist/styles.css' // main css file
import 'react-date-range/dist/theme/default.css' // theme css file
import {aliasTokens} from '../../theme.contants'

import {getFormatedDateRange} from '../workflows/workfowRuns/utils'
import styles from './indexJSS'

export interface IFeatureGroupFiltersValues {
  [key: string]: boolean
}

export interface IFeatureGroupFilters {
  name: string
  values: IFeatureGroupFiltersValues
}

const StyledMenu = styled((props: MenuProps & {spendsTheme: string}) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right'
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right'
    }}
    {...props}
  />
))(({theme, spendsTheme}) => {
  return {
    '& .MuiPaper-root': {
      borderRadius: 6,
      marginTop: theme.spacing(1),
      minWidth: 180,
      backgroundColor: aliasTokens.surface_background_color,
      border: 'none',
      boxShadow: '0px 4px 10px #00000040',
      paddingBottom: '8px',
      '& .MuiMenu-list': {
        padding: '0'
      }
    }
  }
})

const defaultDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: 'selection'
}
export interface IDateRange {
  startDate: Date
  endDate: Date
}

interface IProps extends WithStyles<typeof styles> {
  dateRange: IDateRange
  error?: any
  disabled?: boolean
  setSelectedDateRange: (dateRange: IDateRange) => void
  onReset: () => void
}

const FormDateFilterDropwdown = (props: IProps): JSX.Element => {
  const {
    classes,
    dateRange,
    error,
    setSelectedDateRange,
    onReset,
    disabled = false
  } = props
  const {startDate, endDate} = dateRange
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const [selectionDateRange, setSelectionDateRange] = React.useState({
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    key: 'selection'
  })

  const handleOnChange = (ranges) => {
    if (disabled) return
    const {selection} = ranges
    setSelectionDateRange(selection)
  }

  const onResetDate = () => {
    setSelectionDateRange({
      startDate: null,
      endDate: null,
      key: 'selection'
    })
    onReset()
  }

  React.useEffect(() => {
    if (dateRange?.startDate || dateRange?.endDate) {
      setSelectionDateRange({
        startDate: new Date(dateRange.startDate),
        endDate: new Date(dateRange.endDate),
        key: 'selection'
      })
    }
  }, [dateRange])

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
        endIcon={
          <span
            style={{
              color: aliasTokens.form_field_icon_color
            }}
          >
            <CalendarTodayIcon color={'inherit'} fontSize='inherit' />
          </span>
        }
        className={`${classes.filterButton} ${
          (selectionDateRange.startDate && selectionDateRange.endDate) || open
            ? 'active'
            : ''
        }${error ? ' error' : ''}${disabled ? ' disabled' : ''}`}
      >
        {/* date format in dd/mm/yyyy */}
        {selectionDateRange?.startDate && selectionDateRange?.endDate ? (
          <>
            {getFormatedDateRange(
              selectionDateRange.startDate,
              selectionDateRange.endDate
            )}
          </>
        ) : (
          <span className={classes.placeholder}>DD/MM/YYYY - DD/MM/YYY</span>
        )}
      </Button>
      <StyledMenu
        id='demo-customized-menu'
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        spendsTheme={'dark'}
      >
        <div className={classes.dateRangeWrapper}>
          <DateRangePicker
            editableDateInputs={true}
            onChange={handleOnChange}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            showMonthAndYearPickers={true}
            months={2}
            ranges={
              selectionDateRange?.startDate || selectionDateRange?.endDate
                ? [selectionDateRange]
                : [defaultDateRange]
            }
            direction='horizontal'
            inputRanges={[]}
          />
          <div className={classes.actionContainer}>
            <SportaButton
              buttonText='Reset'
              size={ButtonSizes.SMALL}
              onClick={() => {
                onResetDate()
                handleClose()
              }}
              variant={ButtonVariants.TERTIARY}
            />
            <SportaButton
              buttonText='Apply'
              size={ButtonSizes.SMALL}
              onClick={() => {
                setSelectedDateRange(selectionDateRange)
                handleClose()
              }}
            />
          </div>
        </div>
      </StyledMenu>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  FormDateFilterDropwdown
)

export default StyleComponent
