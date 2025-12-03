import withStyles, {WithStyles} from '@mui/styles/withStyles'
import * as React from 'react'
import styles from './indexJss'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {Checkbox, FormGroup} from '@mui/material'
import Button from '@mui/material/Button'
import Menu, {MenuProps} from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {styled} from '@mui/material/styles'
import {useEffect} from 'react'
import {formattedSnakeString} from '../../modules/workflows/pages/workflows/utils'
import {aliasTokens} from '../../theme.contants'
import {
  IFeatureGroupFilters,
  IFeatureGroupFiltersValues
} from '../featureStore/featureGroupsHeader'
import SearchBar from '../searchBar'

const StyledMenu = styled((props: MenuProps) => (
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
))(({theme}) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    backgroundColor: aliasTokens.tertiary_background_color,
    border: 'none',
    boxShadow: '0px 4px 10px #00000040',
    paddingBottom: '8px',
    '& .MuiMenu-list': {
      padding: '0'
    },
    '& .MuiMenuItem-root': {
      margin: '1px 8px',
      borderRadius: '4px',
      padding: '8px 10px',
      '&:active': {
        backgroundColor: aliasTokens.cta_disabled_secondary_background_color
      },
      '&:hover': {
        backgroundColor: aliasTokens.cta_disabled_secondary_background_color
      },
      '& .MuiCheckbox-root': {
        padding: '0 10px 0 0'
      },
      '& .MuiSvgIcon-root': {
        color: aliasTokens.active_border_color
      }
    }
  }
}))

interface IProps extends WithStyles<typeof styles> {
  data: IFeatureGroupFilters
  selectFilters: (f: IFeatureGroupFiltersValues) => void
  dataTestId?: string
  capitalizeFirstLetter?: boolean
}
const maxCharLimit = 15

const FilterDrop = (props: IProps): JSX.Element => {
  const {
    classes,
    data,
    selectFilters,
    capitalizeFirstLetter = false,
    dataTestId
  } = props
  const [searchStr, setSearchStr] = React.useState('')
  const [filterName] = React.useState<IFeatureGroupFilters['name']>(data.name)
  const selectedFiltersCount = Object.values(data.values).reduce(
    (acc, curr) => (acc += Number(curr)),
    0
  )
  const [filters, setFilters] = React.useState<IFeatureGroupFiltersValues>(
    data.values
  )
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setFilters(data.values)
    setAnchorEl(null)
  }

  const applyAndClose = () => {
    setAnchorEl(null)
    const currentFilters = Object.values(filters)
    const isNotChanged = Object.values(data.values).every((filter, fIdx) => {
      const num1 = Number(filter)
      const num2 = Number(currentFilters[fIdx])
      return !Boolean(num1 ^ num2)
    })
    if (!isNotChanged) selectFilters(filters)
  }

  const clearFilters = () => {
    const emptyFilters = Object.keys(filters).reduce((acc, f) => {
      acc[f] = false
      return acc
    }, {})
    const currentFilters = Object.values(emptyFilters)
    const isNotChanged = Object.values(data.values).every((filter, fIdx) => {
      const num1 = Number(filter)
      const num2 = Number(currentFilters[fIdx])
      return !Boolean(num1 ^ num2)
    })
    if (!isNotChanged) {
      selectFilters(emptyFilters)
    } else {
      setFilters(data.values)
    }
    setAnchorEl(null)
  }

  useEffect(() => {
    setFilters(data.values)
  }, [data.values])

  const toggleFilter = (filter: string) => {
    setFilters({
      ...filters,
      [filter]: !filters[filter]
    })
  }

  const filteredResult = Object.keys(filters).filter((f) =>
    f.toLowerCase().includes(searchStr.toLowerCase())
  )

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
        data-testid={dataTestId}
        endIcon={<KeyboardArrowDownIcon />}
        className={`${classes.filterButton} ${
          selectedFiltersCount > 0 ? 'active' : ''
        }`}
      >
        {filterName.length > maxCharLimit
          ? filterName.substring(0, maxCharLimit) + '...'
          : filterName}{' '}
        {selectedFiltersCount > 0 ? `(${selectedFiltersCount})` : null}
      </Button>
      <StyledMenu
        id='demo-customized-menu'
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <div className={classes.searchContainer}>
          <SearchBar
            value={searchStr}
            onValueChange={setSearchStr}
            placeholder={''}
          />
        </div>
        <FormGroup>
          {filteredResult.map((f) => (
            <MenuItem
              disableRipple
              key={f}
              onClick={(e) => {
                toggleFilter(f)
                e.stopPropagation()
              }}
              data-testid='filter-drop-option'
              className={filters[f] && classes.activeItem}
            >
              <Checkbox checked={filters[f]} />
              <div className={classes.checkBoxLabel}>
                {capitalizeFirstLetter ? formattedSnakeString(f) : f}
              </div>
            </MenuItem>
          ))}
          {filteredResult.length === 0 ? (
            <MenuItem disableRipple key={'no-result'}>
              <div className={classes.checkBoxLabel}>{'No Filters!'}</div>
            </MenuItem>
          ) : null}
        </FormGroup>
        <div className={classes.actionContainer}>
          <Button
            color='primary'
            variant='contained'
            size='small'
            onClick={() => {
              applyAndClose()
            }}
          >
            Apply
          </Button>
          <Button
            color='primary'
            variant='text'
            size='small'
            onClick={() => {
              clearFilters()
            }}
          >
            Reset
          </Button>
        </div>
      </StyledMenu>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(FilterDrop)

export default styleComponent
