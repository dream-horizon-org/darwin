import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import {Button, ButtonVariants} from '../../../bit-components/button/index'
import {Icons} from '../../../bit-components/icon/index'
import {ToolTipPlacement} from '../../../bit-components/tooltip/index'

import React, {useEffect, useState} from 'react'
import {Controller, useFieldArray, useWatch} from 'react-hook-form'
import {
  Control,
  UseFormGetValues,
  UseFormSetValue
} from 'react-hook-form/dist/types/form'
import {compose} from 'redux'
import {TextArea} from '../../../bit-components/text-area/index'
import {defaultWorker} from '../../../modules/compute/pages/computeDetails/constants'
import {
  IComputeGpuPods,
  IComputeLimits,
  IComputeNodeTypes
} from '../../../modules/compute/pages/graphqlApis/reducer'
import {
  IComputeFormData,
  IWorkerConfig
} from '../../../types/compute/common.type'
import Info from '../../Info'
import {predefinedToolTips} from '../../Info/constants'
import RuntimeDrop from '../computeRuntimeDrop/RuntimeDrop'
import styles from './computeBasicConfigurationJss'
import ComputeHeadConfiguration from './computeHeadConfiguration'
import ComputeTerminationConfiguration from './computeTerminationConfiguration/computeTerminationConfiguration'
import ComputeWorkerConfiguration from './computeWorkerConfiguration/computeWorkerConfiguration'

interface IProps extends WithStyles<typeof styles> {
  control: Control<IComputeFormData, any>
  setValue: UseFormSetValue<IComputeFormData>
  clusterCpuRuntimeListData: Array<any>
  clusterGpuRuntimeListData: Array<any>
  clusterCustomRuntimeListData: Array<any>
  clusterOthersRuntimeListData: Array<any>
  computeDiscTypesData: Array<any>
  computeTemplatesData: Array<any>
  deafultMemoryToCoreRatio?: number
  computeLimits: IComputeLimits
  formErrors: any
  computeGpuPods: IComputeGpuPods
  computeNodeTypes: IComputeNodeTypes
  getValues: UseFormGetValues<IComputeFormData>
  clusterId?: string
}

const ComputeBasicConfiguration = (props: IProps) => {
  const {
    classes,
    control,
    setValue,
    clusterCpuRuntimeListData = [],
    clusterGpuRuntimeListData = [],
    clusterCustomRuntimeListData = [],
    clusterOthersRuntimeListData = [],
    computeDiscTypesData = [],
    computeTemplatesData = [],
    deafultMemoryToCoreRatio,
    computeLimits,
    formErrors,
    computeGpuPods,
    computeNodeTypes,
    getValues,
    clusterId
  } = props

  const [memoryToCoreRatio, setMemoryToCoreRatio] = useState(
    deafultMemoryToCoreRatio || null
  )
  const [isSparkEnabled, setIsSparkEnabled] = useState(false)
  useEffect(() => {
    if (deafultMemoryToCoreRatio) setMemoryToCoreRatio(deafultMemoryToCoreRatio)
  }, [deafultMemoryToCoreRatio])

  const {
    fields: workerFields,
    append: workerAppend,
    remove: workerRemove
  } = useFieldArray({
    name: 'workers',
    control
  })

  const addWorker = () => {
    workerAppend({...defaultWorker})
  }

  const removeWorker = (idx: number) => {
    workerRemove(idx)
  }
  // const clusterCpuRuntimeList = clusterCpuRuntimeListData.map((item, idx) => ({
  //   id: idx,
  //   label: {
  //     name: item.name,
  //     created_by: item.created_by
  //   },
  //   value: item.name
  // }))
  // const clusterGpuRuntimeList = clusterGpuRuntimeListData.map((item, idx) => ({
  //   id: idx,
  //   label: {
  //     name: item.name,
  //     created_by: item.created_by
  //   },
  //   value: item.name
  // }))

  // const clusterCustomRuntimeList = clusterCustomRuntimeListData.map(
  //   (item, idx) => ({
  //     id: idx,
  //     label: {
  //       name: item.name,
  //       created_by: item.created_by
  //     },
  //     value: item.name
  //   })
  // )

  // const clusterOthersRuntimeList = clusterOthersRuntimeListData
  //   ? clusterOthersRuntimeListData.map((item, idx) => ({
  //       id: idx,
  //       label: {
  //         name: item.name,
  //         created_by: item.created_by
  //       },
  //       value: item.name
  //     }))
  //   : []

  const computeDiscTypesList = computeDiscTypesData.map((item, idx) => ({
    id: idx,
    label: item,
    value: item
  }))
  const computeTemplatesList = computeTemplatesData?.map((item) => ({
    id: Number(1),
    templateId: item.template_id,
    label: item.display_name,
    value: item.display_name,
    ratio: item.memory_per_core
  }))

  const disabledForm = useWatch({control, name: 'disabledForm'}) || false
  const isJobCluster = useWatch({control, name: 'isJobCluster'}) || false
  const getRuntimeValue = useWatch({control, name: 'runtime'}) || null

  return (
    <div className={classes.wrapper}>
      <div className={classes.heading1}>
        Environment Details
        <Info
          msg={predefinedToolTips.environmentDetails}
          placement={ToolTipPlacement.BottomStart}
        />
      </div>
      <div className={classes.inputWrapper}>
        <Controller
          name='runtime'
          control={control}
          render={({
            field: {onChange, onBlur, value, name, ref},
            fieldState: {error, isTouched, isDirty}
          }) => (
            <div data-testid='compute-runtime-dropdown'>
              <RuntimeDrop
                disabled={disabledForm}
                onBlur={() => onBlur()}
                onChange={(val) => {
                  setIsSparkEnabled(!!value?.spark_config)
                  onChange(val)
                }}
                dropDownValue={value}
                error={error}
                assistiveText={error?.message}
                setValue={setValue}
                isSparkEnabled={isSparkEnabled}
                setIsSparkEnabled={setIsSparkEnabled}
                clusterId={clusterId}
              />
            </div>
          )}
        />
      </div>
      {getRuntimeValue && isSparkEnabled && (
        <div className={classes.inputComp}>
          <Controller
            name={`advance.spark_config`}
            control={control}
            render={({field, fieldState: {error}}) => {
              return (
                <TextArea
                  {...field}
                  value={field.value || ''}
                  label='Spark Configs'
                  disabled={disabledForm}
                  error={error?.message.length > 0}
                  assistiveText={
                    error?.message ||
                    'Format: key=value pairs with each pair on new line. Example:\nkey1=value1'
                  }
                />
              )
            }}
          />
        </div>
      )}

      {!isJobCluster && (
        <>
          <div className={classes.heading1}>
            Cluster Termination Configurations
          </div>
          <ComputeTerminationConfiguration
            control={control}
            setValue={setValue}
          />
        </>
      )}
      <div className={classes.heading1}>
        Infrastructure Configurations
        {/* <Info
          msg='Template decides the ratio of cores to memory in each worker group.'
          placement={ToolTipPlacement.BottomStart}
        /> */}
      </div>
      <div className={classes.heading2}>
        Head Configurations
        <Info
          msg={predefinedToolTips.headConfiguration}
          placement={ToolTipPlacement.BottomStart}
        />
      </div>
      <ComputeHeadConfiguration
        control={control}
        computeLimits={computeLimits}
        formErrors={formErrors}
        computeGpuPods={computeGpuPods}
        computeNodeTypes={computeNodeTypes}
        getValues={getValues}
        setValue={setValue}
      />
      <div className={classes.heading2}>
        Worker Configurations
        <Info
          msg={predefinedToolTips.workerConfiguration}
          placement={ToolTipPlacement.BottomStart}
        />
      </div>

      {workerFields.map((worker, idx) => (
        <ComputeWorkerConfiguration
          workerId={worker.id}
          key={idx}
          control={control}
          workerIdx={idx}
          computeDiscTypesList={computeDiscTypesList}
          memoryToCoreRatio={memoryToCoreRatio}
          deleteWorkerItem={removeWorker}
          totalWorkersCount={workerFields.length}
          computeLimits={computeLimits}
          formErrors={formErrors}
          computeGpuPods={computeGpuPods}
          computeNodeTypes={computeNodeTypes}
          getValues={getValues}
          setValue={setValue}
        />
      ))}
      {/* <ComputeWorkerConfiguration key={1} control={control} workerIdx={1} /> */}
      <div className={classes.addBtnWrapper}>
        <div data-testid='add-worker-group-button'>
          <Button
            buttonText={'Add Worker Group'}
            leadingIcon={Icons.ICON_ADD_OUTLINED}
            onClick={addWorker}
            variant={ButtonVariants.TERTIARY}
            disabled={disabledForm}
          />
        </div>
        {/* <button type='button' onClick={addWorker}>+ Add Worker Group</button> */}
      </div>
    </div>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(
  ComputeBasicConfiguration
)

export default styleComponent
