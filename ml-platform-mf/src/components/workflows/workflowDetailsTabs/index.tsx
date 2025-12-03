import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {useHistory} from 'react-router-dom'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  tabs: string[]
  activeTab: number
  workflowId: string
}

const WorkflowDetailsTabs = (props: IProps) => {
  const {classes, tabs, activeTab, workflowId} = props
  const history = useHistory()

  const changeRouteForTab = (tab: string) => {
    let link = encodeURI(`/workflows/${workflowId}/runs`)
    switch (tab) {
      case 'Tasks':
        link = encodeURI(`/workflows/${workflowId}/tasks`)
        history.replace(link)
      default:
        history.replace(link)
    }
  }

  return (
    <div className={classes.tabContainer}>
      {tabs.map((tab, idx) => {
        return (
          <div
            className={`${classes.tab} ${activeTab === idx && 'active'}`}
            key={idx}
            onClick={() => changeRouteForTab(tab)}
            data-testid={`workflow-details-tab-${tab}`}
          >
            {tab}
          </div>
        )
      })}
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  WorkflowDetailsTabs
)

export default StyleComponent
