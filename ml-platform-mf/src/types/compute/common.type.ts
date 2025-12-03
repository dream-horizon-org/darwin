import {RepositoryType} from '../../gql-enums/repository-type.enum'

export interface IDropdownList<T> {
  label: string
  id: number
  value: T
  class?: string
  type?: string
  link?: string
  count?: number
  spark_config?: Boolean
}

export enum DiscTypes {
  SSD = 'SSD',
  HDD = 'HDD'
}

export enum MemoryUnits {
  GB = 'GB'
}

export interface IMemory {
  value: string
  unit: MemoryUnits
}

export interface IClusterDetails {
  basic: {
    runtime: IDropdownList<string>
    inactiveTime: string
    cores: string
    template?: IDropdownList<string>
    memory: IMemory
    workers: Array<{
      cores: number
      memory: IMemory
      minPods: number
      maxPods: number
      discType: DiscTypes
      storageSize: IMemory
    }>
  }
}

export interface IConfiguration {
  name: string
  text: string
}

export interface IWorkerConfig {
  corePods: number
  memoryPods: number
  minPods: number
  maxPods: number
  discType: IDropdownList<string>
  storageSize: number
  nodeType?: IDropdownList<string>
  nodeCapacityType: string
  gpuPod?: IDropdownList<IGpuPod | string>
}

export interface IComputeResource {
  headCoreInput: number
  headMemoryInput: number
  headNodeCores: number
  headNodeMemory: number
  workedNodeMinPods: number
  workerNodeMaxPods: number
  workerMinCorePerPods: number
  workerMaxCorePerPods: number
  workerMinMemoryPerPods: number
  workerMaxMemoryPerPods: number
  maxGpuCount: number
  headGRamMemory: number
}

export interface IRayParams {
  objectStoreMemory: number
  cpusOnHead: number
}

export interface IComputeAdvance {
  environmentVariables: string
  logPath: string
  initScripts: string
  instanceRole: any
  availabilityZone: any
  rayParams: IRayParams
  spark_config: string
}

export interface IAutoTerminationPolicies {
  policyName: string
  enabled: boolean
  params: any
}

export interface IGpuPod {
  cores: number
  gRamMemory: number
  gRamType: string
  gpuCount: number
  memory: number
  name: string
}

export interface IComputeFormData extends IComputeResource {
  disabledForm?: boolean
  isJobCluster?: boolean
  clusterName: string
  runtime: IDropdownList<string>
  newRuntime: IDropdownList<string>
  inactiveInput: number
  clusterTerminationConfiguration: string
  autoTerminationPolicies: Array<IAutoTerminationPolicies>
  template: any
  workers: Array<IWorkerConfig>
  advance?: IComputeAdvance
  nodeType?: IDropdownList<string>
  gpuPod?: IDropdownList<IGpuPod | string>
  nodeCapacityType: string
}

export interface IComputeLibraryFormData {
  librarySource: string
  s3LibraryType: string
  workspacePath: string
  Package: string
  indexName: string
  filePath: string
  coordinates: string
  repository: string
  exclusions: string
  mavenRepository: RepositoryType
}

export interface MavenPackageData {
  group_id: string
  artifact_id: string
}
