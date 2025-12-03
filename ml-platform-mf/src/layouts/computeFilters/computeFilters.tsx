import Chip from '@mui/material/Chip'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'

import styles from './computeFiltersJSS'

interface IProps extends WithStyles<typeof styles> {
  activeFilters: string[]
  onFilterToggled: (value: string) => void
}

const computeFilters = (props: IProps) => {
  const {classes, activeFilters, onFilterToggled} = props

  const isFilterActive = (currentFilter, filters) =>
    filters.some((filter) => filter === currentFilter)

  return (
    <div className={classes.container}>
      <Chip
        label='Active'
        className={`${classes.filter} ${
          isFilterActive('active', activeFilters) ? classes.activeFilter : ''
        }`}
        onClick={() => onFilterToggled('active')}
      />
      <Chip
        label='Inactive'
        className={`${classes.filter} ${
          isFilterActive('inactive', activeFilters) ? classes.activeFilter : ''
        }`}
        onClick={() => onFilterToggled('inactive')}
      />
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(computeFilters)

export default styleComponent
