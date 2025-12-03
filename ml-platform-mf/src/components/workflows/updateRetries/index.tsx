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
import {workflowUpdateRetriesSchema} from '../../../modules/workflows/constants'
import {UpdateWorkflowRetriesInput} from '../../../modules/workflows/graphqlAPIs/updateWorkflowRetries'
import {updateWorkflowRetries} from '../../../modules/workflows/graphqlAPIs/updateWorkflowRetries/index.thunk'
import {resetUpdateWorkflowRetries} from '../../../modules/workflows/pages/workflowDetails/actions'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {IWorkflowUpdateRetriesForm} from '../../../modules/workflows/types/common.types'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
  open: boolean
  onClose: () => void
  updateWorkflowRetries: (
    payload: UpdateWorkflowRetriesInput,
    workflowDetails: IWorkflowsDetailsState['workflowDetails']
  ) => void
  updateWorkflowRetriesData: IWorkflowsDetailsState['updateWorkflowRetries']
  resetUpdateWorkflowRetries: () => void
}

const UpdateRetries = (props: IProps) => {
  const {
    classes,
    workflowDetails,
    open,
    onClose,
    updateWorkflowRetries,
    updateWorkflowRetriesData,
    resetUpdateWorkflowRetries
  } = props

  const {
    control,
    setValue,
    handleSubmit,
    formState: {isDirty}
  } = useForm<IWorkflowUpdateRetriesForm>({
    resolver: yupResolver(workflowUpdateRetriesSchema),
    defaultValues: {
      numberOfRetries: workflowDetails?.data?.retries
    },
    mode: 'onChange'
  })

  useEffect(() => {
    if (workflowDetails?.data?.retries) {
      setValue('numberOfRetries', workflowDetails?.data?.retries)
    }
  }, [workflowDetails])

  const onSubmit = handleSubmit((data) => {
    updateWorkflowRetries(
      {
        workflowId: workflowDetails?.data?.workflow_id,
        retries: data.numberOfRetries
      },
      workflowDetails
    )
  })

  useEffect(() => {
    if (updateWorkflowRetriesData?.status === API_STATUS.SUCCESS) {
      resetUpdateWorkflowRetries()
      onClose()
    }
  }, [updateWorkflowRetriesData])

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
            data-testid='no-of-retries-drawer-header'
          >
            No. Of Retries
          </div>
        </div>
        <div className={classes.form}>
          <div className={classes.scheduleInput}>
            <Controller
              name='numberOfRetries'
              control={control}
              render={({field, fieldState: {error}}) => (
                <Input
                  {...field}
                  value={field?.value?.toString() || ''}
                  onChange={(ev) => {
                    const value = Number(ev.target.value)
                    field.onChange(value)
                  }}
                  label='No. of Retries'
                  inputType='number'
                  error={Boolean(error?.message)}
                  assistiveText={error?.message}
                  data-testid='no-of-retries-input'
                />
              )}
            />
          </div>
        </div>
        <div className={classes.footer}>
          {updateWorkflowRetriesData?.status === API_STATUS.LOADING ? (
            <div>
              <ProgressCircle size={LoaderSize.Medium} />
            </div>
          ) : (
            <span data-testid='no-of-retries-save-button'>
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
  updateWorkflowRetriesData: state.workflowDetailsReducer.updateWorkflowRetries
})

const mapDispatchToProps = (dispatch) => {
  return {
    updateWorkflowRetries: (
      payload: UpdateWorkflowRetriesInput,
      workflowDetails: IWorkflowsDetailsState['workflowDetails']
    ) => updateWorkflowRetries(dispatch, payload, workflowDetails),
    resetUpdateWorkflowRetries: () => dispatch(resetUpdateWorkflowRetries())
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(UpdateRetries)

export default StyleComponent
