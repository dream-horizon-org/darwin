import React, {useEffect, useState} from 'react'
import {Radio} from '../../../../bit-components/radio/index'

import {withStyles, WithStyles} from '@mui/styles'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {Accordion, AccordionDetails, AccordionSummary} from '@mui/material'
import {Control, Controller, UseFormSetValue, useWatch} from 'react-hook-form'
import {Checkbox} from '../../../../bit-components/checkbox/index'
import {Input} from '../../../../bit-components/input/index'
import {
  IComputeFormData,
  IConfiguration
} from '../../../../types/compute/common.type'
import styles from './computeTerminationConfigurationJSS'
import {
  autoTerminateConfiguration,
  defaultAutoTerminationConfigs,
  defaultInactiveTime,
  policyNames
} from './constant'

interface IProps extends WithStyles<typeof styles> {
  control: Control<IComputeFormData, any>
  setValue: UseFormSetValue<IComputeFormData>
}

const computeTerminationConfiguration = (props: IProps) => {
  const {classes, control, setValue} = props
  const [expanded, setExpanded] = React.useState<boolean>(false)
  const inactiveTime = useWatch({control, name: 'inactiveInput'})
  const disabledForm = useWatch({control, name: 'disabledForm'}) || false
  const autoTerminationPolicies = useWatch({
    control,
    name: 'autoTerminationPolicies'
  })
  const clusterTerminationConfiguration = useWatch({
    control,
    name: 'clusterTerminationConfiguration'
  })

  const [lastPositiveInactiveTime, setLastPositiveInactiveTime] =
    useState<number>(defaultInactiveTime)
  const [
    lastSelectedAutoTerminationPolicies,
    setLastSelectedAutoTerminationPolicies
  ] = useState(defaultAutoTerminationConfigs)

  const cpuUsagePolicy = autoTerminationPolicies?.find(
    (policy) => policy.policyName === policyNames.ClusterCPUUsage
  )

  if (cpuUsagePolicy && cpuUsagePolicy.params.headNodeCpuUsageThreshold > 100) {
    setValue(
      'autoTerminationPolicies',
      autoTerminationPolicies.map((policy) => {
        if (policy.policyName === policyNames.ClusterCPUUsage) {
          policy.params.headNodeCpuUsageThreshold = 100
        }
        return policy
      })
    )
  }

  if (cpuUsagePolicy && cpuUsagePolicy.params.headNodeCpuUsageThreshold < 0) {
    setValue(
      'autoTerminationPolicies',
      autoTerminationPolicies.map((policy) => {
        if (policy.policyName === policyNames.ClusterCPUUsage) {
          policy.params.headNodeCpuUsageThreshold = 0
        }
        return policy
      })
    )
  }

  if (
    cpuUsagePolicy &&
    cpuUsagePolicy.params.workerNodeCpuUsageThreshold > 100
  ) {
    setValue(
      'autoTerminationPolicies',
      autoTerminationPolicies.map((policy) => {
        if (policy.policyName === policyNames.ClusterCPUUsage) {
          policy.params.workerNodeCpuUsageThreshold = 100
        }
        return policy
      })
    )
  }

  if (cpuUsagePolicy && cpuUsagePolicy.params.workerNodeCpuUsageThreshold < 0) {
    setValue(
      'autoTerminationPolicies',
      autoTerminationPolicies.map((policy) => {
        if (policy.policyName === policyNames.ClusterCPUUsage) {
          policy.params.workerNodeCpuUsageThreshold = 0
        }
        return policy
      })
    )
  }

  useEffect(() => {
    setValue(
      'clusterTerminationConfiguration',
      inactiveTime >= 0 && autoTerminationPolicies?.length > 0
        ? autoTerminateConfiguration.autoTerminate.name
        : autoTerminateConfiguration.alwaysRunning.name
    )
  }, [autoTerminationPolicies, inactiveTime])

  useEffect(() => {
    if (inactiveTime >= 0) {
      setLastPositiveInactiveTime(inactiveTime)
    }
  }, [inactiveTime])

  useEffect(() => {
    if (autoTerminationPolicies?.length > 0) {
      setLastSelectedAutoTerminationPolicies(autoTerminationPolicies)
    }
  }, [autoTerminationPolicies])

  const onChangeAutoTerminationConfig = (config: IConfiguration) => {
    if (config.name === autoTerminateConfiguration.autoTerminate.name) {
      setValue('inactiveInput', lastPositiveInactiveTime)
      setValue('autoTerminationPolicies', lastSelectedAutoTerminationPolicies)
    } else if (config.name === autoTerminateConfiguration.alwaysRunning.name) {
      setValue('autoTerminationPolicies', [])
    }
  }

  const handleChange = () => {
    setExpanded(!expanded)
  }

  return (
    <div className={classes.container}>
      <div>
        <div className={classes.radioContainer}>
          {Object.values(autoTerminateConfiguration).map((config) => (
            <Controller
              key={config.name}
              name='clusterTerminationConfiguration'
              control={control}
              render={({field: {value, onChange}}) => {
                return (
                  <Radio
                    disabled={disabledForm}
                    checked={config.name === clusterTerminationConfiguration}
                    value={config.name}
                    text={config.text}
                    onChange={(e) => {
                      onChange(e)
                      onChangeAutoTerminationConfig(config)
                    }}
                  />
                )
              }}
            />
          ))}
        </div>
        {clusterTerminationConfiguration ===
          autoTerminateConfiguration.autoTerminate.name && (
          <div className={classes.terminateClusterInputContainer}>
            <div>Terminate cluster in</div>
            <div className={classes.inactiveTimeInput}>
              <Controller
                name='inactiveInput'
                control={control}
                render={({
                  field: {name, onBlur, onChange, ref, value},
                  fieldState: {error}
                }) => (
                  <Input
                    disabled={disabledForm}
                    name={name}
                    onBlur={onBlur}
                    onChange={onChange}
                    value={value?.toString() || ''}
                    inputType='number'
                    error={Boolean(error)}
                    assistiveText={Boolean(error) && error.message}
                    data-testid='compute-create-cluster-inactive-time-input'
                  />
                )}
              />
            </div>
            <div>Mins</div>
          </div>
        )}
        {clusterTerminationConfiguration ===
          autoTerminateConfiguration.autoTerminate.name && (
          <Accordion
            expanded={expanded}
            onChange={handleChange}
            className={classes.accordion}
          >
            <AccordionSummary
              aria-controls='panel1d-content'
              id='panel1d-header'
            >
              <div className={classes.accordionSummary}>
                <div>Advanced Termination settings</div>
                <div>
                  {!expanded ? (
                    <KeyboardArrowDownIcon />
                  ) : (
                    <KeyboardArrowUpIcon />
                  )}
                </div>
              </div>
            </AccordionSummary>
            <AccordionDetails classes={{root: classes.accordionDetails}}>
              <div className={classes.autoTerminateParams}>
                <div className={classes.terminateClusterName}>
                  Terminate the cluster
                </div>
                <div className={classes.autoTerminateParamContainer}>
                  <Controller
                    name='autoTerminationPolicies.1.enabled'
                    control={control}
                    render={({
                      field: {name, onChange, value},
                      fieldState: {error}
                    }) => (
                      <Checkbox
                        disabled={disabledForm}
                        checked={value}
                        name={name}
                        onChange={onChange}
                      />
                    )}
                  />
                  <div>If min head node usage is less than</div>{' '}
                  <div className={classes.inactiveTimeInput}>
                    <Controller
                      name='autoTerminationPolicies.1.params.headNodeCpuUsageThreshold'
                      control={control}
                      render={({
                        field: {name, onBlur, onChange, value},
                        fieldState: {error}
                      }) => (
                        <Input
                          disabled={disabledForm}
                          name={name}
                          onBlur={onBlur}
                          onChange={onChange}
                          value={value?.toString() || ''}
                          inputType='number'
                          error={Boolean(error)}
                          assistiveText={Boolean(error) && error.message}
                        />
                      )}
                    />
                    <div className={classes.percentSign}>%</div>
                  </div>{' '}
                  <div>& min worker node usage is less than</div>{' '}
                  <div className={classes.inactiveTimeInput}>
                    <Controller
                      name='autoTerminationPolicies.1.params.workerNodeCpuUsageThreshold'
                      control={control}
                      render={({
                        field: {name, onBlur, onChange, ref, value},
                        fieldState: {error}
                      }) => (
                        <Input
                          disabled={disabledForm}
                          name={name}
                          onBlur={onBlur}
                          onChange={onChange}
                          value={value?.toString() || ''}
                          inputType='number'
                          error={Boolean(error)}
                          assistiveText={Boolean(error) && error.message}
                        />
                      )}
                    />
                    <div className={classes.percentSign}>%</div>
                  </div>
                </div>
                <div className={classes.autoTerminateParamContainer}>
                  <div>
                    <Controller
                      name='autoTerminationPolicies.2.enabled'
                      control={control}
                      render={({
                        field: {name, onChange, value},
                        fieldState: {error}
                      }) => (
                        <Checkbox
                          disabled={disabledForm}
                          checked={value}
                          name={name}
                          onChange={onChange}
                        />
                      )}
                    />
                    If there is no active Ray Job
                  </div>
                </div>
                <div className={classes.autoTerminateParamContainer}>
                  <div>
                    <Controller
                      name='autoTerminationPolicies.0.enabled'
                      control={control}
                      render={({
                        field: {name, onChange, value},
                        fieldState: {error}
                      }) => (
                        <Checkbox
                          disabled={disabledForm}
                          checked={value}
                          name={name}
                          onChange={onChange}
                        />
                      )}
                    />
                    If there is no activity on Jupyter Links
                  </div>
                </div>
              </div>
            </AccordionDetails>
          </Accordion>
        )}
      </div>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(
  computeTerminationConfiguration
)

export default styleComponent
