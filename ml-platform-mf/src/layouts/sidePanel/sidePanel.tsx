import {Link} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {
  Button,
  ButtonSizes,
  ButtonVariants
} from '../../bit-components/button/index'
import {Chip} from '../../bit-components/chip/index'
import {Icons} from '../../bit-components/icon/index'
import {Surface, SurfaceTypes} from '../../bit-components/surface/index'
import Spinner from '../../components/spinner/spinner'
import {
  formatTime,
  getFormattedDateTimeForCompute
} from '../../utils/getDateString'
import ClusterManage from '../clusterManage/clusterManage'

import styles from './sidePanelJSS'

interface IProps extends WithStyles<typeof styles> {
  loadingData: boolean
  clusterName: string
  jupyterLabLink: string
  tags: string[]
  createdOn: string
  clusterId: string
  clusterStatus: string
  onStopClusterClicked: (clusterId: string) => void
  onDeleteClusterClicked: (clusterId: string) => void
  onStartClusterClicked: (clusterId: string) => void
  onReStartClusterClicked: (clusterId: string) => void
}

const SidePanel = (props: IProps) => {
  const {
    classes,
    loadingData,
    clusterName,
    jupyterLabLink,
    tags,
    createdOn,
    clusterId,
    clusterStatus,
    onStopClusterClicked,
    onDeleteClusterClicked,
    onStartClusterClicked,
    onReStartClusterClicked
  } = props

  const onOpenJupyterLink = () => {
    window.open(`http://${jupyterLabLink}`, '_blank')
  }

  return (
    <div className={classes.sidePanel}>
      <Surface type={SurfaceTypes.Primary}>
        <div className={classes.detailsContainer}>
          {loadingData ? (
            <div className={classes.spinnerContainer}>
              <Spinner show={true} />
            </div>
          ) : (
            <>
              <div className={classes.detailsContainerHeader}>
                <h3 className={classes.detailsContainerHeading}>
                  {clusterName}
                </h3>
                <ClusterManage
                  clusterId={clusterId}
                  clusterStatus={clusterStatus}
                  onStopClusterClicked={onStopClusterClicked}
                  onDeleteClusterClicked={onDeleteClusterClicked}
                  onStartClusterClicked={onStartClusterClicked}
                  onReStartClusterClicked={onReStartClusterClicked}
                />
              </div>

              <div className={classes.detailsSection}>
                <div className={classes.detailsSectionHeading}>Tags:</div>
                <div className={classes.detailsSectionTags}>
                  {(tags || []).length < 1
                    ? '--'
                    : tags?.map((tag) => <Chip label={tag} key={tag} />)}
                </div>
              </div>
              <div className={classes.detailsSection}>
                <div className={classes.detailsSectionHeading}>Created On:</div>
                <div className={classes.createdOnText}>
                  {getFormattedDateTimeForCompute(createdOn)}
                </div>
              </div>
            </>
          )}
        </div>
      </Surface>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(SidePanel)

export default styleComponent
