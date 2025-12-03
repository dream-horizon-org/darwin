import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import {Radio} from '../../../bit-components/radio/index'

import React, {useEffect, useState} from 'react'
import {Control, UseFormGetValues, UseFormSetValue} from 'react-hook-form'
import {compose} from 'redux'
import {GetComputeAvailabilityZones} from '../../../modules/compute/pages/sharedGraphql/getComputeAvailabilityZones/getComputeAvailabilityZones'
import {GetComputeDiscTypes} from '../../../modules/compute/pages/sharedGraphql/getComputeDiscTypes/getComputeDiscTypes'
import {GetComputeInstanceRoles} from '../../../modules/compute/pages/sharedGraphql/getComputeInstanceRoles/getComputeInstanceRoles'
import {GetComputeRuntimeList} from '../../../modules/compute/pages/sharedGraphql/getComputeRuntimeList/getComputeRuntimeList'
import {GetComputeRuntimeListSchema} from '../../../modules/compute/pages/sharedGraphql/getComputeRuntimeList/getComputeRuntimeList.gqlTypes'
import {GetComputeTemplates} from '../../../modules/compute/pages/sharedGraphql/getComputeTemplates/getComputeTemplates'
import {
  IComputeFormData,
  IConfiguration
} from '../../../types/compute/common.type'
import {useGQL} from '../../../utils/useGqlRequest'
import ComputeAdvanceConfiguration from '../computeAdvanceConfiguration/computeAdvanceConfiguration'
import ComputeBasicConfiguration from '../computeBasicConfiguration/computeBasicConfiguration'

import {GQL as getComputeAvailabilityZonesGql} from '../../../modules/compute/pages/sharedGraphql/getComputeAvailabilityZones/getComputeAvailabilityZonesGql'
import {GQL as getComputeDiscTypesGql} from '../../../modules/compute/pages/sharedGraphql/getComputeDiscTypes/getComputeDiscTypesGql'
import {GQL as getComputeInstanceRolesGql} from '../../../modules/compute/pages/sharedGraphql/getComputeInstanceRoles/getComputeInstanceRolesGql'
import {GQL as getComputeRuntimeListGql} from '../../../modules/compute/pages/sharedGraphql/getComputeRuntimeList/getComputeRuntimeListGql'
import {GQL as getComputeTemplatesGql} from '../../../modules/compute/pages/sharedGraphql/getComputeTemplates/getComputeTemplatesGql'

import {connect} from 'react-redux'
import {resetComputRuntime} from '../../../modules/compute/pages/graphqlApis/actions'
import {getComputeGpuPods} from '../../../modules/compute/pages/graphqlApis/getComputeGpuPods/index.thunk'
import {getComputeNodeTypes} from '../../../modules/compute/pages/graphqlApis/getComputeNodeTypes/index.thunk'
import {
  IComputeGpuPods,
  IComputeLimits,
  IComputeNodeTypes
} from '../../../modules/compute/pages/graphqlApis/reducer'
import {GetComputeAvailabilityZonesSchema} from '../../../modules/compute/pages/sharedGraphql/getComputeAvailabilityZones/getComputeAvailabilityZones.gqlTypes'
import {GetComputeDiscTypesSchema} from '../../../modules/compute/pages/sharedGraphql/getComputeDiscTypes/getComputeDiscTypes.gqlTypes'
import {GetComputeInstanceRolesSchema} from '../../../modules/compute/pages/sharedGraphql/getComputeInstanceRoles/getComputeInstanceRoles.gqlTypes'
import {GetComputeTemplatesSchema} from '../../../modules/compute/pages/sharedGraphql/getComputeTemplates/getComputeTemplates.gqlTypes'
import {CommonState} from '../../../reducers/commonReducer'
import styles from './computeConfigurationJss'

interface IProps extends WithStyles<typeof styles> {
  control: Control<IComputeFormData, any>
  setValue: UseFormSetValue<IComputeFormData>
  deafultMemoryToCoreRatio?: number
  computeLimits: IComputeLimits
  formErrors: any
  computeGpuPods: IComputeGpuPods
  computeNodeTypes: IComputeNodeTypes
  getValues: UseFormGetValues<IComputeFormData>
  getComputeGpuPodsFunc: () => void
  getComputeNodeTypesFunc: () => void
  resetComputRuntime: () => void
  clusterId?: string
}

const ComputeConfiguration = (props: IProps) => {
  const {
    classes,
    control,
    setValue,
    deafultMemoryToCoreRatio,
    computeLimits,
    formErrors,
    computeGpuPods,
    computeNodeTypes,
    getValues,
    getComputeGpuPodsFunc,
    getComputeNodeTypesFunc,
    resetComputRuntime,
    clusterId
  } = props

  const configuration: {basic: IConfiguration; advance: IConfiguration} = {
    basic: {
      name: 'basic',
      text: 'Basic Configuration'
    },
    advance: {
      name: 'advance',
      text: 'Advanced Configuration (Optional)'
    }
  }

  const [selectedConfig, setSelectedConfig] = useState<string>('basic')

  const {
    output: {response: clusterRuntimeList, loading: clusterRuntimeListLoading},
    triggerGQLCall: getClusterRuntimeList
  } = useGQL<null, GetComputeRuntimeList>()

  const {
    output: {
      response: computeAvailabilityZones,
      loading: computeAvailabilityZonesLoading
    },
    triggerGQLCall: getComputeAvailabilityZones
  } = useGQL<null, GetComputeAvailabilityZones>()

  const {
    output: {response: computeDiscTypes, loading: computeDiscTypesLoading},
    triggerGQLCall: getComputeDiscTypes
  } = useGQL<null, GetComputeDiscTypes>()

  const {
    output: {
      response: computeInstanceRoles,
      loading: computeInstanceRolesLoading
    },
    triggerGQLCall: getComputeInstanceRoles
  } = useGQL<null, GetComputeInstanceRoles>()

  const {
    output: {response: computeTemplates, loading: computeTemplatesLoading},
    triggerGQLCall: getComputeTemplates
  } = useGQL<null, GetComputeTemplates>()

  useEffect(() => {
    getComputeGpuPodsFunc()

    getComputeNodeTypesFunc()

    getClusterRuntimeList(
      {...getComputeRuntimeListGql},
      GetComputeRuntimeListSchema
    )

    getComputeAvailabilityZones(
      {...getComputeAvailabilityZonesGql},
      GetComputeAvailabilityZonesSchema
    )

    getComputeDiscTypes({...getComputeDiscTypesGql}, GetComputeDiscTypesSchema)

    getComputeInstanceRoles(
      {...getComputeInstanceRolesGql},
      GetComputeInstanceRolesSchema
    )

    getComputeTemplates({...getComputeTemplatesGql}, GetComputeTemplatesSchema)

    return () => {
      resetComputRuntime()
    }
  }, [])

  const clusterCpuRuntimeListData = !clusterRuntimeListLoading
    ? clusterRuntimeList?.getComputeRuntimeList?.data.cpu
    : []
  const clusterGpuRuntimeListData = !clusterRuntimeListLoading
    ? clusterRuntimeList?.getComputeRuntimeList?.data.gpu
    : []

  const clusterCustomRuntimeListData = !clusterRuntimeListLoading
    ? clusterRuntimeList?.getComputeRuntimeList?.data.custom
    : []
  const clusterOthersRuntimeListData = !clusterRuntimeListLoading
    ? clusterRuntimeList?.getComputeRuntimeList?.data.others
    : []
  const computeAvailabilityZonesData = !computeAvailabilityZonesLoading
    ? computeAvailabilityZones?.getComputeAvailabilityZones?.data
    : []
  const computeDiscTypesData = !computeDiscTypesLoading
    ? computeDiscTypes?.getComputeDiscTypes?.data
    : []
  const computeInstanceRolesData = !computeInstanceRolesLoading
    ? computeInstanceRoles?.getComputeInstanceRoles?.data
    : []
  const computeTemplatesData = !computeTemplatesLoading
    ? computeTemplates?.getComputeTemplates?.data
    : []

  return (
    <div className={classes.wrapper}>
      <div className={classes.tabsWrapper}>
        {Object.values(configuration).map((config) => (
          <Radio
            key={config.name}
            checked={config.name === selectedConfig}
            value={config.name}
            text={config.text}
            onChange={() => setSelectedConfig(config.name)}
          />
        ))}
      </div>
      <div className={classes.detailsWrapper}>
        {selectedConfig === 'basic' ? (
          <ComputeBasicConfiguration
            control={control}
            setValue={setValue}
            clusterCpuRuntimeListData={clusterCpuRuntimeListData}
            clusterGpuRuntimeListData={clusterGpuRuntimeListData}
            clusterCustomRuntimeListData={clusterCustomRuntimeListData}
            clusterOthersRuntimeListData={clusterOthersRuntimeListData}
            computeDiscTypesData={computeDiscTypesData}
            computeTemplatesData={computeTemplatesData}
            deafultMemoryToCoreRatio={deafultMemoryToCoreRatio}
            computeLimits={computeLimits}
            formErrors={formErrors}
            computeGpuPods={computeGpuPods}
            computeNodeTypes={computeNodeTypes}
            getValues={getValues}
            clusterId={clusterId}
          />
        ) : (
          <ComputeAdvanceConfiguration
            control={control}
            computeAvailabilityZonesData={computeAvailabilityZonesData}
            computeInstanceRolesData={computeInstanceRolesData}
          />
        )}
      </div>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => {
  return {
    computeGpuPods: state.computeReducer.computeGpuPods,
    computeNodeTypes: state.computeReducer.computeNodeTypes
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getComputeGpuPodsFunc: () => getComputeGpuPods(dispatch),
    getComputeNodeTypesFunc: () => getComputeNodeTypes(dispatch),
    resetComputRuntime: () => dispatch(resetComputRuntime())
  }
}

const styleComponent = compose<IProps | any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ComputeConfiguration)

export default styleComponent
