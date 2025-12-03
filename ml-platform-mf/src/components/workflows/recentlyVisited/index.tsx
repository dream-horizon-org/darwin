import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {ShellLoading} from '../../../bit-components/shell-loading/index'
import {getRecentlyVisitedWorkflows} from '../../../modules/workflows/graphqlAPIs/getRecentlyVisitedWorkflows/index.thunk'
import {
  SHELL_LOADER_HEIGHT_RECENTLY_CREATED,
  SHELL_LOADER_WIDTH_RECENTLY_CREATED
} from '../../../modules/workflows/pages/workflows/constants'
import {IWorkflowsState} from '../../../modules/workflows/pages/workflows/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import RecentlyVisitedWorkflow from '../recentlyVisitedWorkflow'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  recentlyVisited: IWorkflowsState['recentlyVisited']
  getRecentlyVisitedWorkflows: () => void
}

const RecentlyVisited = (props: IProps) => {
  const {classes, recentlyVisited, getRecentlyVisitedWorkflows} = props

  useEffect(() => {
    getRecentlyVisitedWorkflows()
  }, [])

  return recentlyVisited?.data?.length > 0 ||
    recentlyVisited?.status === API_STATUS.LOADING ? (
    <div className={classes.container}>
      <div className={classes.heading}>Recently Visited</div>
      <div className={classes.list}>
        {recentlyVisited?.status === API_STATUS.LOADING ? (
          <>
            <ShellLoading
              height={SHELL_LOADER_HEIGHT_RECENTLY_CREATED}
              width={SHELL_LOADER_WIDTH_RECENTLY_CREATED}
            />
            <ShellLoading
              height={SHELL_LOADER_HEIGHT_RECENTLY_CREATED}
              width={SHELL_LOADER_WIDTH_RECENTLY_CREATED}
            />
            <ShellLoading
              height={SHELL_LOADER_HEIGHT_RECENTLY_CREATED}
              width={SHELL_LOADER_WIDTH_RECENTLY_CREATED}
            />
          </>
        ) : (
          recentlyVisited?.data?.map((recentlyVisitedWorkflow) => (
            <RecentlyVisitedWorkflow data={recentlyVisitedWorkflow} />
          ))
        )}
      </div>
    </div>
  ) : (
    <></>
  )
}

const mapStateToProps = (state: CommonState) => ({
  recentlyVisited: state.workflowsReducer.recentlyVisited
})

const mapDispatchToProps = (dispatch) => {
  return {
    getRecentlyVisitedWorkflows: () => getRecentlyVisitedWorkflows(dispatch)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(RecentlyVisited)

export default StyleComponent
