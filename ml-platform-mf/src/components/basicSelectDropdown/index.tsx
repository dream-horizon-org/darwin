import withStyles, {WithStyles} from '@mui/styles/withStyles'
import * as React from 'react'
import styles from './indexJss'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {FormGroup} from '@mui/material'
import Button from '@mui/material/Button'
import Menu, {MenuProps} from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {styled} from '@mui/material/styles'
import {aliasTokens} from '../../theme.contants'

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

export interface IBasicSelectDropdownOption<T> {
  label: string
  value: T
}

interface IProps<T> extends WithStyles<typeof styles> {
  options: Array<IBasicSelectDropdownOption<T>>
  selectOption: (f: IBasicSelectDropdownOption<T>) => void
  selectedOption: IBasicSelectDropdownOption<T>
}

const BasicSelectDropdown = (props: IProps<string>): JSX.Element => {
  const {classes, options, selectOption, selectedOption} = props
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div>
      <Button
        id='basic-select-dropdown-button'
        aria-controls={open ? 'basic-select-dropdown-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        variant='contained'
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        className={classes.filterButton}
        sx={{
          fontSize: `12px !important`
        }}
      >
        {selectedOption.label}
      </Button>
      <StyledMenu
        id='basic-select-dropdown-menu'
        MenuListProps={{
          'aria-labelledby': 'basic-select-dropdown-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <FormGroup>
          {options.map((f) => (
            <MenuItem
              disableRipple
              key={f.label}
              onClick={() => {
                handleClose()
                selectOption(f)
              }}
              className={f.value === selectedOption.value && classes.activeItem}
            >
              <div className={classes.checkBoxLabel}>{f.label}</div>
            </MenuItem>
          ))}
          {options.length === 0 ? (
            <MenuItem disableRipple key={'no-result'}>
              <div className={classes.checkBoxLabel}>{'No Options!'}</div>
            </MenuItem>
          ) : null}
        </FormGroup>
      </StyledMenu>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(
  BasicSelectDropdown
)

export default styleComponent
