import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {Button, Menu, MenuItem} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'

import {menuOptions} from './constants'
import styles from './sortProjectJSS'

interface IProps extends WithStyles<typeof styles> {
  sortBy: {id: string; label: string}
  onChangeSortBy: (value: any) => void
}

const SortProject = (props: IProps) => {
  const {classes, sortBy, onChangeSortBy} = props
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = (value) => {
    setAnchorEl(null)
    onChangeSortBy(value)
  }

  return (
    <div>
      <Button
        id='basic-button'
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size={'small'}
        endIcon={<KeyboardArrowDownIcon />}
        variant={'text'}
        className={classes.dropdownBtn}
      >
        {sortBy.label}
      </Button>
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
        PaperProps={{
          style: {
            background: 'rgb(51, 51, 51)',
            opacity: 1
          }
        }}
        defaultValue={sortBy.id}
      >
        {menuOptions.map((menu) => (
          <MenuItem
            onClick={() => handleClose(menu)}
            className={classes.menuItem}
          >
            {menu.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(SortProject)

export default styleComponent
