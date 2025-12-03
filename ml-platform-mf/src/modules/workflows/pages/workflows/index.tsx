import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import useQuery, {WorkflowsQueryParams} from '../../../../components/useQuery'
import AllWorkflows from '../../../../components/workflows/allWorkflows'
import ListHeader from '../../../../components/workflows/listHeader'
import RecentlyCreated from '../../../../components/workflows/recentlyCreated'
import RecentlyVisited from '../../../../components/workflows/recentlyVisited'
import {EventTypes, SeverityTypes} from '../../../../types/events.types'
import {logEvent} from '../../../../utils/events'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {}

const Workflows = (props: IProps) => {
  const {classes} = props
  const query = useQuery()

  const filtersContainsData = () => {
    return (
      query?.get(WorkflowsQueryParams.QUERY) ||
      query?.get(WorkflowsQueryParams.FILTERS)?.length > 24
    )
  }

  useEffect(() => {
    logEvent(EventTypes.WORKFLOWS.LIST_OPEN, SeverityTypes.INFO)
  }, [])
  return (
    <div className={classes.container}>
      <ListHeader />
      {!filtersContainsData() && <RecentlyVisited />}
      {!filtersContainsData() && <RecentlyCreated />}
      <AllWorkflows />
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(Workflows)

export default StyleComponent
