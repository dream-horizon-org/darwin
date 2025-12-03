import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import {useHistory} from 'react-router'
import {compose} from 'redux'
import {ShellLoading} from '../../../bit-components/shell-loading/index'
import {routes} from '../../../constants'
import {GetWorkflowsInput} from '../../../modules/workflows/graphqlAPIs/getWorkflows'
import {getWorkflows} from '../../../modules/workflows/graphqlAPIs/getWorkflows/index.thunk'
import {
  SHELL_LOADER_HEIGHT,
  SHELL_LOADER_WIDTH
} from '../../../modules/workflows/pages/workflows/constants'
import {IWorkflowsState} from '../../../modules/workflows/pages/workflows/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import useQuery, {WorkflowsQueryParams} from '../../useQuery'
import RecentlyCreatedWorkflow from '../recentlyCreatedWorkflow'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  userDetails: any
  recentlyCreated: IWorkflowsState['recentlyCreated']
  getRecentlyCreatedWorkflows: (
    payload: GetWorkflowsInput,
    isRecentlyCreatedByYou: boolean
  ) => void
}

const RecentlyCreated = (props: IProps) => {
  const {classes, recentlyCreated, userDetails, getRecentlyCreatedWorkflows} =
    props
  const sortBy = 'created_by'
  const sortOrder = 'asc'
  const history = useHistory()
  const query = useQuery()
  const searchQuery = query.get(WorkflowsQueryParams.QUERY) || ''

  useEffect(() => {
    if (userDetails?.email) {
      const payload = {
        query: '',
        filters: {
          user: [userDetails.email],
          status: []
        },
        pageSize: 3,
        offset: 0,
        sortBy: sortBy,
        sortOrder: sortOrder
      }
      getRecentlyCreatedWorkflows(payload, true)
    }
  }, [userDetails])

  const onViewAllClicked = () => {
    history.replace({
      pathname: routes.workflows,
      search: `?${WorkflowsQueryParams.QUERY}=${searchQuery}&${
        WorkflowsQueryParams.FILTERS
      }=${JSON.stringify({
        users: [userDetails.email],
        status: []
      })}`
    })
  }

  return recentlyCreated?.data?.data?.length > 0 ||
    recentlyCreated?.status === API_STATUS.LOADING ? (
    <div className={classes.container}>
      <div className={classes.heading}>
        <div className={classes.left}>
          <div className={classes.title}>Recently Created by you</div>
          <div className={classes.total}>
            {recentlyCreated?.data?.data?.length || 0}
          </div>
        </div>
        {recentlyCreated?.data?.data?.length >= 3 && (
          <div className={classes.right} onClick={onViewAllClicked}>
            View All <ArrowForwardIosIcon className={classes.arrowIcon} />
          </div>
        )}
      </div>
      <div className={classes.list}>
        {recentlyCreated?.status === API_STATUS.LOADING ? (
          <>
            <ShellLoading
              height={SHELL_LOADER_HEIGHT}
              width={SHELL_LOADER_WIDTH}
            />
            <ShellLoading
              height={SHELL_LOADER_HEIGHT}
              width={SHELL_LOADER_WIDTH}
            />
            <ShellLoading
              height={SHELL_LOADER_HEIGHT}
              width={SHELL_LOADER_WIDTH}
            />
          </>
        ) : (
          recentlyCreated?.data?.data?.map((workflow) => (
            <div className={classes.listItem}>
              <RecentlyCreatedWorkflow workflowDetails={workflow} />
            </div>
          ))
        )}
      </div>
    </div>
  ) : (
    <></>
  )
}

const mapStateToProps = (state: CommonState) => ({
  userDetails: state.msdUserInfoDetails,
  recentlyCreated: state.workflowsReducer.recentlyCreated
})

const mapDispatchToProps = (dispatch) => {
  return {
    getRecentlyCreatedWorkflows: (
      payload: GetWorkflowsInput,
      isRecentlyCreatedByYou: boolean
    ) => getWorkflows(dispatch, payload, isRecentlyCreatedByYou)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(RecentlyCreated)

export default StyleComponent
