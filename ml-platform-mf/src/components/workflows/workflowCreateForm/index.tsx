import {yupResolver} from '@hookform/resolvers/yup'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import {Checkbox, Switch} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import config from 'config'
import cronstrue from 'cronstrue'
import React, {useEffect, useMemo, useState} from 'react'
import {Control, Controller, FormState, useWatch} from 'react-hook-form'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Input} from '../../../bit-components/input/index'
import {TextArea} from '../../../bit-components/text-area/index'
import {Toggle} from '../../../bit-components/toggle/index'
import {ToolTipPlacement} from '../../../bit-components/tooltip/index'
import {
  getDefaultTask,
  workflowFormSchema
} from '../../../modules/workflows/constants'
import {CheckUniqueWorkflowInput} from '../../../modules/workflows/graphqlAPIs/checkUniqueWorkflow'
import {checkUnqiueWorkflow} from '../../../modules/workflows/graphqlAPIs/checkUniqueWorkflow/index.thunk'
import {IWorkflowCreateState} from '../../../modules/workflows/pages/workflowCreate/reducer'
import {IWorkflowEditState} from '../../../modules/workflows/pages/workflowEdit/reducer'
import {IWorkflowCreateForm} from '../../../modules/workflows/types/common.types'
import {buildCronString} from '../../../modules/workflows/utils'
import {CommonState} from '../../../reducers/commonReducer'
import {aliasTokens} from '../../../theme.contants'
import debounce from '../../../utils/debounce'
import {BasicDropdownWithAddNewOption} from '../../compute/computeTagsInput/computeTagsInput'
import HorizontalSeperator from '../../horizontalSeperator'
import Info from '../../Info'
import {predefinedToolTips} from '../../Info/constants'
import WorkflowCheckbox from '../workflowCheckbox'
import WorkflowParameters from '../workflowParameters'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  control: Control<IWorkflowCreateForm, any>
  formState: FormState<IWorkflowCreateForm>
  checkUnqiueWorkflow: (payload: CheckUniqueWorkflowInput) => void
  checkUniqueWorkflowData: IWorkflowCreateState['checkUniqueWorkflow']
  editMode: boolean
  setValue: (name: string, value: any) => void
}

const WorkflowCreateForm = (props: IProps) => {
  const {
    classes,
    control,
    formState,
    checkUnqiueWorkflow,
    checkUniqueWorkflowData,
    editMode,
    setValue
  } = props
  const debouncedCheckUniqueWorkflow = useMemo(
    () => debounce(checkUnqiueWorkflow, 300),
    []
  )

  const parameters = useWatch({
    control,
    name: 'parameters'
  })

  const schedule = useWatch({
    control,
    name: 'schedule'
  })
  const tasks = useWatch({
    control,
    name: 'tasks'
  })
  const slackChannel = useWatch({
    control,
    name: 'slackChannel'
  })
  const isAllPurposeClusterPresent = tasks.some((task) => {
    const cluster = task?.cluster?.id.split('-')[0]
    return cluster === 'id'
  })

  const [isAllPurposeClusterAttached, setIsAllPurposeClusterAttached] =
    useState(isAllPurposeClusterPresent)

  const getMenuList = (tags: string[]) => {
    return tags.map((tag) => {
      return {label: tag, id: tag}
    })
  }

  useEffect(() => {
    if (isAllPurposeClusterAttached) {
      setValue('enableHA', false)
    }
    if (tasks && tasks.length) {
      const isClusterAttached = tasks.some((task) => {
        const cluster = task?.cluster?.id.split('-')[0]
        return cluster === 'id'
      })
      setIsAllPurposeClusterAttached(isClusterAttached)
    }
  }, [tasks, isAllPurposeClusterAttached, setValue])

  const getErrorMessageForSchedule = () => {
    if (formState.errors.schedule?.minutes?.message) {
      return formState.errors.schedule?.minutes?.message
    } else if (formState.errors.schedule?.hours?.message) {
      return formState.errors.schedule?.hours?.message
    } else if (formState.errors.schedule?.dayOfMonth?.message) {
      return formState.errors.schedule?.dayOfMonth?.message
    } else if (formState.errors.schedule?.month?.message) {
      return formState.errors.schedule?.month?.message
    } else if (formState.errors.schedule?.dayOfWeek?.message) {
      return formState.errors.schedule?.dayOfWeek?.message
    } else {
      return ''
    }
  }

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

  return (
    <div className={classes.container}>
      <div className={classes.formFieldTop}>
        <div className={classes.formLabel}>
          Workflow Details
          <Info
            msg={predefinedToolTips.WorkflowDetails}
            placement={ToolTipPlacement.BottomStart}
          />
        </div>
        <div className={classes.input}>
          <Controller
            name='displayName'
            control={control}
            render={({field, fieldState: {error}}) => (
              <Input
                {...field}
                onChange={(ev) => {
                  field.onChange(ev.target.value)

                  if (checkUniqueWorkflowData?.cancel)
                    checkUniqueWorkflowData?.cancel()

                  debouncedCheckUniqueWorkflow({
                    name: ev.target.value
                  })
                }}
                label='Workflow Name'
                error={Boolean(error?.message)}
                assistiveText={
                  error?.message ||
                  formState?.errors?.isWorkflowNameUnique?.message
                }
                disabled={editMode}
                data-testid='workflow-create-side-panel-workflow-name'
                // disabled={editMode}
              />
            )}
          />
        </div>
      </div>
      <div
        className={classes.formFieldContainer}
        data-testid='workflow-create-side-panel-workflow-description'
      >
        <div className={classes.input}>
          <Controller
            name='description'
            control={control}
            render={({field, fieldState: {error}}) => (
              <TextArea
                {...field}
                label='Description'
                value={field?.value || ''}
                error={Boolean(error?.message)}
                assistiveText={error?.message}
              />
            )}
          />
        </div>
      </div>
      <div className={classes.formFieldContainer}>
        <div
          className={classes.autocompleteDropdown}
          data-testid='workflow-create-side-panel-workflow-tags'
        >
          <Controller
            name='tags'
            control={control}
            render={({field, fieldState: {error}}) => (
              <BasicDropdownWithAddNewOption
                updateTags={(updateValue) => {
                  let currentValue = field.value
                  currentValue = updateValue
                  field.onChange(currentValue)
                }}
                tags={field.value || []}
                menuList={getMenuList(field.value || [])}
                label='Tags'
              />
            )}
          />
        </div>
      </div>
      <HorizontalSeperator />

      <div className={classes.formFieldContainer}>
        <div className={classes.formLabel}>
          Schedule
          <span className={classes.subText}>(Optional)</span>
          <Info
            msg={predefinedToolTips.schedule}
            placement={ToolTipPlacement.BottomStart}
          />
        </div>
        <div className={classes.scheduleContainer}>
          <div className={classes.scheduleInput}>
            <Controller
              name='schedule.minutes'
              control={control}
              render={({field, fieldState: {error}}) => (
                <Input
                  {...field}
                  label='Min'
                  value={field?.value || ''}
                  error={Boolean(error?.message)}
                  data-testid='workflow-create-side-panel-workflow-schedule-minutes'
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
                  label='Hour'
                  value={field?.value || ''}
                  error={Boolean(error?.message)}
                  data-testid='workflow-create-side-panel-workflow-schedule-hours'
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
                  label='Day'
                  value={field?.value || ''}
                  error={Boolean(error?.message)}
                  data-testid='workflow-create-side-panel-workflow-schedule-day'
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
                  label='Month'
                  value={field?.value || ''}
                  error={Boolean(error?.message)}
                  data-testid='workflow-create-side-panel-workflow-schedule-month'
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
                  label='Week'
                  value={field?.value || ''}
                  error={Boolean(error?.message)}
                  data-testid='workflow-create-side-panel-workflow-schedule-week'
                />
              )}
            />
          </div>
        </div>
        {getErrorMessageForSchedule() && (
          <div className={classes.error}>{getErrorMessageForSchedule()}</div>
        )}
      </div>
      {getCronExpression() && (
        <div className={classes.cronExpression}>{getCronExpression()}</div>
      )}
      <div className={classes.HAContainer}>
        <div className={classes.HAInfoMessage}>
          <div className={classes.HAHeader}>High Availability Task</div>
          <Info
            msg={predefinedToolTips.highAvailabilityTask}
            placement={ToolTipPlacement.BottomStart}
          />
        </div>
        <HorizontalSeperator />
        <div className={classes.checkbox}>
          <Controller
            key='HA'
            name='enableHA'
            control={control}
            render={({field: {name, onChange, value}, fieldState: {error}}) => (
              <Checkbox
                checked={Boolean(value)}
                name={name}
                className={classes.HACheckbox}
                disabled={isAllPurposeClusterAttached}
                onChange={(ev) => {
                  onChange(ev.target.checked)
                }}
              />
            )}
          />
          <p>Attach Extra Clusters as needed</p>
        </div>
        <div className={classes.HATextNote}>
          Note: Opting in will use more cost. However, the workflow will run
          more reliably (only applicable if all tasks have job cluster).
        </div>
      </div>
      <HorizontalSeperator />

      <div className={classes.formFieldContainer}>
        <div className={classes.formLabel}>
          Concurrency
          <span className={classes.subText}>(Optional)</span>
          <Info
            msg={predefinedToolTips.concurrency}
            placement={ToolTipPlacement.BottomStart}
          />
        </div>
        <div className={classes.concurrencyQueue}>
          <div>
            <Controller
              name='queueEnabled'
              control={control}
              render={({
                field: {name, onChange, value},
                fieldState: {error}
              }) => (
                <Toggle
                  name={name}
                  value='queueEnabled'
                  checked={Boolean(value)}
                  onChange={(e) => onChange(e.target.checked)}
                  text='Queue'
                />
              )}
            />
          </div>
          <Info
            msg={predefinedToolTips.queue}
            placement={ToolTipPlacement.BottomStart}
          />
        </div>
        <div className={classes.inputWithInfoMessage}>
          <Controller
            name='maxConcurrentRuns'
            control={control}
            render={({field, fieldState: {error}}) => (
              <Input
                {...field}
                inputType='number'
                label='Max Concurrent Runs (Optional)'
                onChange={(ev) => {
                  if (ev.target.value) {
                    field.onChange(Number(ev.target.value))
                  } else {
                    field.onChange(null)
                  }
                }}
                value={field?.value?.toString() || ''}
                error={Boolean(error?.message)}
                assistiveText={error?.message}
              />
            )}
          />
          <Info
            msg={predefinedToolTips.maxConcurrentWorkflows}
            placement={ToolTipPlacement.BottomStart}
          />
        </div>
      </div>

      <div className={classes.formFieldContainer}>
        <div className={classes.inputWithInfoMessage}>
          <Controller
            name='numberOfRetries'
            control={control}
            render={({field, fieldState: {error}}) => (
              <Input
                {...field}
                inputType='number'
                label='No. Of Retries (Optional)'
                onChange={(ev) => {
                  if (ev.target.value) {
                    field.onChange(Number(ev.target.value))
                  } else {
                    field.onChange(null)
                  }
                }}
                value={field?.value?.toString() || ''}
                error={Boolean(error?.message)}
                assistiveText={error?.message}
              />
            )}
          />
          <Info
            msg={predefinedToolTips.retriesForWorkflow}
            placement={ToolTipPlacement.BottomStart}
          />
        </div>
      </div>
      <HorizontalSeperator />

      <WorkflowParameters
        control={control}
        parameters={parameters}
        setValue={setValue}
        formState={formState}
        showLabel={true}
      />

      <HorizontalSeperator />

      <div className={classes.formFieldContainer}>
        <div className={classes.formLabel}>
          <NotificationsActiveOutlinedIcon
            className={classes.notificationIcon}
          />
          <span className={classes.slackLabel}>Notifications</span>
          <span className={classes.subText}>(Optional)</span>
          <div className={classes.newLabel}>New</div>
        </div>
        <div className={classes.input}>
          <Controller
            name='notifications'
            control={control}
            render={({field, fieldState: {error}}) => (
              <Input
                {...field}
                inputType='number'
                label='Run Duration (in mins)'
                onChange={(ev) => {
                  const value = parseInt(ev.target.value)
                  const newValue = isNaN(value) ? null : value
                  field.onChange(newValue)
                }}
                value={field?.value?.toString() || ''}
                error={Boolean(error?.message)}
                assistiveText={error?.message}
              />
            )}
          />
        </div>
      </div>
      <div className={classes.eventsText}>
        Notify on the following workflow events:
      </div>
      <div className={classes.eventsCheckboxContainer}>
        <div className={classes.eventsCheckbox}>
          <WorkflowCheckbox
            control={control}
            classes={classes}
            formState={formState}
            name='notification_preference.on_start'
            key='on_start'
            labelText='Run Started'
          />
          <WorkflowCheckbox
            control={control}
            classes={classes}
            formState={formState}
            name='notification_preference.on_success'
            key='on_success'
            labelText='Run Successful'
          />
        </div>
        <div className={classes.eventsCheckbox}>
          <WorkflowCheckbox
            control={control}
            classes={classes}
            formState={formState}
            name='notification_preference.on_fail'
            key='on_fail'
            labelText='Run Failed'
            defaultValue={true}
          />
          <WorkflowCheckbox
            control={control}
            classes={classes}
            formState={formState}
            name='notification_preference.on_skip'
            key='on_skip'
            labelText='Run Skipped'
          />
        </div>
      </div>
      <div className={classes.formFieldContainer}>
        <div className={classes.formLabel}>
          <img
            src={`${config.cfMsdAssetUrl}/icons/darwin-slack.svg`}
            alt='Slack Channel'
          />
          <span className={classes.slackLabel}>Slack Channel</span>
          <span className={classes.subText}>(Optional)</span>
          <Info
            msg={predefinedToolTips.slackNotificationForWorkflow}
            placement={ToolTipPlacement.BottomStart}
          />
        </div>
        <div className={classes.input}>
          <Controller
            name='slackChannel'
            control={control}
            render={({field, fieldState: {error}}) => (
              <Input
                {...field}
                label='Channel Name (Optional)'
                value={field?.value || ''}
                error={Boolean(error?.message)}
                assistiveText={error?.message}
              />
            )}
          />
        </div>
      </div>
      <div className={classes.eventsTextNote}>
        <InfoOutlinedIcon className={classes.eventsInfoIcon} />
        <div className={classes.eventsTextContent}>
          {slackChannel ? (
            <span>Notification will be sent to Slack DM & #{slackChannel}</span>
          ) : (
            <span>Notification will be sent to Slack DM</span>
          )}
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  checkUniqueWorkflowData: state.workflowCreateReducer.checkUniqueWorkflow
})

const mapDispatchToProps = (dispatch) => {
  return {
    checkUnqiueWorkflow: (payload: CheckUniqueWorkflowInput) =>
      checkUnqiueWorkflow(dispatch, payload)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(WorkflowCreateForm)

export default StyleComponent
