import CloseIcon from '@material-ui/icons/Close'
import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'
import {
  ISidepanel,
  SIDEPANEL_TYPES
} from '../../../modules/workflows/pages/workflowCreate'
import JobClusterDetails from '../jobClusterDetails'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  setSidepanel: React.Dispatch<React.SetStateAction<ISidepanel>>
  clusterDefnitionId: String
}

const JobClusterDetailsDrawer = (props: IProps) => {
  const {classes, setSidepanel, clusterDefnitionId} = props

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
        <div className={classes.containerHeaderTitle}>Cluster Definition</div>
      </div>
      <JobClusterDetails
        clusterDefinitionId={clusterDefnitionId}
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
  JobClusterDetailsDrawer
)

export default StyleComponent
