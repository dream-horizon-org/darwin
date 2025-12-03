import Add from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Clear from '@mui/icons-material/Clear'
import EditIcon from '@mui/icons-material/Edit'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {useHistory} from 'react-router'
import {useParams} from 'react-router-dom'
import {compose} from 'redux'
import {Button as bitButton} from '../../../../bit-components/button/index'
import BackButton from '../../../../components/backButton/backButton'
import {CommonState} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import debounce from '../../../../utils/debounce'
import CircleLoader from '../../../login/circleLoader'
import {setDeploymentTags} from '../../data/actions'
import {IEdgeModelsState} from '../../data/reducer'
import {Flow} from '../../data/types'
import {transformedDataType} from '../../data/types'
import {ValidateModelDeploymentNameInput} from '../../graphQL/queries/validateModelDeploymentName'
import {
  setModelDeploymentName,
  validateModelDeploymentName
} from '../../graphQL/queries/validateModelDeploymentName/index.thunk'
import {BasicDropdownWithAddNewOption} from './customComputeTags'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  flow: Flow
  isEditable: IEdgeModelsState['isEditable']
  deploymentDetails: transformedDataType
  isModelNameValid: IEdgeModelsState['isModelNameValid']
  validateModelDeploymentName: (
    payload: ValidateModelDeploymentNameInput
  ) => void
  setModelDeploymentName: (payload: ValidateModelDeploymentNameInput) => void
  deploymentTags: string[]
  setModelDeploymentTags: (tags: string[]) => void
}
const CreateModelHeaderCmp = (props: IProps) => {
  const {
    flow,
    isEditable,
    deploymentDetails,
    classes,
    isModelNameValid,
    validateModelDeploymentName,
    setModelDeploymentName,
    deploymentTags,
    setModelDeploymentTags
  } = props
  const [enableEditTag, setEnableEditTag] = useState(false)
  const history = useHistory()
  const {deploymentId} = useParams<{deploymentId: string}>()
  useEffect(() => {
    if (flow !== Flow.CREATE) {
      setModelDeploymentName({
        deploymentName: deploymentDetails.deploymentName
      })
      setModelDeploymentTags(deploymentDetails.tags)
    }
  }, [flow])

  const handleDeleteTag = (tag: string) => {
    const newTags = deploymentTags.filter((t) => t !== tag)
    setModelDeploymentTags(newTags)
  }

  const handleDeploymentNameChange = (name: string) => {
    if (flow === Flow.Edit && name === deploymentDetails.deploymentName) {
      setModelDeploymentName({
        deploymentName: name
      })
    } else {
      validateModelDeploymentName({
        deploymentName: name
      })
    }
  }

  const handleDeploymentNameChangeDebounced = debounce(
    handleDeploymentNameChange,
    1000
  )

  const onBackPress = () => {
    if (flow === Flow.Edit) {
      history.push(`/edge-models/info/${deploymentId}`)
    } else history.push('/edge-models')
  }

  const invalidDeploymentName = isModelNameValid.status === API_STATUS.ERROR

  const handleEditClick = () => {
    history.push({
      pathname: `/edge-models/edit/${deploymentId}`
    })
  }
  return (
    <div className={classes.container}>
      <div className={classes.left}>
        <div>
          <ArrowBackIcon
            className={classes.leftBackIcon}
            onClick={onBackPress}
          />
        </div>
        <div className={classes.leftContainer}>
          <div className={classes.searchAndLoaderContainer}>
            <TextField
              className={classes.root}
              id='outlined-size-small'
              size='small'
              style={{width: 280}}
              placeholder='Enter deployment name'
              onChange={(e) =>
                handleDeploymentNameChangeDebounced(e.target.value)
              }
              error={invalidDeploymentName}
              helperText={
                invalidDeploymentName ? 'Deployment name already exists' : ''
              }
              disabled={
                isModelNameValid.status === API_STATUS.LOADING ||
                flow === Flow.Detail ||
                (flow === Flow.Edit && !isEditable.deploymentName)
              }
              defaultValue={
                flow !== Flow.CREATE
                  ? deploymentDetails.deploymentName
                  : undefined
              }
            />
            {isModelNameValid.status === API_STATUS.LOADING && <CircleLoader />}
          </div>

          {deploymentTags && (
            <div
              className={
                enableEditTag ? classes.tagsRowDropdownEnabled : classes.tagsRow
              }
            >
              {!enableEditTag ? (
                <>
                  {deploymentTags?.map((tag) => (
                    <span className={classes.tagsRowChip}>
                      <Chip
                        onDelete={() => {
                          flow === Flow.CREATE ||
                          (flow === Flow.Edit && isEditable.tags)
                            ? handleDeleteTag(tag)
                            : null
                        }}
                        deleteIcon={<Clear className={classes.chipClearBtn} />}
                        label={tag}
                        key={tag}
                        disabled={false}
                      />
                    </span>
                  ))}
                  {(flow === Flow.CREATE ||
                    (flow === Flow.Edit && isEditable.tags)) && (
                    <Button
                      size='small'
                      startIcon={<Add />}
                      onClick={() => setEnableEditTag(true)}
                      style={{textTransform: 'none'}}
                    >
                      Add tag
                    </Button>
                  )}
                </>
              ) : (
                <BasicDropdownWithAddNewOption
                  updateTags={(updatedTags) => {
                    setModelDeploymentTags(updatedTags)
                    setEnableEditTag(false)
                  }}
                  tags={deploymentTags}
                  disabled={false}
                  menuList={
                    deploymentTags.length > 0
                      ? deploymentTags.map((tag) => ({label: tag, id: tag}))
                      : []
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>

      {flow === Flow.Detail && (
        <div className={classes.editButtonContainer}>
          <Button
            className={classes.editButton}
            startIcon={<EditIcon />}
            variant='outlined'
            onClick={handleEditClick}
          >
            Edit
          </Button>
        </div>
      )}
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    validateModelDeploymentName: (
      payload: ValidateModelDeploymentNameInput
    ) => {
      validateModelDeploymentName(dispatch, payload)
    },
    setModelDeploymentName: (payload: ValidateModelDeploymentNameInput) => {
      setModelDeploymentName(dispatch, payload)
    },
    setModelDeploymentTags: (tags: string[]) => {
      dispatch(setDeploymentTags(tags))
    }
  }
}

const mapStateToProps = (state: CommonState) => ({
  isModelNameValid: state.edgeModelsReducer.isModelNameValid,
  deploymentTags: state.edgeModelsReducer.deploymentTags,
  isEditable: state.edgeModelsReducer.isEditable
})

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(CreateModelHeaderCmp)

export default StyleComponent
