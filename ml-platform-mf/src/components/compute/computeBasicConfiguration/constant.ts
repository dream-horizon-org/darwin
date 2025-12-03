import {RepositoryType} from '../../../gql-enums/repository-type.enum'
import {IConfiguration} from '../../../types/compute/common.type'

export const nodeCapacityTypeConfig: {
  onDemand: IConfiguration
  spot: IConfiguration
} = {
  onDemand: {
    name: 'ondemand',
    text: 'On-Demand'
  },
  spot: {
    name: 'spot',
    text: 'Spot'
  }
}

export const libraryInstallConfig = {
  pypi: {
    value: 'pypi',
    text: 'PyPI'
  },
  workspace: {
    value: 'workspace',
    text: 'Workspace'
  },
  s3: {
    value: 's3',
    text: 'S3'
  },
  maven: {
    value: 'maven',
    text: 'Maven'
  }
}

export const mavenRepositoryConfig = {
  JAR: {
    value: RepositoryType.CENTRAL,
    text: 'Maven Central'
  }
  // python_package: {
  //   value: RepositoryType.SPARK,
  //   text: 'Spark Packages'
  // }
}

export const nodeTypeList = [
  {
    id: 0,
    label: 'General Purpose',
    value: 'general'
  },
  {
    id: 1,
    label: 'Compute Intensive',
    value: 'compute'
  },
  {
    id: 2,
    label: 'Memory Intensive',
    value: 'memory'
  },
  {
    id: 3,
    label: 'Disk Intensive',
    value: 'disk'
  },
  {
    id: 4,
    label: 'GPU Accelerator',
    value: 'gpu'
  }
]
