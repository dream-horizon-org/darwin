import {Snackbar} from '@material-ui/core'
import {Alert} from '@mui/material'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import {Chip} from '../../../bit-components/chip/index'

import React, {useEffect, useMemo, useState} from 'react'
import {Control, Controller} from 'react-hook-form'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Input} from '../../../bit-components/input/index'
import {Tags, TagsType} from '../../../bit-components/tags/tags/index'
import {Tooltip} from '../../../bit-components/tooltip/index'
import {routes} from '../../../constants'
import ClusterDetailsManage from '../../../layouts/clusterDetailsManage/clusterDetailsManage'
import {FetchComputeTags} from '../../../modules/compute/pages/computeCreate/fetchComputeTags'
import {FetchComputeTagsSchema} from '../../../modules/compute/pages/computeCreate/fetchComputeTags.gqlTypes'
import {GQL as fetchTagsGql} from '../../../modules/compute/pages/computeCreate/fetchComputeTagsGql'
import {setClusterStatus} from '../../../modules/compute/pages/graphqlApis/actions'
import {GetComputeClusterInput} from '../../../modules/compute/pages/graphqlApis/getClusterStatus/getClusterStatus'
import {getClusterStatus} from '../../../modules/compute/pages/graphqlApis/getClusterStatus/getClusterStatus.thunk'
import {IClusterStatus} from '../../../modules/compute/pages/graphqlApis/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {IComputeFormData} from '../../../types/compute/common.type'
import {API_STATUS} from '../../../utils/apiUtils'
import {useGQL} from '../../../utils/useGqlRequest'
import BackButton from '../../backButton/backButton'
import {BasicDropdownWithAddNewOption} from '../computeTagsInput/computeTagsInput'
import styles from './computeTitleBarJss'
import {
  UpdateComputeClusterName,
  UpdateComputeClusterNameInput
} from './graphqlRequests/updateComputeClusterName/UpdateComputeClusterName'
import {
  UpdateComputeClusterTags,
  UpdateComputeClusterTagsInput
} from './graphqlRequests/updateComputeClusterTags/updateComputeClusterTags'
import {UpdateComputeClusterTagsSchema} from './graphqlRequests/updateComputeClusterTags/updateComputeClusterTags.gqlTypes'
import {GQL as updateComputeClusterTagsGql} from './graphqlRequests/updateComputeClusterTags/updateComputeClusterTagsGql'

interface IProps extends WithStyles<typeof styles> {
  defaultTitle?: string
  showStatus?: boolean
  showOwner?: boolean
  showActions?: boolean
  showTags?: boolean
  control?: Control<IComputeFormData, any>
  clusterName?: string
  ownerName?: string
  clusterStatus?: string
  createdOn?: string
  clusterId?: string
  tags?: Array<any>
  updateClustername?: (name: string) => void
  updateTags?: (tags: Array<string>) => void
  updatedTagList?: (tags: Array<string>) => void
  updateClusterStatus?: (status: string) => void
  getClusterStatusFunc: (
    data: GetComputeClusterInput,
    preData: IClusterStatus['data']
  ) => void
  clusterStatusState: IClusterStatus
  setClusterStatusFunc: (data: IClusterStatus) => any
  disableEdit?: boolean
}

let clusterStatusIntervalId = null

const ComputeTitleBar = (props: IProps) => {
  const {
    classes,
    showStatus = false,
    showOwner = false,
    showActions = false,
    showTags = false,
    control,
    clusterName,
    ownerName,
    clusterStatus,
    createdOn,
    clusterId,
    updateClustername,
    tags,
    updateTags,
    updatedTagList,
    updateClusterStatus,
    getClusterStatusFunc,
    clusterStatusState,
    setClusterStatusFunc,
    disableEdit = false
  } = props

  const [clusterNameUpdated, setClusterNameUpdated] = useState({
    open: false,
    message: null,
    type: null
  })

  const {
    output: {response: tagResponse, loading: tagsLoading},
    triggerGQLCall: getTags
  } = useGQL<null, FetchComputeTags>()

  const [nameValue, setNameValue] = useState(clusterName || '')
  const [enableEditTag, setEnableEditTag] = useState(false)
  useEffect(() => {
    getTags(
      {
        ...fetchTagsGql
      },
      FetchComputeTagsSchema
    )
  }, [])

  const {
    output: {
      response: updateComputeClusterNameResponse,
      loading: updateComputeClusterNameLoading
    },
    triggerGQLCall: updateComputeClusterName
  } = useGQL<UpdateComputeClusterNameInput, UpdateComputeClusterName>()

  const {
    output: {
      response: updateComputeClusterTagsResponse,
      loading: updateComputeClusterTagsLoading
    },
    triggerGQLCall: updateComputeClusterTags
  } = useGQL<UpdateComputeClusterTagsInput, UpdateComputeClusterTags>()

  useEffect(() => {
    setNameValue(clusterName)
  }, [clusterName])

  const updateComputeClusterTagsFunc = (updatedTags: Array<string>) => {
    const currentTagsMap = tags.reduce((prev, curr) => {
      prev[curr] = curr
      return prev
    }, {})
    const shouldAddNewTags = updatedTags.some((t) => !currentTagsMap[t])
    updateComputeClusterTags(
      {
        ...updateComputeClusterTagsGql,
        variables: {
          input: {
            clusterId,
            data: {
              tags: updatedTags
            }
          }
        }
      },
      UpdateComputeClusterTagsSchema
    )
  }

  useEffect(() => {
    if (!updateComputeClusterTagsLoading && updateComputeClusterTagsResponse) {
      if (
        updateComputeClusterTagsResponse.updateComputeClusterTags.status ===
        'SUCCESS'
      ) {
        updateTags(
          updateComputeClusterTagsResponse.updateComputeClusterTags.data.tags
        )
        setEnableEditTag(false)
        setClusterNameUpdated({
          open: true,
          message: 'Cluster tags updated successfully!',
          type: 'SUCCESS'
        })
      } else {
        setClusterNameUpdated({
          open: true,
          message: 'Cluster tags failed to update!',
          type: 'ERROR'
        })
      }
    }
  }, [updateComputeClusterTagsResponse])

  useEffect(() => {
    if (!updateComputeClusterNameLoading && updateComputeClusterNameResponse) {
      if (
        updateComputeClusterNameResponse.updateComputeClusterName.status ===
        'SUCCESS'
      ) {
        updateClustername(
          updateComputeClusterNameResponse.updateComputeClusterName.data.name
        )
        setClusterNameUpdated({
          open: true,
          message: 'Cluster name updated successfully!',
          type: 'SUCCESS'
        })
      } else {
        setNameValue(clusterName)
        setClusterNameUpdated({
          open: true,
          message: 'Cluster name failed to update!',
          type: 'ERROR'
        })
      }
    }
  }, [updateComputeClusterNameResponse])

  useEffect(() => {
    setClusterStatusFunc({
      status: API_STATUS.INIT,
      data: null,
      error: null
    })
    return () =>
      setClusterStatusFunc({
        status: API_STATUS.INIT,
        data: null,
        error: null
      })
  }, [clusterId, clusterStatus])

  useEffect(() => {
    if (clusterId) {
      callGetClusterStatusFunc()
    }

    return () => clearInterval(clusterStatusIntervalId)
  }, [clusterId, clusterStatusState.status])

  const callGetClusterStatusFunc = () => {
    clusterStatusIntervalId = setInterval(() => {
      getClusterStatusFunc({clusterId}, clusterStatusState.data)
    }, 5000)
  }

  const handleSnackbarClose = () => {
    setClusterNameUpdated({
      open: false,
      message: null,
      type: null
    })
  }

  const deleteTag = (tag: string) => {
    if (updateComputeClusterTagsLoading) return
    const tagToUpdate = tags.filter((t) => t !== tag)
    updateComputeClusterTagsFunc(tagToUpdate)
  }

  const getStatus = () => {
    const status =
      clusterStatusState.data && clusterStatusState.data.clusterId === clusterId
        ? clusterStatusState.data.status
        : clusterStatus

    if (status === 'active') {
      return <Tags label={'Active'} type={TagsType?.Valid} />
    } else if (status === 'inactive') {
      return <Tags label={'Inactive'} type={TagsType?.Invalid} />
    } else if (status === 'creating') {
      return <Tags label={'Creating'} type={TagsType?.Default} />
    }
    return <Tags label={'Inactive'} type={TagsType?.Invalid} />
  }
  return (
    <>
      <Snackbar
        open={clusterNameUpdated.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={clusterNameUpdated.type?.toLowerCase()}
          sx={{width: '100%'}}
        >
          {clusterNameUpdated.message}
        </Alert>
      </Snackbar>
      <div className={classes.titleHeader}>
        <div className={classes.pageActions}>
          <BackButton
            mode='route'
            to={routes.compute}
            dataTestId='cluster-details-page-back-button'
          />
        </div>
        <div className={classes.titleContainer}>
          <div className={classes.titleDescription}>
            <div
              className={classes.title}
              style={control ? {width: '100%'} : {}}
            >
              {control ? (
                <Controller
                  name='clusterName'
                  control={control}
                  render={({
                    field: {name, onBlur, onChange, ref, value},
                    fieldState: {error}
                  }) => (
                    <Input
                      disabled={disableEdit}
                      label='Cluster Name'
                      name={name}
                      onBlur={onBlur}
                      onChange={onChange}
                      value={value || ''}
                      showLabelAsPlaceHolder={true}
                      autoSave={true}
                      error={Boolean(error)}
                      assistiveText={Boolean(error) && error.message}
                      data-testid='compute-create-cluster-name-input'
                    />
                  )}
                />
              ) : (
                <div className={classes.titleName}>
                  <Tooltip title={clusterName}>
                    <span>{clusterName}</span>
                  </Tooltip>
                </div>
              )}
            </div>
            {showStatus && (
              <div className={classes.statusItem}>{getStatus()}</div>
            )}
            {showOwner && (
              <div className={classes.ownerWrapper}>
                Owner: &nbsp;{' '}
                <span className={classes.ownerItem}>
                  {ownerName || 'SDK'} on
                </span>{' '}
                {new Date(createdOn).toDateString()} (IST)
              </div>
            )}
          </div>
          {showTags && (
            <div className={classes.tagsRow}>
              {!enableEditTag ? (
                <>
                  {tags?.map((tag) => (
                    <span className={classes.tagsRowChip}>
                      <Chip
                        onDelete={
                          disableEdit
                            ? undefined
                            : () => {
                                if (clusterId) {
                                  deleteTag(tag)
                                } else {
                                  updatedTagList(tags.filter((t) => t !== tag))
                                }
                              }
                        }
                        label={tag}
                        key={tag}
                        disabled={
                          updateComputeClusterTagsLoading || disableEdit
                        }
                      />
                    </span>
                  ))}

                  {!disableEdit && (
                    <span
                      className={classes.addTagBtn}
                      onClick={() => setEnableEditTag(true)}
                      data-testid='add-tag-button'
                    >
                      + Add Tag
                    </span>
                  )}
                </>
              ) : (
                <div data-testid='compute-create-cluster-tags-input'>
                  <BasicDropdownWithAddNewOption
                    updateTags={(updatedTags) => {
                      if (clusterId) {
                        updateComputeClusterTagsFunc(updatedTags)
                      } else {
                        updatedTagList(updatedTags)
                        setEnableEditTag(false)
                      }
                    }}
                    tags={tags}
                    disabled={updateComputeClusterTagsLoading || disableEdit}
                    menuList={tagResponse?.fetchComputeTags?.data.map(
                      (tag) => ({
                        label: tag,
                        id: tag
                      })
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        {showActions && !disableEdit && (
          <div className={classes.actionContainer}>
            <ClusterDetailsManage
              clusterId={clusterId}
              clusterStatus={clusterStatus}
              setClusterStatus={(status: string) => updateClusterStatus(status)}
            />
          </div>
        )}
      </div>
    </>
  )
}

const mapStateToProps = (state: CommonState) => {
  return {
    clusterStatusState: state.computeReducer.clusterStatus
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getClusterStatusFunc: (
      data: GetComputeClusterInput,
      preData: IClusterStatus['data']
    ) => getClusterStatus(dispatch, data, preData),
    setClusterStatusFunc: (data: IClusterStatus) =>
      dispatch(setClusterStatus(data))
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ComputeTitleBar)

export default styleComponent
