import * as yup from 'yup'
import {nodeCapacityTypeConfig} from '../../../../components/compute/computeBasicConfiguration/constant'
import {
  IComputeFormData,
  IDropdownList,
  IWorkerConfig
} from '../../../../types/compute/common.type'
import {IComputeLimits} from '../graphqlApis/reducer'

// enums
export enum DiscTypes {
  SSD = 'SSD',
  HDD = 'HDD'
}

export enum MemoryUnits {
  GB = 'GB'
}

export enum InfraTemplateNames {
  'General Purpose' = 'General Purpose',
  'Memory Optimised' = 'Memory Optimised',
  'Storage Optimised' = 'Storage Optimised',
  'Compute Optimised' = 'Compute Optimised',
  'Custom' = 'Custom'
}

// constants

export const runtimeDropdownList: Array<IDropdownList<string>> = [
  {label: 'R10 : R1.1.1; TF 1.2', id: 1, value: 'R10 : R1.1.1; TF 1.2'},
  {label: 'R10 : R1.1.1; TF 1.3', id: 2, value: 'R10 : R1.1.1; TF 1.3'}
]

export const infraTemplateDropdownList: Array<
  IDropdownList<InfraTemplateNames>
> = [
  {
    label: InfraTemplateNames['General Purpose'],
    id: 1,
    value: InfraTemplateNames['General Purpose']
  },
  {
    label: InfraTemplateNames['Memory Optimised'],
    id: 2,
    value: InfraTemplateNames['Memory Optimised']
  },
  {
    label: InfraTemplateNames['Storage Optimised'],
    id: 3,
    value: InfraTemplateNames['Storage Optimised']
  },
  {
    label: InfraTemplateNames['Compute Optimised'],
    id: 4,
    value: InfraTemplateNames['Compute Optimised']
  },
  {label: InfraTemplateNames.Custom, id: 5, value: InfraTemplateNames.Custom}
]

export const defaultWorker: IWorkerConfig = {
  corePods: null,
  memoryPods: null,
  minPods: null,
  maxPods: null,
  nodeCapacityType: nodeCapacityTypeConfig.onDemand.name,
  nodeType: null,
  // discType: {id: 0, label: DiscTypes.SSD.toString(), value: DiscTypes.SSD},
  // storageSize: 64
  discType: {id: 0, label: 'gp2', value: 'gp2'},
  storageSize: 16
}

export const defaultDropdownValue = {id: -1, label: '', value: ''}

export const headNodeLimits = {
  cores: {
    min: 1,
    max: 90
  },
  memory: {
    min: 1,
    max: 736
  }
}

export const workerNodeLimits = {
  cores: {
    min: 1,
    max: 90
  },
  memory: {
    min: 1,
    max: 736
  },
  pods: {
    min: 0
  }
}

export const inactiveTimeLimits = {
  min: 15
}
const sparkConfigValidation = (value, ctx) => {
  if (!value) return true
  const lines = value.split('\n').filter((line) => line.trim() !== '')
  const isValid = lines.every((line) => line.includes('='))
  if (isValid) {
    return true
  } else {
    return ctx.createError({
      message: `Contains one or more invalid configs`,
      path: 'advance.spark_config'
    })
  }
}

export const computeSchema = (
  computeLimits: IComputeLimits,
  customClusterNameValidation?: (d: string) => boolean
) =>
  yup
    .object({
      clusterName: yup
        .string()
        .required('Cluster name is mandatory')
        .matches(
          /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
          'Invalid cluster name'
        )
        .test('isUnique', 'Cluster name should be unique!', (value) =>
          customClusterNameValidation
            ? customClusterNameValidation(value)
            : true
        ),
      runtime: yup
        .object()
        .nullable()
        .test(
          'validRuntime',
          'The runtime version is incompatible with the selected head or worker node types',
          function (value) {
            const nodeType = this.resolve(
              yup.ref('nodeType')
            ) as IDropdownList<string>
            const workerNodeType = (
              this.resolve(yup.ref('workers')) as Array<IWorkerConfig>
            ).some((worker) => worker.nodeType?.value === 'gpu')
            if (
              value?.class === 'CPU' &&
              (nodeType?.value === 'gpu' || workerNodeType)
            ) {
              return false // Invalidating the validation when the runtime config is "cpu" and nodeType value is "gpu"
            }
            return true
          }
        )
        .required('Runtime is mandatory'),
      inactiveInput: yup
        .number()
        .typeError('Inactive Time is mandatory')
        .required('Inactive Time is mandatory')
        .min(
          computeLimits?.data?.inactive_time_limits?.min ||
            inactiveTimeLimits.min,
          `Can't be < ${inactiveTimeLimits.min}`
        ),
      // template: yup.object().nullable().required('Template is mandatory'),
      nodeCapacityType: yup
        .string()
        .required('Node configuration is mandatory')
        .typeError('Node configuration is mandatory'),
      gpuPod: yup.object().when('nodeType', {
        is: (val) => val?.value === 'gpu', // Conditionally apply validation when value has a value
        then: yup
          .object()
          .required('GPU is mandatory')
          .typeError('GPU is mandatory'),
        otherwise: yup.object().nullable()
      }),
      headCoreInput: yup.number().when('nodeType', {
        is: (val) => val?.value !== 'gpu', // Conditionally apply validation when nodeType has a value
        then: yup
          .number()
          .max(
            computeLimits?.data?.head_node_limits?.cores?.max ||
              headNodeLimits.cores.max,
            `Cores can't be greater than ${
              computeLimits?.data?.head_node_limits?.cores?.max ||
              headNodeLimits.cores.max
            }`
          )
          .min(
            computeLimits?.data?.head_node_limits?.cores?.min ||
              headNodeLimits.cores.min,
            `Cores should be greater than or equal to ${
              computeLimits?.data?.head_node_limits?.cores?.min ||
              headNodeLimits.cores.min
            }`
          )
          .required('Core is mandatory')
          .typeError('Core is mandatory')
      }),
      headMemoryInput: yup.number().when('nodeType', {
        is: (val) => val?.value !== 'gpu', // Conditionally apply validation when value has a value
        then: yup
          .number()
          .max(
            computeLimits?.data?.head_node_limits?.memory?.max ||
              headNodeLimits.memory.max,
            `Memory can't be greater than ${
              computeLimits?.data?.head_node_limits?.memory?.max ||
              headNodeLimits.memory.max
            }`
          )
          .min(
            computeLimits?.data?.head_node_limits?.memory?.min ||
              headNodeLimits.memory.min,
            `Memory should be greater than or equal to ${
              computeLimits?.data?.head_node_limits?.memory?.min ||
              headNodeLimits.memory.min
            }`
          )
          .typeError('Memory is mandatory')
          .required('Memory is mandatory')
      }),
      workers: yup.array().of(
        yup.object().shape({
          nodeCapacityType: yup
            .string()
            .required('Node configuration is mandatory')
            .typeError('Node configuration is mandatory'),
          nodeType: yup.object().nullable().shape({
            id: yup.number(),
            label: yup.string(),
            value: yup.string()
          }),
          gpuPod: yup.object().when('nodeType', {
            is: (val) => val?.value === 'gpu', // Conditionally apply validation when value has a value
            then: yup
              .object()
              .required('GPU is mandatory')
              .typeError('GPU is mandatory'),
            otherwise: yup.object().nullable()
          }),
          corePods: yup.number().when('nodeType', {
            is: (val) => val?.value !== 'gpu', // Conditionally apply validation when value has a value
            then: yup
              .number()
              .max(
                computeLimits?.data?.worker_node_limits?.cores?.max ||
                  workerNodeLimits.cores.max,
                `Cores can't be greater than ${
                  computeLimits?.data?.worker_node_limits?.cores?.max ||
                  workerNodeLimits.cores.max
                }`
              )
              .min(
                computeLimits?.data?.worker_node_limits?.cores?.min ||
                  workerNodeLimits.cores.min,
                `Core should be greater than or equal to ${
                  computeLimits?.data?.worker_node_limits?.cores?.min ||
                  workerNodeLimits.cores.min
                }`
              )
              .typeError('Cores/Pod is mandatory')
              .required('Cores/Pod is mandatory'),
            otherwise: yup.number().nullable()
          }),
          memoryPods: yup.number().when('nodeType', {
            is: (val) => val?.value !== 'gpu', // Conditionally apply validation when value has a value
            then: yup
              .number()
              .max(
                computeLimits?.data?.worker_node_limits?.memory?.max ||
                  workerNodeLimits.memory.max,
                `Memory can't be greater than ${
                  computeLimits?.data?.worker_node_limits?.memory?.max ||
                  workerNodeLimits.memory.max
                }`
              )
              .min(
                computeLimits?.data?.worker_node_limits?.memory?.min ||
                  workerNodeLimits.memory.min,
                `Memory should be greater than or equal to ${
                  computeLimits?.data?.worker_node_limits?.memory?.min ||
                  workerNodeLimits.memory.min
                }`
              )
              .typeError('Memory/Pod is mandatory')
              .required('Memory/Pod is mandatory'),
            otherwise: yup.number().nullable()
          }),
          minPods: yup
            .number()
            .min(
              computeLimits?.data?.worker_node_limits?.pods?.min ||
                workerNodeLimits.pods.min,
              `Pods should be greater than or equal to ${
                computeLimits?.data?.worker_node_limits?.pods?.min ||
                workerNodeLimits.pods.min
              }`
            )
            .typeError('Min Pods is mandatory')
            .required('Min Pods is mandatory'),
          maxPods: yup
            .number()
            .min(
              yup.ref('minPods'),
              `Pods should be greater than or equal to minPods.`
            )
            .typeError('Max Pods is mandatory')
            .required('Max Pods is mandatory')
        })
      ),
      advance: yup
        .object()
        .notRequired()
        .optional()
        .shape({
          environmentVariables: yup.string(),
          logPath: yup.string(),
          initScripts: yup.string(),
          instanceRole: yup.object().nullable(),
          availabilityZone: yup.object().nullable(),
          spark_config: yup
            .string()
            .nullable()
            .test(
              'is-valid-spark-configs',
              'Contains one or more invalid configs',
              function (value, ctx) {
                return sparkConfigValidation(this.parent.spark_config, ctx)
              }
            ),
          rayParams: yup.object().shape({
            objectStoreMemory: yup
              .number()
              .min(1, 'Object Store Memory must be within the range 1 to 93')
              .max(93, 'Object Store Memory must be within the range 1 to 93')
              .typeError(
                'Object Store Memory must be withing the range 1 to 93'
              ),
            cpusOnHead: yup
              .number()
              .min(0)
              .typeError(
                'CPU on head must be within range 0 to head cores available'
              )
          })
        })
        .test('mustBeInrange', (value, ctx) => {
          if (!value.rayParams.cpusOnHead) {
            return true
          }

          if (
            value.rayParams.cpusOnHead >= 0 &&
            value.rayParams.cpusOnHead <= ctx.parent.headCoreInput
          ) {
            return true
          }

          return ctx.createError({
            message: `CPU on head must be within range 0 to head cores available`,
            path: 'advance.rayParams.cpusOnHead'
          })
        })
    })
    .required()
