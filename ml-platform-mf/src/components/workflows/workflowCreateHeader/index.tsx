import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Tooltip from '@mui/material/Tooltip'
import {withStyles, WithStyles} from '@mui/styles'
import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {Button} from '../../../bit-components/button/index'
import {Input} from '../../../bit-components/input/index'

import cronstrue from 'cronstrue'
import {
  Control,
  Controller,
  FieldError,
  FormState,
  useWatch
} from 'react-hook-form'
import {connect} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {compose} from 'redux'
import {routes} from '../../../constants'
import {usePreventNavigation} from '../../../hooks'
import {CheckUniqueWorkflowInput} from '../../../modules/workflows/graphqlAPIs/checkUniqueWorkflow'
import {checkUnqiueWorkflow} from '../../../modules/workflows/graphqlAPIs/checkUniqueWorkflow/index.thunk'
import {IWorkflowCreateState} from '../../../modules/workflows/pages/workflowCreate/reducer'
import {IWorkflowCreateForm} from '../../../modules/workflows/types/common.types'
import {buildCronString} from '../../../modules/workflows/utils'
import {CommonState} from '../../../reducers/commonReducer'
import debounce from '../../../utils/debounce'
import BackButton from '../../backButton/backButton'
import styles from './indexJSS'

const CREATE_BTN_LABEL = 'Create'
const EDIT_BTN_LABEL = 'Update'

interface IProps extends WithStyles<typeof styles> {
  onSubmit: () => void
  onWorkflowCreate: (
    e?: React.BaseSyntheticEvent<object, any, any>
  ) => Promise<void>
  control: Control<IWorkflowCreateForm, any>
  taskFieldState: {
    invalid: boolean
    isDirty: boolean
    isTouched: boolean
    error?: FieldError
  }
  selectedTaskId: string
  editMode?: boolean
  checkUnqiueWorkflow: (payload: CheckUniqueWorkflowInput) => void
  checkUniqueWorkflowData: IWorkflowCreateState['checkUniqueWorkflow']
  formState: FormState<IWorkflowCreateForm>
}

const WorkflowCreateHeader = (props: IProps) => {
  const {
    classes,
    onSubmit,
    onWorkflowCreate,
    control,
    taskFieldState,
    selectedTaskId,
    editMode,
    checkUnqiueWorkflow,
    checkUniqueWorkflowData,
    formState
  } = props
  const [showDescriptionInput, setShowDescriptionInput] = useState(false)
  const debouncedCheckUniqueWorkflow = useMemo(
    () => debounce(checkUnqiueWorkflow, 300),
    []
  )

  const displayName = useWatch({
    control,
    name: 'displayName'
  })

  const description = useWatch({
    control,
    name: 'description'
  })

  const schedule = useWatch({
    control,
    name: 'schedule'
  })

  const isUnique = useWatch({
    control,
    name: 'isWorkflowNameUnique'
  })

  const isScheduleValid = () => {
    return (
      schedule?.minutes &&
      schedule?.hours &&
      schedule?.dayOfMonth &&
      schedule?.month &&
      schedule?.dayOfWeek
    )
  }

  useEffect(() => {
    if (checkUniqueWorkflowData?.cancel) checkUniqueWorkflowData?.cancel()

    debouncedCheckUniqueWorkflow({
      name: name
    })
  }, [])

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
      <div className={classes.left}>
        <BackButton mode='route' to={routes.workflows} />
        <Tooltip title={'Rename'}>
          <div className={classes.workflowTitle}>
            <Controller
              name='displayName'
              control={control}
              render={({
                field: {name, onBlur, onChange, value},
                fieldState: {error}
              }) => (
                <Input
                  label='Workflow Name'
                  name={name}
                  onBlur={onBlur}
                  data-testid='workflow-name'
                  onChange={(ev) => {
                    onChange(ev.target.value)
                    if (checkUniqueWorkflowData?.cancel) {
                      checkUniqueWorkflowData?.cancel()
                    }

                    debouncedCheckUniqueWorkflow({
                      name: ev.target.value
                    })
                  }}
                  value={value}
                  showLabelAsPlaceHolder={true}
                  autoSave={true}
                  assistiveText={
                    !isUnique && isUnique !== null
                      ? 'Workflow name already exists'
                      : undefined
                  }
                  error={!isUnique && isUnique !== null}
                />
              )}
            />
          </div>
        </Tooltip>
        <div className={classes.seperator}></div>
        {showDescriptionInput || description ? (
          <div className={classes.workflowDescription}>
            <Controller
              name='description'
              control={control}
              render={({
                field: {name, onBlur, onChange, value},
                fieldState: {error}
              }) => (
                <Input
                  label='Workflow Description'
                  name={name}
                  onBlur={onBlur}
                  onChange={onChange}
                  value={value}
                  showLabelAsPlaceHolder={true}
                  autoSave={true}
                  error={Boolean(error)}
                  assistiveText={Boolean(error) && error.message}
                  data-testid='workflow-description'
                />
              )}
            />
          </div>
        ) : (
          <div
            className={classes.link}
            onClick={() => setShowDescriptionInput(true)}
            data-testid='add-description-button'
          >
            + Add Description
          </div>
        )}
      </div>
      <div className={classes.right}>
        <div className={classes.scheduleContainer}>
          <AccessTimeIcon className={classes.addScheduleIcon} />
          {isScheduleValid() ? (
            <div className={classes.addScheduleText}>
              {getCronExpression() || 'N/A'}
            </div>
          ) : (
            <div className={classes.addScheduleText}>Add Schedule</div>
          )}
        </div>
        <div className={classes.disabledSeperator}></div>
        <div
          className={classes.btnContainer}
          data-testid='workflow-create-edit-button'
        >
          <Button
            buttonText={editMode ? EDIT_BTN_LABEL : CREATE_BTN_LABEL}
            onClick={editMode ? onWorkflowCreate : onSubmit}
            disabled={
              editMode
                ? !!selectedTaskId ||
                  !!taskFieldState.error ||
                  !formState.isDirty
                : !!selectedTaskId ||
                  !taskFieldState.isTouched ||
                  !!taskFieldState.error
            }
          />
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
)(WorkflowCreateHeader)

export default StyleComponent
