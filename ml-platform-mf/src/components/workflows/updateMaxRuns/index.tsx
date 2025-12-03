import CloseIcon from '@mui/icons-material/Close'
import {Drawer} from '@mui/material'
import React, {useEffect} from 'react'
import {Input} from '../../../bit-components/input/index'

import {yupResolver} from '@hookform/resolvers/yup'
import {WithStyles, withStyles} from '@mui/styles'
import {Controller, useForm} from 'react-hook-form'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Button, ButtonSizes} from '../../../bit-components/button/index'
import {
  LoaderSize,
  ProgressCircle
} from '../../../bit-components/progress-circle/index'
import {workflowUpdateMaxRunsSchema} from '../../../modules/workflows/constants'
import {UpdateWorkflowMaxConcurrentRunsInput} from '../../../modules/workflows/graphqlAPIs/updateWorkflowMaxConcurrentRuns'
import {updateWorkflowMaxConcurrentRuns} from '../../../modules/workflows/graphqlAPIs/updateWorkflowMaxConcurrentRuns/index.thunk'
import {resetUpdateWorkflowConcurrentRuns} from '../../../modules/workflows/pages/workflowDetails/actions'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {resetUpdateWorkflow} from '../../../modules/workflows/pages/workflowEdit/actions'
import {IWorkflowUpdateMaxRunsForm} from '../../../modules/workflows/types/common.types'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
  updateWorkflowConcurrentRunsData: IWorkflowsDetailsState['updateWorkflowConcurrentRuns']
  updateWorkflowConcurrentRuns: (
    payload: UpdateWorkflowMaxConcurrentRunsInput,
    workflowDetails: IWorkflowsDetailsState['workflowDetails']
  ) => void
  resetUpdateWorkflowConcurrentRuns: () => void
  open: boolean
  onClose: () => void
}

const UpdateMaxRuns = (props: IProps) => {
  const {
    classes,
    workflowDetails,
    updateWorkflowConcurrentRunsData,
    updateWorkflowConcurrentRuns,
    resetUpdateWorkflowConcurrentRuns,
    open,
    onClose
  } = props

  const {
    control,
    setValue,
    handleSubmit,
    formState: {isDirty}
  } = useForm<IWorkflowUpdateMaxRunsForm>({
    resolver: yupResolver(workflowUpdateMaxRunsSchema),
    defaultValues: {
      maxConcurrentRuns: workflowDetails?.data?.max_concurrent_runs
    },
    mode: 'onChange'
  })

  useEffect(() => {
    if (workflowDetails?.data?.max_concurrent_runs) {
      setValue('maxConcurrentRuns', workflowDetails?.data?.max_concurrent_runs)
    }
  }, [workflowDetails])

  const onSubmit = handleSubmit((data) => {
    updateWorkflowConcurrentRuns(
      {
        workflowId: workflowDetails?.data?.workflow_id,
        maxConcurrentRuns: data.maxConcurrentRuns
      },
      workflowDetails
    )
  })

  useEffect(() => {
    if (updateWorkflowConcurrentRunsData?.status === API_STATUS.SUCCESS) {
      resetUpdateWorkflowConcurrentRuns()
      onClose()
    }
  }, [updateWorkflowConcurrentRunsData])

  return (
    <Drawer
      anchor={'right'}
      open={open}
      onClose={onClose}
      PaperProps={{style: {width: '25%'}}}
    >
      <div className={classes.drawerContainer}>
        <div className={classes.header}>
          <CloseIcon className={classes.closeIcon} onClick={onClose} />
          <div
            className={classes.heading}
            data-testid='max-concurrent-run-drawer-header'
          >
            Max Concurrent Run
          </div>
        </div>
        <div className={classes.form}>
          <div className={classes.scheduleInput}>
            <Controller
              name='maxConcurrentRuns'
              control={control}
              render={({field, fieldState: {error}}) => (
                <Input
                  {...field}
                  value={field.value?.toString() || ''}
                  onChange={(ev) => {
                    const value = Number(ev.target.value)
                    field.onChange(value)
                  }}
                  label='Max Concurrent Runs'
                  inputType='number'
                  error={Boolean(error?.message)}
                  assistiveText={error?.message}
                  data-testid='max-concurrent-run-input'
                />
              )}
            />
          </div>
        </div>
        <div className={classes.footer}>
          {updateWorkflowConcurrentRunsData?.status === API_STATUS.LOADING ? (
            <div>
              <ProgressCircle size={LoaderSize.Medium} />
            </div>
          ) : (
            <span data-testid='save-max-concurrent-run-button'>
              <Button
                buttonText={'save'}
                size={ButtonSizes.MEDIUM}
                onClick={onSubmit}
                disabled={!isDirty}
              />
            </span>
          )}
        </div>
      </div>
    </Drawer>
  )
}

const mapStateToProps = (state: CommonState) => ({
  workflowDetails: state.workflowDetailsReducer.workflowDetails,
  updateWorkflowConcurrentRunsData:
    state.workflowDetailsReducer.updateWorkflowConcurrentRuns
})

const mapDispatchToProps = (dispatch) => {
  return {
    updateWorkflowConcurrentRuns: (
      payload: UpdateWorkflowMaxConcurrentRunsInput,
      workflowDetails: IWorkflowsDetailsState['workflowDetails']
    ) => updateWorkflowMaxConcurrentRuns(dispatch, payload, workflowDetails),
    resetUpdateWorkflowConcurrentRuns: () =>
      dispatch(resetUpdateWorkflowConcurrentRuns())
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(UpdateMaxRuns)

export default StyleComponent
