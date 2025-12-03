import {Card, Typography} from '@mui/material'
import cronstrue from 'cronstrue'
import React, {useEffect, useState} from 'react'
import {DataList} from '../../../../../../components/dataList/dataList'
import {useGQL} from '../../../../../../utils/useGqlRequest'
import {SelectionOnFeatureGroup} from '../../fetchFeatureGroup'
import {columnConfig} from '../schedulerJobConfig'
import {useStyles} from '../styles'
import {
  FetchScheduleJobRuns,
  FetchScheduleJobRunsInput
} from './fetchScheduleJobRuns'
import {FetchScheduleJobRunsSchema} from './fetchScheduleJobRuns.gqlTypes'
import {GQL as fetchScheduleJobRunsGql} from './fetchScheduleJobRunsGql'

interface IProps {
  version: number
  featureGroupId: string
  featureGroupDetails: SelectionOnFeatureGroup
}

export const ScheduleJob = (props: IProps) => {
  const {version, featureGroupId, featureGroupDetails} = props
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(10)

  const {
    output: {response, loading},
    triggerGQLCall: triggerFetchScheduleJobRunsGQLCall
  } = useGQL<FetchScheduleJobRunsInput, FetchScheduleJobRuns>()

  useEffect(() => {
    const variables = {featureGroupId, version: +version, offset, limit}
    triggerFetchScheduleJobRunsGQLCall(
      {...fetchScheduleJobRunsGql, variables},
      FetchScheduleJobRunsSchema
    )
  }, [offset, limit])

  const onPageChange = (page, rowsPerPage) => {
    setOffset(page * rowsPerPage)
  }

  const onPageSizeChange = (newPageSize) => {
    setLimit(newPageSize)
  }

  const classes = useStyles({})
  const list = response?.fetchScheduleJobRuns?.response?.schedulerJobRunDetails
  return (
    <Card className={classes.section}>
      <div>
        <div className={classes.header}>Schedule Job</div>
        <div className={classes.contentBox}>
          <div className={classes.infoBox}>
            <Typography variant='caption' className={classes.captionText}>
              Resource Tier
            </Typography>
            <Typography variant='body2'>
              {featureGroupDetails.scheduleJob.resourceTier}
            </Typography>
          </div>
          <div className={classes.infoBox}>
            <Typography variant='caption' className={classes.captionText}>
              Cron
            </Typography>
            <Typography variant='body2'>
              {featureGroupDetails?.scheduleJob?.schedule === '@once'
                ? '@once'
                : featureGroupDetails?.scheduleJob?.schedule}
            </Typography>
            <Typography variant='caption' style={{marginTop: 4}}>
              {featureGroupDetails?.scheduleJob?.schedule === '@once'
                ? '@once'
                : cronstrue.toString(
                    featureGroupDetails?.scheduleJob?.schedule,
                    {
                      throwExceptionOnParseError: false
                    }
                  )}
            </Typography>
          </div>
        </div>
      </div>
      <DataList
        data={list}
        stickyHeader={true}
        columnConfig={columnConfig(classes)}
        singleSelection={false}
        shouldEnableSelection={false}
        rowsPerPageOptions={[10, 50, 100]}
        rowsPerPage={10}
        showEmptyRows={false}
        loader={loading}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        noResultsFound={!list || list.length === 0}
        noResultsFoundMessage='Data will be displayed after first run'
      />
    </Card>
  )
}
