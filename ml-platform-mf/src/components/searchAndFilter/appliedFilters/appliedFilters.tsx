import {Button, Chip} from '@mui/material'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React from 'react'
import {compose} from 'redux'
import {IFilters, IOwner, ITag, OWNER, TAG} from '../../../types/filters.type'

import styles from './appliedFiltersJSS'

interface IProps extends WithStyles<typeof styles> {
  appliedFilters: IFilters
  onFillterRemoveClicked: (type: string, filter: IOwner | ITag) => void
  onAllFiltersRemoved: () => void
}

const AppliedFilters = (props: IProps) => {
  const {classes} = props
  return (
    <div className={classes.root}>
      {props.appliedFilters.tags.map((tag) => (
        <Chip
          label={tag.name}
          onDelete={() => props.onFillterRemoveClicked(TAG, tag)}
          color='primary'
          className={classes.chip}
        />
      ))}
      {props.appliedFilters.owners.map((owner) => (
        <Chip
          label={owner.name}
          onDelete={() => props.onFillterRemoveClicked(OWNER, owner)}
          color='primary'
          className={classes.chip}
        />
      ))}
      <Button
        className={classes.clearFilterBtn}
        onClick={props.onAllFiltersRemoved}
      >
        CLEAR FILTER
      </Button>
    </div>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(
  AppliedFilters
)

export default styleComponent
