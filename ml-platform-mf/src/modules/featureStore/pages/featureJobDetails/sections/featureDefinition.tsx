import {Card, Typography} from '@mui/material'
import React from 'react'
import {SelectionOnFeatureGroup} from '../fetchFeatureGroup'
import {useStyles} from './styles'

interface IProps {
  featureGroupDetails: SelectionOnFeatureGroup
}

export const FeatureDefinition = (props: IProps) => {
  const {name, tags, description} = props.featureGroupDetails
  const classes = useStyles({})

  return (
    <Card className={classes.card}>
      <div className={classes.header} data-test={'round-details-header'}>
        Feature Group Definition
      </div>
      <div className={classes.contentBox}>
        <div className={classes.infoBox}>
          <Typography variant='caption' className={classes.captionText}>
            Title
          </Typography>
          <Typography variant='body2'>{name}</Typography>
        </div>
        <div className={classes.infoBoxLarge}>
          <Typography variant='caption' className={classes.captionText}>
            Description
          </Typography>
          <Typography variant='body2'>{description}</Typography>
        </div>
        <div className={classes.infoBox}>
          <Typography variant='caption' className={classes.captionText}>
            Tags
          </Typography>
          <div className={classes.tags}>
            {tags.map((tag) => (
              <div key={tag} className={classes.tag}>
                {tag}
              </div>
            ))}
          </div>
        </div>
        <div className={classes.infoBoxLarge}>
          <Typography variant='caption' className={classes.captionText}>
            Slack Notification
          </Typography>
          <Typography variant='body2'>{'ds_sample_channel_V0'}</Typography>
        </div>
      </div>
    </Card>
  )
}
