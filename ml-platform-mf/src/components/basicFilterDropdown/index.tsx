import withStyles, {WithStyles} from '@mui/styles/withStyles'
import * as React from 'react'
import styles from './indexJss'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {Checkbox, FormGroup} from '@mui/material'
import Button from '@mui/material/Button'
import Menu, {MenuProps} from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {styled} from '@mui/material/styles'
import {Search} from '../../bit-components/search/index'
import {aliasTokens} from '../../theme.contants'
import {IBasicFilterDropdown, IBasicFilterDropdownValues} from './constants'

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
      padding: '0',
      paddingTop: '8px'
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
  data: IBasicFilterDropdown<string>
  selectFilters: (f: IBasicFilterDropdownValues) => void
  searchable?: boolean
  label?: string
  size?: string
  showCount?: boolean
}
const maxCharLimit = 15

const BasicFilterDropdown = (props: IProps): JSX.Element => {
  const {
    classes,
    data,
    selectFilters,
    searchable = false,
    label,
    size = '12px',
    showCount = false
  } = props
  const [searchStr, setSearchStr] = React.useState('')
  const [filterName] = React.useState<IBasicFilterDropdown<string>['name']>(
    label || data.name
  )
  const selectedFiltersCount = Object.values(data.values).reduce(
    (acc, curr) => (acc += Number(curr)),
    0
  )
  const [filters, setFilters] = React.useState<IBasicFilterDropdownValues>(
    data.values
  )
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
    const defaultFilters = Object.values(filters)
    const isNotChanged = Object.values(data.values).every((filter, fIdx) => {
      const num1 = Number(filter)
      const num2 = Number(defaultFilters[fIdx])
      return !Boolean(num1 ^ num2)
    })
    if (!isNotChanged) selectFilters(filters)
  }

  const toggleFilter = (filter: string) => {
    setFilters({
      ...filters,
      [filter]: !filters[filter]
    })
  }

  const filteredResult = Object.keys(filters).filter((f) =>
    f.includes(searchStr)
  )

  return (
    <div>
      <Button
        id='basic-filter-dropdown-button'
        aria-controls={open ? 'basic-filter-dropdown-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        variant='contained'
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        className={`${classes.filterButton} ${
          selectedFiltersCount > 0 ? 'active' : ''
        }`}
        sx={{
          fontSize: `${size} !important`
        }}
        data-testid='basic-filter-dropdown-button'
      >
        {filterName.length > maxCharLimit
          ? filterName.substring(0, maxCharLimit) + '...'
          : filterName}{' '}
        {showCount && selectedFiltersCount > 0
          ? `(${selectedFiltersCount})`
          : null}
      </Button>
      <StyledMenu
        id='basic-filter-dropdown-menu'
        MenuListProps={{
          'aria-labelledby': 'basic-filter-dropdown-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {searchable ? (
          <div className={classes.searchContainer}>
            <Search
              initiaValue={searchStr}
              onSearch={setSearchStr}
              onChangeForSearchBy={setSearchStr}
              placeholder={''}
              disabled={false}
            />
          </div>
        ) : null}
        <FormGroup>
          {filteredResult.map((f) => (
            <MenuItem
              disableRipple
              key={f}
              onClick={(e) => {
                toggleFilter(f)
                e.stopPropagation()
              }}
              className={filters[f] && classes.activeItem}
              data-testid={`basic-filter-dropdown-menu-item-${f}`}
            >
              <Checkbox checked={filters[f]} />
              <div className={classes.checkBoxLabel}>{f}</div>
            </MenuItem>
          ))}
          {filteredResult.length === 0 ? (
            <MenuItem disableRipple key={'no-result'}>
              <div className={classes.checkBoxLabel}>{'No Filters!'}</div>
            </MenuItem>
          ) : null}
        </FormGroup>
      </StyledMenu>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(
  BasicFilterDropdown
)

export default styleComponent
