import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {
  Tags,
  TagsSizes,
  TagsType
} from '../../../bit-components/tags/tags/index'

import {routes} from '../../../constants'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {
  getTagsType,
  onClusterLinkClicked
} from '../../../modules/workflows/pages/workflows/utils'
import {aliasTokens} from '../../../theme.contants'
import {getFormattedDateTime} from '../allWorkflows/utils'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  setShowSidePanel: (a: boolean) => void
}

const WorkflowDetailsClosedSidePanel = (props: IProps) => {
  const {classes, setShowSidePanel} = props

  return (
    <div className={classes.container}>
      <div
        className={classes.collapseIconContainer}
        onClick={() => setShowSidePanel(true)}
        data-testid='side-panel-expand-button'
      >
        <KeyboardArrowLeftIcon className={classes.collapseIcon} />
      </div>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  WorkflowDetailsClosedSidePanel
)

export default StyleComponent
