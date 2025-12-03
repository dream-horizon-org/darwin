import React from 'react'

import * as TriggerCi from '../../graphQL/mutations/triggerCiForDeployment/index'
import {GQL as triggerCiGql} from '../../graphQL/mutations/triggerCiForDeployment/indexGql.js'

import * as PublishDeployment from '../../graphQL/mutations/publishDeployment/index'
import {GQL as publishDeploymentGql} from '../../graphQL/mutations/publishDeployment/indexGql.js'

import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'

import Button from '@mui/material/Button'

export enum USER_ACTIONS_Enum {
  PUBLISH = 'Publish Model',
  UPDATE = 'Update Deployment Details',
  RUNCI = 'Trigger CI'
}

type UserActionsProps = {
  state: USER_ACTIONS_Enum
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

export const UserAction = (props: UserActionsProps) => {
  const [error, setError] = React.useState(false)
  const action =
    props.state.trim() === 'Publish Model'
      ? publishDeployment
      : triggerCiForDeployment

  const handler = async () => {
    const {errors} = await action(props.deployment, props.appVersion)
    if (errors && errors.length) {
      setError(true)
      return
    }

    props?.refresh()
  }

  if (error) {
    return (
      <div style={{fontSize: 12, fontWeight: 400, fontFamily: 'Roboto'}}>
        Action Failed
      </div>
    )
  }

  return (
    <div>
      <Button variant='outlined' onClick={handler} sx={{height: 24}}>
        {props.state}
      </Button>
    </div>
  )
}
