import CloseIcon from '@material-ui/icons/Close'
import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'
import {
  ISidepanel,
  SIDEPANEL_TYPES
} from '../../../modules/workflows/pages/workflowCreate'
import JobClusterCreate from '../jobClusterCreate'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  setSidepanel: React.Dispatch<React.SetStateAction<ISidepanel>>
  clusterDefinitionId?: String
}

const JobClusterCreateDrawer = (props: IProps) => {
  const {classes, setSidepanel, clusterDefinitionId} = props

  return (
    <div className={classes.container}>
      <div className={classes.containerHeader}>
        <CloseIcon
          onClick={() => {
            setSidepanel({
              open: true,
              type: SIDEPANEL_TYPES.CLUSTER,
              data: null
            })
          }}
          className={classes.closeIcon}
        />
        <div className={classes.containerHeaderTitle}>
          Create Job Cluster Definition
        </div>
      </div>
      <JobClusterCreate
        clusterDefinitionId={clusterDefinitionId}
        goBack={() => {
          setSidepanel({
            open: true,
            type: SIDEPANEL_TYPES.CLUSTER,
            data: null
          })
        }}
      />
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  JobClusterCreateDrawer
)

export default StyleComponent
