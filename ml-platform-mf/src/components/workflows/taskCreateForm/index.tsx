import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import {Checkbox, InputAdornment, TextField} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import config from 'config'
import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {
  Button,
  ButtonSizes,
  ButtonVariants
} from '../../../bit-components/button/index'
import {Dropdown} from '../../../bit-components/dropdown/index'
import {Icons} from '../../../bit-components/icon/index'
import {Input} from '../../../bit-components/input/index'
import {Radio} from '../../../bit-components/radio/index'

import {v4 as uuidv4} from 'uuid'

import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import {
  Control,
  Controller,
  FormState,
  UseFormSetValue,
  UseFormTrigger,
  useWatch
} from 'react-hook-form'
import {
  IconButton,
  IconButtonSizes,
  IconButtonVariants
} from '../../../bit-components/icon-button/index'
import {
  TagsStatus,
  TagsStatusTypes
} from '../../../bit-components/tags/tags-status/index'
import {TextArea} from '../../../bit-components/text-area/index'
import {ToolTipPlacement} from '../../../bit-components/tooltip/index'
import {InstallLibraryInput} from '../../../modules/compute/pages/graphqlApis/installLibrary'
import {getDefaultTask, sourceTypes} from '../../../modules/workflows/constants'
import {SelectionOnPackages} from '../../../modules/workflows/graphqlAPIs/createWorkflow'
import {
  ISidepanel,
  SIDEPANEL_TYPES
} from '../../../modules/workflows/pages/workflowCreate'
import {
  IWorkflowCreateForm,
  IWorkflowTaskCluster,
  IWorkflowTaskForm
} from '../../../modules/workflows/types/common.types'
import {filterValidWorkflowParameters} from '../../../modules/workflows/utils'
import {CommonState} from '../../../reducers/commonReducer'
import {aliasTokens} from '../../../theme.contants'
import {AutoCompleteWithAddOptions} from '../../autoCompleteWithAddOptions/autoCompleteWithAddOptions'
import ClusterStatusTag from '../../clusterStatusTag'
import ClusterInstallLibraryDrawer from '../../compute/clusterInstallLibraryDrawer'
import {BasicDropdownWithAddNewOption} from '../../compute/computeTagsInput/computeTagsInput'
import HorizontalSeperator from '../../horizontalSeperator'
import Info from '../../Info'
import {predefinedToolTips} from '../../Info/constants'
import {inputStyles} from '../../workspace/attachClusterDropdown/attachClusterDropdownJSS'
import CodespacePathSelectionModal from '../codespacePathSelectionModal'
import ParametersInputField from '../parametersInputField'
import WorkflowCheckbox from '../workflowCheckbox'
import WorkflowParameters from '../workflowParameters'
import styles from './indexJSS'

import {GetWorkflowsMetaDataInput} from '../../../modules/workflows/graphqlAPIs/getWorkflowsMetaData'
import {getWorkflowsMetaData} from '../../../modules/workflows/graphqlAPIs/getWorkflowsMetaData/index.thunk'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import CustomDropDown from '../customDropDown'
interface IProps extends WithStyles<typeof styles> {
  control: Control<IWorkflowCreateForm, any>
  taskIdx: number
  setValue: UseFormSetValue<IWorkflowCreateForm>
  setSidepanel: React.Dispatch<React.SetStateAction<ISidepanel>>
  trigger: UseFormTrigger<IWorkflowCreateForm>
  formState: FormState<IWorkflowCreateForm>
}

const TaskCreateForm = (props: IProps) => {
  const {
    classes,
    control,
    taskIdx,
    setValue,
    setSidepanel,
    trigger,
    formState
  } = props

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const tasks = useWatch({
    control,
    name: 'tasks'
  })

  const workflowParameters = useWatch({
    control,
    name: 'parameters'
  })

  const openPathModal = (
    event: React.FocusEvent<HTMLInputElement>,
    taskIdx
  ) => {
    event.target.blur()
    setIsDialogOpen(true)
  }

  const onClusterInputFocused = () => {
    setSidepanel({
      open: true,
      type: SIDEPANEL_TYPES.CLUSTER,
      data: null
    })
  }

  const getMenuListOfNodes = (tasks: IWorkflowTaskForm[]) => {
    if (!tasks) return []
    return tasks
      .filter((_, idx) => {
        return taskIdx !== idx
      })
      .map((task, idx) => ({
        label: task.name,
        value: task.id
      }))
  }

  const onAddParameter = () => {
    let currentValue = tasks
    if (!currentValue) currentValue = []
    if (!currentValue[taskIdx]) currentValue[taskIdx] = {...getDefaultTask()}
    currentValue[taskIdx].parameters.push({
      id: uuidv4(),
      label: '',
      value: ''
    })
    setValue('tasks', currentValue)
  }

  const onRemoveParameter = (parameterIdx: number) => {
    let currentValue = tasks
    if (!currentValue) currentValue = []
    if (!currentValue[taskIdx]) currentValue[taskIdx] = {...getDefaultTask()}

    // if (currentValue[taskIdx].parameters.length === 1) return
    currentValue[taskIdx].parameters.splice(parameterIdx, 1)
    setValue('tasks', currentValue, {shouldDirty: true})
  }

  const getHelperText = (value: IWorkflowTaskCluster | null) => {
    if (!value) return null

    const list = []

    if (value.type) {
      list.push(value.type === 'job' ? 'Job Cluster' : 'All Purpose Cluster')
    }
    if (value.cores && value.memory) {
      list.push(`${value.cores} Core / ${value.memory} GB`)
    }
    if (value.runtime) {
      list.push(value.runtime)
    }
    if (value.estimatedCost) {
      list.push(`Estimated cost: $${value.estimatedCost}/hr`)
    }
    return (
      <>
        {list.map((item, index) => (
          <>
            {item}
            {index < list.length - 1 && <span className={'custom-separator'} />}
          </>
        ))}
      </>
    )
  }

  const onDrawerClose = () => {
    setDrawerOpen(false)
  }

  const triggerInstallLibrary = (payload: InstallLibraryInput) => {
    if (payload) {
      const newLibraries = [
        ...(tasks[taskIdx].packages || []),
        ...payload.packages.map((pkg) => ({
          source: pkg.source || null,
          body: pkg.body || null
        }))
      ]
      setValue(`tasks.${taskIdx}.packages`, newLibraries, {shouldDirty: true})
      trigger(`tasks.${taskIdx}.packages`)
    }
    setDrawerOpen(false)
  }

  const removeLibrary = (idx: number) => {
    const newLibraries = [...tasks[taskIdx].packages]
    newLibraries.splice(idx, 1)
    setValue(`tasks.${taskIdx}.packages`, newLibraries, {shouldDirty: true})
    trigger(`tasks.${taskIdx}.packages`)
  }

  const filteredWorkflowParameters =
    filterValidWorkflowParameters(workflowParameters)

  const getErrorMessageForTaskParameter = (
    taskIdx: number,
    parameterIdx: number
  ) => {
    if (
      formState?.errors?.tasks &&
      formState?.errors?.tasks[taskIdx]?.parameters &&
      formState?.errors?.tasks[taskIdx]?.parameters[parameterIdx]
    ) {
      return formState?.errors?.tasks[taskIdx]?.parameters[parameterIdx]?.label
        ?.message
    }
    return ''
  }

  return (
    <>
      <div className={classes.container}>
        <div className={classes.formFieldTop}>
          <div className={classes.input}>
            <Controller
              key={taskIdx}
              name={`tasks.${taskIdx}.name`}
              control={control}
              render={({field, fieldState: {error, isTouched}}) => (
                <Input
                  {...field}
                  label='Task Name'
                  value={field.value}
                  data-testid='workflow-task-name'
                  onChange={(ev) => {
                    // update the value of dependentOn for all the tasks on which depend on this task
                    const currentValue = tasks
                    currentValue.forEach((task, idx) => {
                      if (
                        task.dependentOn &&
                        task.dependentOn.includes(ev.target.value)
                      ) {
                        const dependentOnIdx = task.dependentOn.findIndex(
                          (dependencies) => dependencies === ev.target.value
                        )
                        const dependentOn = [...task.dependentOn]
                        dependentOn.splice(dependentOnIdx, 1, ev.target.value)
                        setValue(`tasks.${idx}.dependentOn`, dependentOn)
                      }
                    })
                    field.onChange(ev.target.value)
                  }}
                  error={Boolean(error)}
                  assistiveText={error?.message}
                />
              )}
            />
          </div>
        </div>
        <div className={classes.formFieldContainer}>
          <div className={classes.formLabel}>
            Source
            <Info
              msg={predefinedToolTips.taskSource}
              placement={ToolTipPlacement.BottomStart}
            />
          </div>
          <div className={`${classes.formField} ${classes.radioContainer}`}>
            {sourceTypes.map((source) => (
              <div className={classes.radioInput}>
                <Controller
                  key={taskIdx}
                  name={`tasks.${taskIdx}.source`}
                  control={control}
                  render={({field: {value, onChange}}) => {
                    return (
                      <div data-testid={`workflow-task-source-${source.value}`}>
                        <Radio
                          checked={value === source.value}
                          value={source.value}
                          text={source.label}
                          onChange={(ev) => {
                            onChange(source.value)
                          }}
                        />
                      </div>
                    )
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        {tasks[taskIdx].source === sourceTypes[0].value && (
          <div className={classes.formFieldContainer}>
            <div className={classes.inputWithInfoMessage}>
              <Controller
                key={taskIdx}
                name={`tasks.${taskIdx}.workspacePath`}
                control={control}
                render={({field, fieldState: {error}}) => (
                  <Input
                    {...field}
                    label='Path'
                    onFocus={(e) => openPathModal(e, taskIdx)}
                    onChange={(ev) => {}}
                    icon={Icons.ICON_NAVIGATE_NEXT}
                    value={field.value}
                    error={Boolean(error)}
                    assistiveText={error?.message}
                    data-testid='workflow-workspace-path-button'
                  />
                )}
              />
              <Info
                msg={predefinedToolTips.workspacePath}
                placement={ToolTipPlacement.BottomStart}
              />
            </div>
          </div>
        )}
        {tasks[taskIdx].source === sourceTypes[1].value && (
          <>
            <div className={classes.formFieldContainer}>
              <div className={classes.inputWithInfoMessage}>
                <Controller
                  key={taskIdx}
                  name={`tasks.${taskIdx}.gitRepo`}
                  control={control}
                  render={({field, fieldState: {error}}) => (
                    <Input
                      {...field}
                      label='Git Repo URL'
                      value={field.value}
                      error={Boolean(error)}
                      assistiveText={error?.message}
                      data-testid='workflow-task-git-repo-url'
                    />
                  )}
                />
                <Info
                  msg={predefinedToolTips.gitRepo}
                  placement={ToolTipPlacement.BottomStart}
                />
              </div>
            </div>
            <div className={classes.formFieldContainer}>
              <div className={classes.inputWithInfoMessage}>
                <Controller
                  key={taskIdx}
                  name={`tasks.${taskIdx}.filePath`}
                  control={control}
                  render={({field, fieldState: {error}}) => (
                    <Input
                      {...field}
                      label='File Path'
                      value={field.value}
                      error={Boolean(error)}
                      assistiveText={error?.message}
                      data-testid='workflow-task-file-path'
                    />
                  )}
                />
                <Info
                  msg={predefinedToolTips.filePath}
                  placement={ToolTipPlacement.BottomStart}
                />
              </div>
            </div>
          </>
        )}
        <div className={classes.formFieldContainer}>
          <div className={classes.inputWithInfoMessage}>
            <Controller
              key={taskIdx}
              name={`tasks.${taskIdx}.dynamicCode`}
              control={control}
              render={({
                field: {name, onChange, value},
                fieldState: {error}
              }) => (
                <Checkbox
                  checked={value}
                  name={name}
                  sx={{
                    padding: 0,
                    color: aliasTokens.blue_border_color_2,
                    '&.Mui-checked': {
                      color: aliasTokens.blue_border_color_2
                    }
                  }}
                  onChange={(ev) => {
                    onChange(Boolean(ev.target.checked))
                  }}
                />
              )}
            />
            <div className={classes.dynamicUpdateFiles}>
              Dynamically update Code files.
            </div>
            <Info
              msg={predefinedToolTips.dynamicUpdateSourceFiles}
              placement={ToolTipPlacement.BottomStart}
            />
          </div>
        </div>
        <HorizontalSeperator />

        <div className={classes.formFieldContainer}>
          <div className={classes.input}>
            <Controller
              key={taskIdx}
              name={`tasks.${taskIdx}.cluster`}
              control={control}
              render={({field, fieldState: {error}}) => (
                <TextField
                  {...field}
                  sx={inputStyles}
                  onFocus={onClusterInputFocused}
                  label={'Attach Cluster'}
                  value={field.value?.name || ''}
                  error={Boolean(error)}
                  data-testid='workflow-task-cluster'
                  helperText={
                    field.value ? (
                      <div className={'helperText'}>
                        {getHelperText(field.value)}
                      </div>
                    ) : error ? (
                      error?.message
                    ) : null
                  }
                  InputProps={{
                    endAdornment: (
                      <>
                        {field.value ? (
                          <InputAdornment
                            style={{paddingRight: '9px'}}
                            position='end'
                          >
                            {field.value?.status && (
                              <ClusterStatusTag status={field.value.status} />
                            )}
                          </InputAdornment>
                        ) : null}
                      </>
                    )
                  }}
                />
              )}
            />
          </div>
        </div>

        <HorizontalSeperator />

        <div className={classes.librariesContainer}>
          <div className={classes.formLabel}>
            Add Libraries
            {/* <Info
              msg={predefinedToolTips.taskSource}
              placement={ToolTipPlacement.BottomStart}
            /> */}
          </div>
          {(tasks[taskIdx].packages || []).map((library, idx) => {
            return (
              <div key={idx} className={classes.libraryContainer}>
                <div className={classes.libraryName}>
                  {library.body?.path || library.body?.name}{' '}
                  {library.body?.version ? `(${library.body?.version})` : ''}
                </div>

                <IconButton
                  leadingIcon={Icons.ICON_CLOSE}
                  size={IconButtonSizes.SMALL}
                  variant={IconButtonVariants.PRIMARY}
                  onClick={() => removeLibrary(idx)}
                />
              </div>
            )
          })}
          <div>
            <Button
              leadingIcon={Icons.ICON_ADD_OUTLINED}
              onClick={() => setDrawerOpen(true)}
              data-testid='workflow-task-install-library'
              buttonText='Add'
              variant={ButtonVariants.TERTIARY}
              size={ButtonSizes.MEDIUM}
            />
          </div>
          {/* <div className={classes.inputWithInfoMessage}>
            <Controller
              key={taskIdx}
              name={`tasks.${taskIdx}.dependentLibraries`}
              control={control}
              render={({field, fieldState: {error}}) => (
                <TextArea
                  {...field}
                  label='Dependent Libraries (Optional)'
                  value={field.value}
                  error={Boolean(error)}
                  assistiveText={error?.message}
                />
              )}
            />
            <Info
              msg={predefinedToolTips.dependentLibraries}
              placement={ToolTipPlacement.BottomStart}
            />
          </div> */}
        </div>
        <HorizontalSeperator />

        <div>
          <div className={classes.runConditionHeader}>
            Run on the following Conditions
          </div>

          <div className={classes.inputWithInfoMessage}>
            <div className={classes.autocompleteDropdown}>
              <Controller
                key={taskIdx}
                name={`tasks.${taskIdx}.dependentOn`}
                control={control}
                render={({field, fieldState: {error}}) => (
                  <AutoCompleteWithAddOptions<string>
                    options={getMenuListOfNodes(tasks || [])}
                    value={field.value || []}
                    onChange={(value) => {
                      field.onChange(value)
                    }}
                    label='Depends On'
                    disabled={tasks.length === 1}
                    dataTestid='workflow-task-depends-on'
                  />
                )}
              />
            </div>
            {/* <Info
              msg={predefinedToolTips.dependsOn}
              placement={ToolTipPlacement.BottomStart}
            /> */}
          </div>
          <span className={`${classes.formLabel} ${classes.runIfDependencies}`}>
            Run if dependencies
          </span>
          <div className={classes.autocompleteDropdown}>
            <Controller
              key={taskIdx}
              name={`tasks.${taskIdx}.trigger_rule`}
              control={control}
              render={({
                field: {onChange, onBlur, value},
                fieldState: {error}
              }) => (
                <CustomDropDown
                  onBlur={() => onBlur()}
                  onChange={(value) => {
                    onChange(value)
                  }}
                  dropDownValue={value}
                  error={Boolean(error)}
                  disabled={tasks[taskIdx].dependentOn.length === 0}
                  assistiveText={Boolean(error) && error.message}
                />
              )}
            />
          </div>
        </div>
        <HorizontalSeperator />

        <div className={classes.eventsText}>
          <NotificationsActiveOutlinedIcon
            className={classes.notificationIcon}
          />
          <span className={classes.formFieldSubText}>Notifications</span>
        </div>
        <div className={classes.eventsCheckboxContainer}>
          <div className={classes.eventsCheckbox}>
            <WorkflowCheckbox
              control={control}
              name={`tasks.${taskIdx}.notification_preference.on_fail`}
              key={`tasks.${taskIdx}.notification_preference.on_fail`}
              labelText='Notify when this task fails'
              defaultValue={true}
            />
          </div>
        </div>
        <div className={classes.formFieldContainer}>
          <div className={`${classes.formLabel} ${classes.slackText}`}>
            <img
              src={`${config.cfMsdAssetUrl}/icons/darwin-slack.svg`}
              alt='Slack Channel'
            />
            <span className={classes.slackLabel}>Slack Channel</span>
            <span className={classes.subText}>(Optional)</span>
            <Info
              msg={predefinedToolTips.slackNotificationForTask}
              placement={ToolTipPlacement.BottomStart}
            />
          </div>
          <div className={classes.input}>
            <Controller
              key={taskIdx}
              name={`tasks.${taskIdx}.notify_on`}
              control={control}
              render={({field, fieldState: {error}}) => (
                <Input
                  {...field}
                  label='Channel Name (Optional)'
                  value={field?.value || ''}
                  onChange={(ev) => {
                    field.onChange(ev.target.value)
                  }}
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
            {tasks && tasks[taskIdx] && tasks[taskIdx]?.notify_on ? (
              <span>
                Notification will be sent to Slack DM & #
                {tasks[taskIdx]?.notify_on}
              </span>
            ) : (
              <span>Notification will be sent to Slack DM</span>
            )}
          </div>
        </div>
        <HorizontalSeperator />
        <div className={classes.formFieldContainer}>
          <div className={classes.formLabel}>
            Task Parameters (Optional)
            <Info
              msg={predefinedToolTips.workflowParameters}
              placement={ToolTipPlacement.BottomStart}
            />
          </div>
          <div>
            <div className={classes.taskParametersLabel}>
              Defined in this task:
              <Info
                msg={predefinedToolTips.workflowParameters}
                placement={ToolTipPlacement.BottomStart}
              />
            </div>
            <div className={classes.formFieldContainer}>
              {tasks[taskIdx].parameters.map((parameter, parameterIdx) => {
                return (
                  <ParametersInputField
                    tasks={tasks}
                    taskIdx={taskIdx}
                    parameterIdx={parameterIdx}
                    parameter={parameter}
                    onClose={onRemoveParameter}
                    control={control}
                    errorMessage={getErrorMessageForTaskParameter(
                      taskIdx,
                      parameterIdx
                    )}
                  />
                )
              })}
              <div className={classes.addIcon}>
                <Button
                  buttonText='Add Parameter'
                  onClick={onAddParameter}
                  leadingIcon={Icons.ICON_ADD_OUTLINED}
                  variant={ButtonVariants.TERTIARY}
                  size={ButtonSizes.SMALL}
                />
              </div>
            </div>
          </div>
          {filteredWorkflowParameters.length > 0 && (
            <div>
              <div className={classes.taskParametersLabel}>
                Pushed down from workflow parameters:
                <Info
                  msg={predefinedToolTips.workflowParameters}
                  placement={ToolTipPlacement.BottomStart}
                />
              </div>
              <div className={classes.formFieldContainer}>
                <WorkflowParameters
                  control={control}
                  parameters={filteredWorkflowParameters}
                  setValue={setValue}
                  formState={formState}
                  readOnly={true}
                />
              </div>
            </div>
          )}
        </div>
        <HorizontalSeperator />

        <div className={classes.formFieldContainer}>
          <div className={classes.inputWithInfoMessage}>
            <Controller
              key={taskIdx}
              name={`tasks.${taskIdx}.retries`}
              control={control}
              render={({field, fieldState: {error}}) => (
                <Input
                  {...field}
                  label='No. Of Retries (Optional)'
                  inputType='number'
                  onChange={(ev) => {
                    if (ev.target.value) {
                      field.onChange(Number(ev.target.value))
                    } else {
                      field.onChange(null)
                    }
                  }}
                  value={field.value?.toString() || ''}
                  error={Boolean(error)}
                  assistiveText={error?.message}
                />
              )}
            />
            <Info
              msg={predefinedToolTips.workflowTaskRetries}
              placement={ToolTipPlacement.BottomStart}
            />
          </div>
        </div>
        <HorizontalSeperator />

        <div className={classes.formFieldContainer}>
          <div className={classes.timeoutInputWithInfoMessage}>
            <Controller
              key={taskIdx}
              name={`tasks.${taskIdx}.timeout`}
              control={control}
              render={({field, fieldState: {error}}) => (
                <Input
                  {...field}
                  label='Timeout (Optional)'
                  inputType='number'
                  onChange={(ev) => {
                    if (ev.target.value) {
                      field.onChange(Number(ev.target.value))
                    } else {
                      field.onChange(null)
                    }
                  }}
                  value={field.value?.toString() || ''}
                  error={Boolean(error)}
                />
              )}
            />
            <div className={classes.formFieldSubText}>Seconds</div>
          </div>
        </div>
      </div>
      {isDialogOpen && (
        <CodespacePathSelectionModal
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          setSelectedNotebookPath={(val: string) => {
            setValue(`tasks.${taskIdx}.workspacePath`, val)
            trigger(`tasks.${taskIdx}.workspacePath`)
          }}
        />
      )}

      <ClusterInstallLibraryDrawer
        onClose={onDrawerClose}
        open={drawerOpen}
        triggerInstallLibrary={triggerInstallLibrary}
      />
    </>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  TaskCreateForm
)

export default StyleComponent
