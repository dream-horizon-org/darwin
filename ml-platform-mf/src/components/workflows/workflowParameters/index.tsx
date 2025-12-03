import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'

import {
  Control,
  FormState,
  useFieldArray,
  UseFormSetValue
} from 'react-hook-form'
import {v4 as uuidv4} from 'uuid'
import {
  Button,
  ButtonSizes,
  ButtonVariants
} from '../../../bit-components/button/index'
import {Icons} from '../../../bit-components/icon/index'
import {ToolTipPlacement} from '../../../bit-components/tooltip/index'
import {getDefaultWorkflowParameters} from '../../../modules/workflows/constants'
import {IWorkflowCreateForm} from '../../../modules/workflows/types/common.types'
import Info from '../../Info'
import {predefinedToolTips} from '../../Info/constants'
import WorkflowParameterRow from '../workflowParameterRow'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  control: Control<IWorkflowCreateForm, any>
  parameters: IWorkflowCreateForm['parameters']
  setValue: UseFormSetValue<IWorkflowCreateForm>
  readOnly?: boolean
  showLabel?: boolean
  formState: FormState<IWorkflowCreateForm>
}

const WorkflowParameters = (prop: IProps) => {
  const {
    classes,
    control,
    parameters,
    setValue,
    readOnly,
    showLabel,
    formState
  } = prop

  const {
    fields: parametersFields,
    append: appendParameters,
    remove: removeParameters
  } = useFieldArray({name: 'parameters', control})

  const onAddParameter = () => {
    appendParameters(getDefaultWorkflowParameters())
  }

  const onRemoveParameter = (idx: number) => {
    removeParameters(idx)
  }

  // const onAddParameter = () => {
  //   let currentValue = parameters
  //   if (!currentValue) currentValue = [getDefaultWorkflowParameters()]
  //   currentValue.push({
  //     id: uuidv4(),
  //     label: '',
  //     value: ''
  //   })
  //   setValue('parameters', currentValue)
  // }

  // const onRemoveParameter = (id: string) => {
  //   let currentValue = parameters || []

  //   // if (currentValue.length === 1) return

  //   const parameterIdx = currentValue.findIndex(
  //     (parameter) => parameter.id === id
  //   )
  //   if (parameterIdx === -1) return

  //   currentValue.splice(parameterIdx, 1)

  //   setValue('parameters', currentValue, {shouldDirty: true})
  // }

  return (
    <div className={classes.formFieldContainer}>
      {showLabel && (
        <div className={classes.formLabel}>
          Workflow Parameters
          <span className={classes.subText}>(Optional)</span>
          <Info
            msg={predefinedToolTips.workflowGlobalParameters}
            placement={ToolTipPlacement.BottomStart}
          />
        </div>
      )}
      <div className={classes.input}>
        {parametersFields?.map((parameter, idx) => (
          <WorkflowParameterRow
            control={control}
            label={`parameters.${idx}.label`}
            value={`parameters.${idx}.value`}
            errorMessage={formState?.errors?.parameters?.[idx]?.label?.message}
            id={idx}
            key={parameter.id}
            onClose={onRemoveParameter}
            readOnly={readOnly}
          />
        ))}
        {!readOnly && (
          <div className={classes.addIcon}>
            <Button
              buttonText='Add Parameter'
              onClick={onAddParameter}
              leadingIcon={Icons.ICON_ADD_OUTLINED}
              variant={ButtonVariants.TERTIARY}
              size={ButtonSizes.SMALL}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default withStyles(styles)(WorkflowParameters)
