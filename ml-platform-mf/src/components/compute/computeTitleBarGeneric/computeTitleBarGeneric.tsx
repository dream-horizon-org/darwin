import {debounce, Snackbar} from '@material-ui/core'
import {Alert} from '@mui/material'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React, {useEffect, useMemo, useState} from 'react'
import {Control, Controller} from 'react-hook-form'
import {connect} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {compose} from 'redux'
import {Chip} from '../../../bit-components/chip/index'
import {Input} from '../../../bit-components/input/index'
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
import {BasicDropdownWithAddNewOption} from '../computeTagsInput/computeTagsInput'
import styles from './computeTitleBarGenericJss'
import {
  UpdateComputeClusterName,
  UpdateComputeClusterNameInput
} from './graphqlRequests/updateComputeClusterName/UpdateComputeClusterName'
import {UpdateComputeClusterNameSchema} from './graphqlRequests/updateComputeClusterName/UpdateComputeClusterName.gqlTypes'
import {GQL as updateComputeClusterNameGql} from './graphqlRequests/updateComputeClusterName/UpdateComputeClusterNameGql'
import {
  UpdateComputeClusterTags,
  UpdateComputeClusterTagsInput
} from './graphqlRequests/updateComputeClusterTags/updateComputeClusterTags'
import {UpdateComputeClusterTagsSchema} from './graphqlRequests/updateComputeClusterTags/updateComputeClusterTags.gqlTypes'
import {GQL as updateComputeClusterTagsGql} from './graphqlRequests/updateComputeClusterTags/updateComputeClusterTagsGql'

interface IProps extends WithStyles<typeof styles> {
  defaultTitle?: string
  showTags?: boolean
  control?: Control<IComputeFormData, any>
  clusterName?: string
  clusterId?: string
  tags?: Array<any>
  updateTags?: (tags: Array<string>) => void
  updatedTagList?: (tags: Array<string>) => void
}

let clusterStatusIntervalId = null

const ComputeTitleBarGeneric = (props: IProps) => {
  const {
    classes,
    showTags = false,
    control,
    clusterName,
    clusterId,
    tags,
    updateTags,
    updatedTagList
  } = props

  const [snackbarData, setSnackbarData] = useState({
    open: false,
    message: null,
    type: null
  })

  const {
    output: {response: tagResponse, loading: tagsLoading},
    triggerGQLCall: getTags
  } = useGQL<null, FetchComputeTags>()

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
      response: updateComputeClusterTagsResponse,
      loading: updateComputeClusterTagsLoading
    },
    triggerGQLCall: updateComputeClusterTags
  } = useGQL<UpdateComputeClusterTagsInput, UpdateComputeClusterTags>()

  const updateComputeClusterTagsFunc = (updatedTags: Array<string>) => {
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
        setSnackbarData({
          open: true,
          message: 'Cluster tags updated successfully!',
          type: 'SUCCESS'
        })
      } else {
        setSnackbarData({
          open: true,
          message: 'Cluster tags failed to update!',
          type: 'ERROR'
        })
      }
    }
  }, [updateComputeClusterTagsResponse])

  const handleSnackbarClose = () => {
    setSnackbarData({
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

  return (
    <>
      <Snackbar
        open={snackbarData.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarData.type?.toLowerCase()}
          sx={{width: '100%'}}
        >
          {snackbarData.message}
        </Alert>
      </Snackbar>
      <div className={classes.titleContainer}>
        <div className={classes.titleDescription}>
          <div className={classes.title} style={control ? {width: '100%'} : {}}>
            {control ? (
              <Controller
                name='clusterName'
                control={control}
                render={({
                  field: {name, onBlur, onChange, ref, value},
                  fieldState: {error}
                }) => (
                  <Input
                    label='Cluster Name'
                    name={name}
                    onBlur={onBlur}
                    onChange={onChange}
                    value={value || ''}
                    error={Boolean(error)}
                    assistiveText={Boolean(error) && error.message}
                    data-testid='cluster-name-input'
                  />
                )}
              />
            ) : (
              <div className={classes.titleName}>{clusterName}</div>
            )}
          </div>
        </div>
        {showTags && (
          <div className={classes.tagsRow}>
            {!enableEditTag ? (
              <>
                {tags?.map((tag) => (
                  <span className={classes.tagsRowChip}>
                    <Chip
                      onDelete={() => {
                        if (clusterId) {
                          deleteTag(tag)
                        } else {
                          updatedTagList(tags.filter((t) => t !== tag))
                        }
                      }}
                      label={tag}
                      key={tag}
                      disabled={updateComputeClusterTagsLoading}
                    />
                  </span>
                ))}

                <span
                  className={classes.addTagBtn}
                  onClick={() => setEnableEditTag(true)}
                  data-testid='add-tag-button'
                >
                  + Add Tag
                </span>
              </>
            ) : (
              <div data-testid='add-tag-dropdown'>
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
                  disabled={updateComputeClusterTagsLoading}
                  menuList={tagResponse?.fetchComputeTags?.data.map((tag) => ({
                    label: tag,
                    id: tag
                  }))}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

const mapStateToProps = (state: CommonState) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    getClusterStatusFunc: (
      data: GetComputeClusterInput,
      preData: IClusterStatus['data']
    ) => getClusterStatus(dispatch, data, preData)
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ComputeTitleBarGeneric)

export default styleComponent
