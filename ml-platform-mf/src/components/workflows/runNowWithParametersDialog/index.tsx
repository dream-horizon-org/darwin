import {CircularProgress} from '@material-ui/core'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {v4 as uuidv4} from 'uuid'
import {
  Button,
  ButtonSizes,
  ButtonVariants
} from '../../../bit-components/button/index'
import {Dialog} from '../../../bit-components/dialog/index'
import {Icons} from '../../../bit-components/icon/index'
import {
  LoaderSize,
  ProgressCircle
} from '../../../bit-components/progress-circle/index'
import {getDefaultWorkflowParameters} from '../../../modules/workflows/constants'
import {SelectionOnGetWorkflowRuns} from '../../../modules/workflows/graphqlAPIs/getWorkflowRuns'
import {RunWorkflowRunInput} from '../../../modules/workflows/graphqlAPIs/runWorkflowRun'
import {runWorkflowRun} from '../../../modules/workflows/graphqlAPIs/runWorkflowRun/index.thunk'
import {IWorkflowCreateForm} from '../../../modules/workflows/types/common.types'
import {CommonState} from '../../../reducers/commonReducer'
import RunNowWorkflowParameterRow from '../runNowWorkflowParameterRow'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  openDialog: boolean
  handleDialogClose: () => void
  readOnly?: boolean
  parameters: IWorkflowCreateForm['parameters']
  workflowId?: string
  workflowRunsData: SelectionOnGetWorkflowRuns
  runWorkflowRun: (
    payload: RunWorkflowRunInput,
    data: SelectionOnGetWorkflowRuns
  ) => void
}

const RunNowWithParametersDialog = (props: IProps) => {
  const {
    classes,
    openDialog,
    handleDialogClose,
    parameters,
    readOnly,
    workflowRunsData,
    workflowId,
    runWorkflowRun
  } = props

  const [runNowParameters, setRunNowParameters] = useState(
    parameters.map((param) => ({
      ...param,
      isDefault: true
    }))
  )
  const [errors, setErrors] = useState<{[key: number]: string}>({})

  useEffect(() => {
    if (openDialog) {
      const keyCounts: {[key: string]: number} = {}

      parameters.forEach((param) => {
        const trimmedLabel = param.label.trim()
        if (trimmedLabel !== '') {
          keyCounts[trimmedLabel] = (keyCounts[trimmedLabel] || 0) + 1
        }
      })

      const filteredParameters = parameters.filter((param) => {
        const trimmedLabel = param.label.trim()
        return keyCounts[trimmedLabel] === 1
      })

      setRunNowParameters(
        filteredParameters.map((param) => ({
          ...param,
          isDefault: true
        }))
      )
    }
  }, [openDialog, parameters])

  const runButtonClicked = () => {
    const parametersObject = runNowParameters.reduce((acc, param) => {
      if (param.label && param.value) {
        acc[param.label.trim()] = param.value.trim()
      } else if (param.label) {
        acc[param.label.trim()] = ''
      }
      return acc
    }, {})

    const payload = {
      workflowId: workflowId,
      parameters: parametersObject
    }
    runWorkflowRun(payload, workflowRunsData)
    handleDialogClose()
  }

  const onAddParameter = () => {
    let currentValue = [...runNowParameters]
    currentValue.push({
      id: uuidv4(),
      label: '',
      value: '',
      isDefault: false
    })
    setRunNowParameters(currentValue)
  }

  const onRemoveParameter = (idx: number) => {
    let currentValue = [...runNowParameters]

    if (currentValue.length === 1) return

    const updatedValue = currentValue.filter((_, index) => index !== idx)
    setRunNowParameters(updatedValue)

    const updatedErrors = {...errors}
    delete updatedErrors[idx]
    setErrors(updatedErrors)
  }

  const onChange = (idx: number, id: string, label: string, value: string) => {
    const currentValue = [...runNowParameters]

    const isDuplicate = currentValue.some(
      (param, index) => index !== idx && param.label.trim() === label.trim()
    )

    if (label.trim() === '') {
      setErrors((prevErrors) => {
        const updatedErrors = {...prevErrors}
        delete updatedErrors[idx]
        return updatedErrors
      })
    } else if (isDuplicate) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [idx]: 'Key must be unique'
      }))
    } else {
      setErrors((prevErrors) => {
        const updatedErrors = {...prevErrors}
        delete updatedErrors[idx]
        return updatedErrors
      })
    }

    currentValue[idx].label = label
    currentValue[idx].value = value
    setRunNowParameters(currentValue)
  }

  return (
    <Dialog
      open={openDialog}
      title={'Run now with different parameters'}
      handleClose={handleDialogClose}
      dialogContent={
        <div>
          <div>
            <span className={classes.textDetails}>
              Override job parameters for this run. Any parameters that are not
              overriden here will have their default values.
            </span>
            <div className={classes.formLabel}>Workflow Parameters</div>
            <div className={classes.input}>
              {runNowParameters?.map((parameter, idx) => (
                <RunNowWorkflowParameterRow
                  label={parameter.label}
                  value={parameter.value}
                  id={parameter.id}
                  shouldDisableCloseIcon={parameter.isDefault} // Disable close button for default parameters
                  onClose={onRemoveParameter}
                  onChange={onChange}
                  idx={idx}
                  key={parameter.id}
                  error={errors[idx]}
                />
              ))}
              {
                <div className={classes.addIcon}>
                  <Button
                    buttonText='Add Parameter'
                    onClick={onAddParameter}
                    leadingIcon={Icons.ICON_ADD_OUTLINED}
                    variant={ButtonVariants.TERTIARY}
                    size={ButtonSizes.SMALL}
                  />
                </div>
              }
            </div>
          </div>
        </div>
      }
      dialogFooter={{
        primaryButton: {
          text: 'Run',
          onClick: runButtonClicked,
          disabled: Object.keys(errors).length > 0
        },
        secondaryButton: {
          text: 'Cancel',
          onClick: handleDialogClose
        }
      }}
    />
  )
}

const mapStateToProps = (state: CommonState) => ({})

const mapDispatchToProps = (dispatch) => {
  return {
    runWorkflowRun: (
      payload: RunWorkflowRunInput,
      data: SelectionOnGetWorkflowRuns
    ) => runWorkflowRun(dispatch, payload, null, data)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(RunNowWithParametersDialog)

export default StyleComponent
