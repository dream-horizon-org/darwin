import CloseIcon from '@mui/icons-material/Close'
import {Drawer} from '@mui/material'
import React, {useEffect} from 'react'
import {Input} from '../../../bit-components/input/index'

import {yupResolver} from '@hookform/resolvers/yup'
import {WithStyles, withStyles} from '@mui/styles'
import cronstrue from 'cronstrue'
import {Controller, useForm, useWatch} from 'react-hook-form'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Button, ButtonSizes} from '../../../bit-components/button/index'
import {
  LoaderSize,
  ProgressCircle
} from '../../../bit-components/progress-circle/index'
import {workflowUpdateScheduleSchema} from '../../../modules/workflows/constants'
import {UpdateWorkflowScheduleInput} from '../../../modules/workflows/graphqlAPIs/updateWorkflowSchedule'
import {updateWorkflowSchedule} from '../../../modules/workflows/graphqlAPIs/updateWorkflowSchedule/index.thunk'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {resetUpdateWorkflow} from '../../../modules/workflows/pages/workflowEdit/actions'
import {IWorkflowUpdateScheduleForm} from '../../../modules/workflows/types/common.types'
import {
  buildCronString,
  parseCronString
} from '../../../modules/workflows/utils'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
  updateWorkflowScheduleData: IWorkflowsDetailsState['updateWorkflowSchedule']
  updateWorkflowSchedule: (
    payload: UpdateWorkflowScheduleInput,
    workflowDetails: IWorkflowsDetailsState['workflowDetails']
  ) => void
  resetUpdateWorkflowSchedule: () => void
  open: boolean
  onClose: () => void
}

const UpdateSchedule = (props: IProps) => {
  const {
    classes,
    workflowDetails,
    updateWorkflowScheduleData,
    updateWorkflowSchedule,
    resetUpdateWorkflowSchedule,
    open,
    onClose
  } = props

  const cronFields = parseCronString(workflowDetails?.data?.schedule || '')

  const {control, setValue, handleSubmit} =
    useForm<IWorkflowUpdateScheduleForm>({
      resolver: yupResolver(workflowUpdateScheduleSchema),
      defaultValues: {
        schedule: {
          minutes: cronFields?.minute,
          hours: cronFields?.hour,
          dayOfMonth: cronFields?.day,
          month: cronFields?.month,
          dayOfWeek: cronFields?.week,
          isOnce: cronFields?.isOnce
        }
      },
      mode: 'onChange'
    })

  const schedule = useWatch({control, name: 'schedule'})

  useEffect(() => {
    const cronFields = parseCronString(workflowDetails?.data?.schedule || '')
    if (workflowDetails?.data?.schedule) {
      setValue('schedule', {
        minutes: cronFields.minute,
        hours: cronFields?.hour,
        dayOfMonth: cronFields?.day,
        month: cronFields?.month,
        dayOfWeek: cronFields?.week,
        isOnce: cronFields?.isOnce
      })
    }
  }, [workflowDetails])

  const getCronExpression = () => {
    let cronExpression = ''

    try {
      cronExpression = cronstrue.toString(
        buildCronString({
          minute: schedule.minutes,
          hour: schedule.hours,
          day: schedule.dayOfMonth,
          month: schedule.month,
          week: schedule.dayOfWeek,
          isOnce: schedule.isOnce
        }),
        {
          throwExceptionOnParseError: true,
          verbose: true
        }
      )
    } catch (err) {
      cronExpression =
        schedule?.minutes ||
        schedule?.hours ||
        schedule?.dayOfMonth ||
        schedule?.month ||
        schedule?.dayOfWeek
          ? 'Incorrect Cron Expression'
          : ''
    }

    return cronExpression
  }

  const onSubmit = handleSubmit((data) => {
    updateWorkflowSchedule(
      {
        workflowId: workflowDetails?.data?.workflow_id,
        schedule: buildCronString({
          minute: data.schedule.minutes,
          hour: data.schedule.hours,
          day: data.schedule.dayOfMonth,
          month: data.schedule.month,
          week: data.schedule.dayOfWeek
        })
      },
      workflowDetails
    )
  })

  useEffect(() => {
    if (updateWorkflowScheduleData?.status === API_STATUS.SUCCESS) {
      resetUpdateWorkflowSchedule()
      onClose()
    }
  }, [updateWorkflowScheduleData])

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
            data-testid='workflow-schedule-side-panel-heading'
          >
            Schedule
          </div>
        </div>
        <div className={classes.form}>
          <div>Cron</div>
          <div className={classes.scheduleContainer}>
            <div className={classes.scheduleInput}>
              <Controller
                name='schedule.minutes'
                control={control}
                render={({field, fieldState: {error}}) => (
                  <Input
                    {...field}
                    value={field.value || ''}
                    label='Min'
                    error={Boolean(error?.message)}
                    // assistiveText={error?.message}
                    data-testid='workflow-schedule-min-input'
                  />
                )}
              />
            </div>
            <div className={classes.scheduleInput}>
              <Controller
                name='schedule.hours'
                control={control}
                render={({field, fieldState: {error}}) => (
                  <Input
                    {...field}
                    value={field.value || ''}
                    label='Hour'
                    error={Boolean(error?.message)}
                    // assistiveText={error?.message}
                    data-testid='workflow-schedule-hour-input'
                  />
                )}
              />
            </div>
            <div className={classes.scheduleInput}>
              <Controller
                name='schedule.dayOfMonth'
                control={control}
                render={({field, fieldState: {error}}) => (
                  <Input
                    {...field}
                    value={field.value || ''}
                    label='Day'
                    error={Boolean(error?.message)}
                    // assistiveText={error?.message}
                    data-testid='workflow-schedule-day-input'
                  />
                )}
              />
            </div>
            <div className={classes.scheduleInput}>
              <Controller
                name='schedule.month'
                control={control}
                render={({field, fieldState: {error}}) => (
                  <Input
                    {...field}
                    value={field.value || ''}
                    label='Month'
                    error={Boolean(error?.message)}
                    // assistiveText={error?.message}
                    data-testid='workflow-schedule-month-input'
                  />
                )}
              />
            </div>
            <div className={classes.scheduleInput}>
              <Controller
                name='schedule.dayOfWeek'
                control={control}
                render={({field, fieldState: {error}}) => (
                  <Input
                    {...field}
                    value={field.value || ''}
                    label='Week'
                    error={Boolean(error?.message)}
                    // assistiveText={error?.message}
                    data-testid='workflow-schedule-week-input'
                  />
                )}
              />
            </div>
          </div>
          <div className={classes.cronExpression}>{getCronExpression()}</div>
        </div>
        <div className={classes.footer}>
          {updateWorkflowScheduleData?.status === API_STATUS.LOADING ? (
            <div>
              <ProgressCircle size={LoaderSize.Medium} />
            </div>
          ) : (
            <span data-testid='workflow-schedule-submit-button'>
              <Button
                buttonText={'schedule'}
                size={ButtonSizes.MEDIUM}
                onClick={onSubmit}
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
  updateWorkflowScheduleData:
    state.workflowDetailsReducer.updateWorkflowSchedule
})

const mapDispatchToProps = (dispatch) => {
  return {
    updateWorkflowSchedule: (
      payload: UpdateWorkflowScheduleInput,
      workflowDetails: IWorkflowsDetailsState['workflowDetails']
    ) => updateWorkflowSchedule(dispatch, payload, workflowDetails),
    resetUpdateWorkflowSchedule: () => dispatch(resetUpdateWorkflow())
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(UpdateSchedule)

export default StyleComponent
