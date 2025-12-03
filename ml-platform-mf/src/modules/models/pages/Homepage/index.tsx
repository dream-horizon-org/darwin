import React, {useEffect, useRef, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'

import {WithStyles, withStyles} from '@mui/styles'
import config from 'config'
import {setShowGlobalSpinner} from '../../../../actions/commonActions'
import {EventTypes, SeverityTypes} from '../../../../types/events.types'
import {logEvent} from '../../../../utils/events'
import {useGQL} from '../../../../utils/useGqlRequest'
import {CreateExperimentationUser} from '../../graphqlAPIs/createExperimentationUser'
import {CreateExperimentationUserSchema} from '../../graphqlAPIs/createExperimentationUser/index.gqlTypes'
import {GQL as createExperimentationUserGql} from '../../graphqlAPIs/createExperimentationUser/indexGql'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  userDetails: any
  setShowGlobalSpinner: (payload: boolean) => void
}

const HomePage = (props: IProps) => {
  const {userDetails, classes, setShowGlobalSpinner} = props
  const iRef = useRef<HTMLIFrameElement | null>(null)
  const [userCreated, setUserCreated] = useState(true)

  // const {
  //   output: {
  //     response: createExperimentationUserResponse,
  //     loading: createExperimentationUserLoading
  //   },
  //   triggerGQLCall: triggerCreateExperimentationUser
  // } = useGQL<null, CreateExperimentationUser>()

  // useEffect(() => {
  //   setShowGlobalSpinner(true)
  //   triggerCreateExperimentationUser(
  //     {
  //       ...createExperimentationUserGql
  //     },
  //     CreateExperimentationUserSchema
  //   )

  //   logEvent(EventTypes.MODEL_REGISTRY.PAGE_OPEN, SeverityTypes.INFO)
  // }, [])

  // useEffect(() => {
  //   if (
  //     createExperimentationUserResponse?.createExperimentationUser?.status ===
  //     'SUCCESS'
  //   ) {
  //     setUserCreated(true)
  //     setShowGlobalSpinner(false)
  //   }
  // }, [createExperimentationUserResponse])

  // const handleLoad = () => {
  //   setTimeout(() => {
  //     iRef.current.contentWindow.postMessage(
  //       {
  //         type: 'userInfo',
  //         message: userDetails
  //       },
  //       '*'
  //     )
  //   }, 1000)
  // }

  return (
    <div className={classes.container}>
      {userCreated ? (
        <iframe
          ref={iRef}
          src={config.modelsUI}
          style={{
            width: '100%',
            position: 'static'
          }}
          // onLoad={handleLoad}
        />
      ) : (
        <div></div>
      )}
    </div>
  )
}

const mapStateToProps = (state: {msdUserInfoDetails: any}) => ({
  userDetails: state.msdUserInfoDetails
})

const mapDispatchToProps = (dispatch) => {
  return {
    setShowGlobalSpinner: (payload: boolean) =>
      dispatch(setShowGlobalSpinner(payload))
  }
}

const styleComponent = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(HomePage)

export default styleComponent
