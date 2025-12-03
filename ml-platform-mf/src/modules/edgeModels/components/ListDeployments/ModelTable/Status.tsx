import React from 'react'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../../../bit-components/icon-button/index'
import {Icons} from '../../../../../bit-components/icon/index'

import * as TriggerCi from '../../../graphQL/mutations/triggerCiForDeployment/index'
import {GQL as triggerCiGql} from '../../../graphQL/mutations/triggerCiForDeployment/indexGql.js'

import * as PublishDeployment from '../../../graphQL/mutations/publishDeployment/index'
import {GQL as publishDeploymentGql} from '../../../graphQL/mutations/publishDeployment/indexGql.js'

import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'

export enum CiEnum {
  'TRIGGER' = 'Trigger CI',
  'PUBLISH' = 'Publish'
}

type CiStatusProps = {
  state: CiEnum
  refresh: () => void
  appVersion: string
  deployment: string
}

const triggerCiForDeployment = (deploymentId: string, appVersion: string) => {
  return gqlRequestTyped<
    TriggerCi.TriggerCiForDeploymentInput,
    TriggerCi.TriggerCiForDeployment
  >({
    ...triggerCiGql,
    variables: {
      modelDeploymentId: deploymentId,
      appVersion: [appVersion]
    }
  })
}

const publishDeployment = (deploymentId: string, appVersion: string) => {
  return gqlRequestTyped<
    PublishDeployment.PublishDeploymentInput,
    PublishDeployment.PublishDeployment
  >({
    ...publishDeploymentGql,
    variables: {
      modelDeploymentId: deploymentId,
      appVersion: [appVersion]
    }
  })
}

export const CiStatus = (props: CiStatusProps) => {
  const [error, setError] = React.useState(false)
  const action =
    props.state.trim() === 'Publish'
      ? publishDeployment
      : triggerCiForDeployment

  const handler = async () => {
    const {errors} = await action(props.deployment, props.appVersion)
    if (errors && errors.length) {
      setError(true)
      return
    }

    props.refresh()
  }

  if (error) {
    return <div>Action Failed</div>
  }

  return (
    <div>
      <span>{props.state}</span>
      <IconButton
        leadingIcon={Icons.ICON_PLAY_ARROW}
        actionable={true}
        size={IconButtonSizes.SMALL}
        actionableVariants={ActionableIconButtonVariants.ACTIONABLE_PRIMARY}
        onClick={handler}
      />
    </div>
  )
}
