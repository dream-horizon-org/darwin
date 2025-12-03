import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import {Button, ButtonVariants} from '../../../../bit-components/button/index'
import {Dropdown} from '../../../../bit-components/dropdown/index'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../../bit-components/icon-button/index'
import {Icons} from '../../../../bit-components/icon/index'
import {Input} from '../../../../bit-components/input/index'
import {Radio} from '../../../../bit-components/radio/index'

import React, {useEffect, useState} from 'react'
import {
  Controller,
  UseFormGetValues,
  UseFormSetValue,
  useWatch
} from 'react-hook-form'
import {compose} from 'redux'
import {
  defaultDropdownValue,
  defaultWorker,
  workerNodeLimits
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
import {nodeCapacityTypeConfig, nodeTypeList} from '../constant'
import styles from './computeWorkerConfigurationJss'
interface IProps extends WithStyles<typeof styles> {
  control: any
  workerIdx: number
  computeDiscTypesList: Array<any>
  memoryToCoreRatio: number | null
  showDiscSetting?: boolean
  deleteWorkerItem: (idx: number) => void
  totalWorkersCount: number
  computeLimits: IComputeLimits
  formErrors: any
  computeGpuPods: IComputeGpuPods
  computeNodeTypes: IComputeNodeTypes
  getValues: UseFormGetValues<IComputeFormData>
  setValue: UseFormSetValue<IComputeFormData>
  workerId: string
}

const ComputeWorkerConfiguration = (props: IProps) => {
  const {
    classes,
    control,
    workerIdx,
    computeDiscTypesList = [],
    memoryToCoreRatio = null,
    showDiscSetting = false,
    computeLimits,
    deleteWorkerItem,
    totalWorkersCount,
    formErrors,
    computeGpuPods,
    computeNodeTypes,
    getValues,
    setValue,
    workerId
  } = props

  const disabledForm = useWatch({control, name: 'disabledForm'}) || false
  const [discSettingsToggle, setDiscSettingsToggle] = useState(false)
  const [nodeType, setNodeType] = useState<IDropdownList<string> | null>(
    getValues('workers')[workerIdx]?.nodeType || defaultDropdownValue
  )
  const [localNodeTypeChanged, setLocalNodeTypeChanged] = useState(false)
  const globalNodeType =
    getValues('workers')[workerIdx]?.nodeType || defaultDropdownValue

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
    <div className={classes.wrapper} key={workerId}>
      <div className={classes.title}>
        <span>Worker Group {workerIdx + 1}</span>
        <span>
          <IconButton
            onClick={() => deleteWorkerItem(workerIdx)}
            leadingIcon={Icons.ICON_DELETE_OUTLINE}
            actionableVariants={ActionableIconButtonVariants.ACTIONABLE_PRIMARY}
            size={IconButtonSizes.LARGE}
            actionable={true}
          />
        </span>
      </div>
      <div className={classes.info}>
        <div
          className={classes.nodeTypeWrapper}
          data-testid='worker-node-type-dropdown'
        >
          <Controller
            name={`workers.${workerIdx}.nodeType`}
            key={workerId}
            control={control}
            render={({field, fieldState: {error}}) => (
              <Dropdown
                fieldVariant='withOutline'
                {...field}
                disabled={disabledForm}
                menuLists={nodeTypeList2}
                label={'Node Type'}
                inputValue={field?.value?.label || ''}
                onChange={(ev, val) => {
                  field.onChange(val)
                  setNodeType(val)
                }}
                dropDownValue={field?.value?.label || defaultDropdownValue}
                error={Boolean(error?.message || null)}
                assistiveText={error?.message || ''}
              />
            )}
          />
        </div>
        {nodeType?.value === 'gpu' && (
          <div className={classes.nodeTypeWrapper} style={{marginTop: '24px'}}>
            <Controller
              name={`workers.${workerIdx}.gpuPod`}
              key={workerId}
              control={control}
              render={({field, fieldState: {error}}) => (
                <Dropdown
                  fieldVariant='withOutline'
                  {...field}
                  disabled={disabledForm}
                  menuLists={gpuPods}
                  label={'GPU Pods'}
                  inputValue={field?.value?.label || ''}
                  onChange={(ev, val) => {
                    field.onChange(val)
                    const gpuPodVal = val?.value as IGpuPod
                    setValue(
                      `workers[${workerIdx}].corePods` as `workers.${typeof workerIdx}.corePods`,
                      gpuPodVal?.cores
                    )
                    setValue(
                      `workers[${workerIdx}].memoryPods` as `workers.${typeof workerIdx}.memoryPods`,
                      gpuPodVal?.memory
                    )
                  }}
                  dropDownValue={field?.value?.label || defaultDropdownValue}
                  error={Boolean(error?.message || null)}
                  assistiveText={error?.message ?? error?.message}
                  dataTestId='worker-core-pod-input'
                />
              )}
            />
          </div>
        )}
        <>
          <div className={classes.heading2}>Configurations</div>

          {nodeType?.value !== 'gpu' && (
            <div className={classes.radioContainer}>
              {Object.values(nodeCapacityTypeConfig).map((config) => (
                <Controller
                  key={`${workerId}-${config.name}`}
                  name={`workers.${workerIdx}..nodeCapacityType`}
                  control={control}
                  render={({field}) => {
                    return (
                      <div data-testid='worker-node-capacity-type-radio'>
                        <Radio
                          {...field}
                          checked={field?.value === config.name}
                          text={config.text}
                          disabled={disabledForm}
                          value={config.name}
                          onChange={(ev) => {
                            field.onChange(config.name)
                          }}
                        />
                      </div>
                    )
                  }}
                />
              ))}
              {formErrors['workers'] &&
                formErrors['workers'][workerIdx] &&
                formErrors['workers'][workerIdx]['nodeCapacityType'] && (
                  <div className={classes.errorMsg}>
                    {
                      formErrors['workers'][workerIdx]['nodeCapacityType'][
                        'message'
                      ]
                    }
                  </div>
                )}
            </div>
          )}
          <div className={classes.inputList}>
            {nodeType?.value !== 'gpu' && (
              <>
                <div className={classes.inputWrapper}>
                  <Controller
                    name={`workers.${workerIdx}.corePods`}
                    key={workerId}
                    control={control}
                    render={({field, fieldState: {error}}) => (
                      <Input
                        {...field}
                        disabled={disabledForm}
                        inputType='number'
                        label='Cores/Pod'
                        onChange={(ev) => {
                          field.onChange(ev)
                          if (memoryToCoreRatio) {
                            setValue(
                              `workers[${workerIdx}].memoryPods` as `workers.${typeof workerIdx}.memoryPods`,
                              Number(ev.target.value) * memoryToCoreRatio
                            )
                          }
                        }}
                        error={Boolean(error?.message || null)}
                        assistiveText={
                          error?.message ||
                          `Upto ${
                            computeLimits?.data?.worker_node_limits?.cores
                              ?.max || workerNodeLimits.cores.max
                          } Cores`
                        }
                        data-testid='worker-core-pod-input'
                      />
                    )}
                  />
                </div>
                <div
                  className={classes.inputWrapper}
                  data-testid='worker-memory-pod-input'
                >
                  <Controller
                    name={`workers.${workerIdx}.memoryPods`}
                    key={workerId}
                    control={control}
                    render={({field, fieldState: {error}}) => (
                      <Input
                        {...field}
                        disabled={disabledForm}
                        inputType='number'
                        label='Memory/Pod'
                        onChange={(ev) => {
                          field.onChange(ev)
                          if (memoryToCoreRatio) {
                            setValue(
                              `workers[${workerIdx}].corePods` as `workers.${typeof workerIdx}.corePods`,
                              Number(ev.target.value) / memoryToCoreRatio
                            )
                          }
                        }}
                        error={Boolean(error?.message || null)}
                        assistiveText={
                          error?.message ||
                          `Upto ${
                            computeLimits?.data?.worker_node_limits?.memory
                              ?.max || workerNodeLimits.memory.max
                          } GB`
                        }
                      />
                    )}
                  />
                  <span>{MemoryUnits.GB}</span>
                </div>
              </>
            )}
            <div className={classes.inputWrapper}>
              <Controller
                name={`workers.${workerIdx}.minPods`}
                key={workerId}
                control={control}
                render={({field, fieldState: {error}}) => (
                  <Input
                    {...field}
                    disabled={disabledForm}
                    inputType='number'
                    label='Min Pods'
                    error={Boolean(error?.message || null)}
                    assistiveText={error?.message ?? error?.message}
                    data-testid='worker-min-pod-input'
                  />
                )}
              />
            </div>
            <div className={classes.inputWrapper}>
              <Controller
                name={`workers.${workerIdx}.maxPods`}
                key={workerId}
                control={control}
                render={({field, fieldState: {error}}) => (
                  <Input
                    {...field}
                    disabled={disabledForm}
                    inputType='number'
                    label='Max Pods'
                    error={Boolean(error?.message || null)}
                    assistiveText={error?.message ?? error?.message}
                    data-testid='worker-max-pod-input'
                  />
                )}
              />
            </div>
          </div>
          {showDiscSetting && (
            <>
              <div className={classes.discSettingBtn}>
                <Button
                  buttonText={'Disc Setting'}
                  leadingIcon={
                    discSettingsToggle
                      ? Icons.ICON_ARROW_DROP_UP
                      : Icons.ICON_ARROW_DROP_DOWN
                  }
                  onClick={() => setDiscSettingsToggle(!discSettingsToggle)}
                  variant={ButtonVariants.TERTIARY}
                />
              </div>
              <div
                className={
                  discSettingsToggle
                    ? classes.discSettingsWrapperOpen
                    : classes.discSettingsWrapperClosed
                }
              >
                <div className={classes.discSettingDrop}>
                  <Controller
                    name={`workers.${workerIdx}.discType`}
                    key={workerId}
                    control={control}
                    render={({field, fieldState: {error}}) => (
                      <Dropdown
                        fieldVariant='withOutline'
                        {...field}
                        disabled={disabledForm}
                        menuLists={computeDiscTypesList}
                        label={'Disc type'}
                        inputValue={field?.value?.label || ''}
                        onChange={(ev, val) => {
                          field.onChange(val)
                        }}
                        dropDownValue={
                          field?.value?.label || defaultDropdownValue
                        }
                        error={Boolean(error?.message || null)}
                        assistiveText={error?.message || ''}
                      />
                    )}
                  />
                </div>
                <div className={classes.discSettingInput}>
                  <Controller
                    name={`workers.${workerIdx}.storageSize`}
                    key={workerId}
                    control={control}
                    render={({field, fieldState: {error}}) => (
                      <Input
                        {...field}
                        disabled={disabledForm}
                        inputType='number'
                        label='Storage Size'
                        error={Boolean(error?.message || null)}
                        assistiveText={error?.message ?? error?.message}
                      />
                    )}
                  />
                  <span>{MemoryUnits.GB}</span>
                </div>
              </div>
            </>
          )}
        </>
      </div>
    </div>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(
  ComputeWorkerConfiguration
)

export default styleComponent
