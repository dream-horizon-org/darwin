import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React, {useEffect, useState} from 'react'

import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormSetValue,
  useWatch
} from 'react-hook-form'
import {Dropdown} from '../../../../bit-components/dropdown/index'
import {Input} from '../../../../bit-components/input/index'
import {Radio} from '../../../../bit-components/radio/index'
import {
  defaultDropdownValue,
  headNodeLimits
} from '../../../../modules/compute/pages/computeDetails/constants'
import {
  IComputeGpuPods,
  IComputeLimits,
  IComputeNodeTypes
} from '../../../../modules/compute/pages/graphqlApis/reducer'
import {getGpuNameFromGpuPod} from '../../../../modules/compute/pages/utils'
import {
  IComputeFormData,
  IDropdownList,
  IGpuPod,
  MemoryUnits
} from '../../../../types/compute/common.type'
import {nodeCapacityTypeConfig} from '../constant'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  control: Control<IComputeFormData, any>
  computeLimits: IComputeLimits
  formErrors: any
  computeGpuPods: IComputeGpuPods
  computeNodeTypes: IComputeNodeTypes
  getValues: UseFormGetValues<IComputeFormData>
  setValue: UseFormSetValue<IComputeFormData>
}

const ComputeHeadConfiguration = (props: IProps) => {
  const {
    classes,
    control,
    computeLimits,
    formErrors,
    computeGpuPods,
    computeNodeTypes,
    getValues,
    setValue
  } = props

  const disabledForm = useWatch({control, name: 'disabledForm'}) || false

  const [nodeType, setNodeType] = useState<IDropdownList<string> | null>(
    getValues('nodeType')
  )
  const [localNodeTypeChanged, setLocalNodeTypeChanged] = useState(false)
  const globalNodeType = getValues('nodeType')

  useEffect(() => {
    if (!localNodeTypeChanged) {
      setNodeType(globalNodeType)
    }
  }, [globalNodeType])

  const gpuPods: IDropdownList<IGpuPod>[] = (computeGpuPods.data || []).map(
    (gpuPod, idx) => {
      const gpuPodObj = {
        cores: gpuPod.cores,
        gpuCount: gpuPod.gpu_count,
        gRamMemory: gpuPod.g_ram_memory,
        gRamType: gpuPod.g_ram_type,
        memory: gpuPod.memory,
        name: gpuPod.name
      }
      return {
        id: idx,
        label: getGpuNameFromGpuPod(gpuPodObj),
        value: gpuPodObj
      }
    }
  )

  const nodeTypeList2: IDropdownList<string>[] = (
    computeNodeTypes.data || []
  ).map((nodeType, idx) => ({
    id: idx,
    label: nodeType.label,
    value: nodeType.id
  }))

  return (
    <div className={classes.container}>
      <div
        className={classes.nodeTypeWrapper}
        data-testid='head-node-type-dropdown'
      >
        <Controller
          name='nodeType'
          control={control}
          render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
            <Dropdown
              fieldVariant='withOutline'
              disabled={disabledForm}
              onBlur={() => onBlur()}
              menuLists={nodeTypeList2}
              label={'Node Type'}
              onChange={(ev, val) => {
                setNodeType(val)
                onChange(val)
                setLocalNodeTypeChanged(true)
              }}
              dropDownValue={value || defaultDropdownValue}
              error={Boolean(error)}
              assistiveText={Boolean(error) && error.message}
            />
          )}
        />
      </div>
      {nodeType?.value === 'gpu' && (
        <div className={classes.nodeTypeWrapper} style={{marginTop: '24px'}}>
          <Controller
            name='gpuPod'
            control={control}
            render={({
              field: {onChange, onBlur, value},
              fieldState: {error}
            }) => (
              <Dropdown
                fieldVariant='withOutline'
                disabled={disabledForm}
                onBlur={() => onBlur()}
                menuLists={gpuPods}
                label={'GPU  Pods'}
                onChange={(ev, val) => {
                  const gpuPodVal = val?.value as IGpuPod
                  setValue('headCoreInput', gpuPodVal?.cores || 0)
                  setValue('headMemoryInput', gpuPodVal?.memory || 0)
                  onChange(val)
                }}
                dropDownValue={value || defaultDropdownValue}
                error={Boolean(error)}
                assistiveText={Boolean(error) && error.message}
              />
            )}
          />
        </div>
      )}
      {nodeType?.value !== 'gpu' && (
        <>
          <div className={classes.heading2}>Configurations</div>
          <div className={classes.radioContainer}>
            {Object.values(nodeCapacityTypeConfig).map((config) => (
              <Controller
                key={config.name}
                name='nodeCapacityType'
                control={control}
                render={({field: {value, onChange}}) => {
                  return (
                    <Radio
                      disabled={disabledForm}
                      checked={value === config.name}
                      value={config.name}
                      text={config.text}
                      onChange={onChange}
                    />
                  )
                }}
              />
            ))}
            {formErrors?.nodeCapacityType && (
              <div className={classes.errorMsg}>
                {formErrors?.nodeCapacityType?.message}
              </div>
            )}
          </div>
          <div className={classes.headConfigWrapper}>
            <div className={classes.headConfigInputWrapper}>
              <Controller
                name='headCoreInput'
                control={control}
                render={({field, fieldState: {error}}) => (
                  <Input
                    {...field}
                    disabled={disabledForm}
                    value={field.value?.toString() || ''}
                    inputType='number'
                    label='Core'
                    error={Boolean(error)}
                    assistiveText={
                      (Boolean(error) && error.message) ||
                      `Upto ${
                        computeLimits?.data?.head_node_limits?.cores?.max ||
                        headNodeLimits.cores.max
                      } Cores`
                    }
                    data-testid='head-core-input'
                  />
                )}
              />
            </div>
            <div className={classes.headConfigInputWrapper}>
              <Controller
                name='headMemoryInput'
                control={control}
                render={({field, fieldState: {error}}) => (
                  <Input
                    {...field}
                    disabled={disabledForm}
                    value={field.value?.toString() || ''}
                    inputType='number'
                    label='Memory'
                    error={Boolean(error)}
                    assistiveText={
                      (Boolean(error) && error.message) ||
                      `Upto ${
                        computeLimits?.data?.head_node_limits?.memory?.max ||
                        headNodeLimits.memory.max
                      } GB`
                    }
                    data-testid='head-memory-input'
                  />
                )}
              />
            </div>
            <div className={classes.memoryUnit}>{MemoryUnits.GB}</div>
          </div>
        </>
      )}
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(
  ComputeHeadConfiguration
)

export default styleComponent
