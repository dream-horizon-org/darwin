import {Snackbar} from '@material-ui/core'
import {Alert} from '@mui/material'
import React, {useEffect, useState} from 'react'
import {Dialog} from '../../bit-components/dialog/index'
import {
  DeleteCluster,
  DeleteClusterInput
} from '../../modules/compute/pages/sharedGraphql/deleteClusterGraphql/deleteCluster'
import {DeleteClusterSchema} from '../../modules/compute/pages/sharedGraphql/deleteClusterGraphql/deleteCluster.gqlTypes'
import {GQL as deleteClusterGql} from '../../modules/compute/pages/sharedGraphql/deleteClusterGraphql/deleteClusterGql'
import {
  ReStartCluster,
  ReStartClusterInput
} from '../../modules/compute/pages/sharedGraphql/restartClusterGraphql/reStartCluster'
import {ReStartClusterSchema} from '../../modules/compute/pages/sharedGraphql/restartClusterGraphql/reStartCluster.gqlTypes'
import {GQL as reStartClusterGql} from '../../modules/compute/pages/sharedGraphql/restartClusterGraphql/reStartClusterGql'
import {
  StartCluster,
  StartClusterInput
} from '../../modules/compute/pages/sharedGraphql/startClusterGraphql/startCluster'
import {StartClusterSchema} from '../../modules/compute/pages/sharedGraphql/startClusterGraphql/startCluster.gqlTypes'
import {GQL as startClusterGql} from '../../modules/compute/pages/sharedGraphql/startClusterGraphql/startClusterGql'
import {
  StopCluster,
  StopClusterInput
} from '../../modules/compute/pages/sharedGraphql/stopClusterGraphql/stopCluster'
import {StopClusterSchema} from '../../modules/compute/pages/sharedGraphql/stopClusterGraphql/stopCluster.gqlTypes'
import {GQL as stopClusterGql} from '../../modules/compute/pages/sharedGraphql/stopClusterGraphql/stopClusterGql'

import {useGQL} from '../../utils/useGqlRequest'

export interface IClusterActions {
  onStopClusterClicked: (id: string) => void
  stopClusterResponse: StopCluster
  onStartClusterClicked: (id: string) => void
  startClusterResponse: StartCluster
  onDeleteClusterClicked: (id: string) => void
  deleteClusterResponse: DeleteCluster
  onRestartClusterClicked: (id: string) => void
  restartClusterResponse: ReStartCluster
  setClusterStatus: (status: string) => void
}

interface IProps {
  children: JSX.Element
}

const ClusterActions = (Component: any) => {
  return (props: any) => {
    // const {children} = props;
    const [snackbarMessage, setSnackbarMessage] = useState({
      open: false,
      message: null,
      type: null
    })
    const [dialogState, setDialogState] = useState({
      open: false,
      title: '',
      description: '',
      primaryBtnText: '',
      primaryFunc: () => {},
      secondaryBtnText: '',
      secondaryFunc: () => {}
    })

    const {
      output: {response: stopClusterResponse, loading: stopClusterLoading},
      triggerGQLCall: triggerStopClusterGQLCall
    } = useGQL<StopClusterInput, StopCluster>()

    const {
      output: {response: deleteClusterResponse, loading: deleteClusterLoading},
      triggerGQLCall: triggerDeleteClusterGQLCall
    } = useGQL<DeleteClusterInput, DeleteCluster>()

    const {
      output: {response: startClusterResponse, loading: startClusterLoading},
      triggerGQLCall: triggerStartClusterGQLCall
    } = useGQL<StartClusterInput, StartCluster>()

    const {
      output: {
        response: reStartClusterResponse,
        loading: reStartClusterLoading
      },
      triggerGQLCall: triggerReStartClusterGQLCall
    } = useGQL<ReStartClusterInput, ReStartCluster>()

    useEffect(() => {
      if (
        deleteClusterResponse &&
        deleteClusterResponse?.deleteCluster?.status === 'SUCCESS'
      ) {
        setSnackbarMessage({
          open: true,
          message: 'Cluster deleted successfully!',
          type: 'SUCCESS'
        })
      } else if (
        deleteClusterResponse &&
        deleteClusterResponse?.deleteCluster?.status === 'ERROR'
      ) {
        setSnackbarMessage({
          open: true,
          message: 'Error while deleting cluster, Please try again!',
          type: 'ERROR'
        })
      }
    }, [deleteClusterResponse])

    useEffect(() => {
      if (
        startClusterResponse &&
        startClusterResponse.startCluster.status === 'SUCCESS'
      ) {
        setSnackbarMessage({
          open: true,
          message: 'Cluster started successfully!',
          type: 'SUCCESS'
        })
      } else if (
        startClusterResponse &&
        startClusterResponse.startCluster.status === 'ERROR'
      ) {
        setSnackbarMessage({
          open: true,
          message: 'Error while starting cluster, Please try again!',
          type: 'ERROR'
        })
      }
    }, [startClusterResponse])

    useEffect(() => {
      if (
        stopClusterResponse &&
        stopClusterResponse?.stopCluster?.status === 'SUCCESS'
      ) {
        setSnackbarMessage({
          open: true,
          message: 'Cluster stopped successfully!',
          type: 'SUCCESS'
        })
      } else if (
        stopClusterResponse &&
        stopClusterResponse?.stopCluster?.status === 'ERROR'
      ) {
        setSnackbarMessage({
          open: true,
          message: 'Error while stopping cluster, Please try again!',
          type: 'ERROR'
        })
      }
    }, [stopClusterResponse])

    useEffect(() => {
      if (
        reStartClusterResponse &&
        reStartClusterResponse.reStartCluster.status === 'SUCCESS'
      ) {
        setSnackbarMessage({
          open: true,
          message: 'Cluster restarted successfully!',
          type: 'SUCCESS'
        })
      } else if (
        reStartClusterResponse &&
        reStartClusterResponse.reStartCluster.status === 'ERROR'
      ) {
        setSnackbarMessage({
          open: true,
          message: 'Error while restarting cluster, Please try again!',
          type: 'ERROR'
        })
      }
    }, [reStartClusterResponse])

    const onStopClusterClicked = (clusterId: string) => {
      const variables = {
        input: {
          cluster_id: clusterId
        }
      }
      triggerStopClusterGQLCall(
        {
          ...stopClusterGql,
          variables
        },
        StopClusterSchema
      )

      setSnackbarMessage({
        open: true,
        message: 'Stopping cluster... Please wait!',
        type: 'SUCCESS'
      })
    }

    const onDeleteClusterClicked = (clusterId: string) => {
      const variables = {
        input: {
          cluster_id: clusterId
        }
      }
      triggerDeleteClusterGQLCall(
        {
          ...deleteClusterGql,
          variables
        },
        DeleteClusterSchema
      )

      setSnackbarMessage({
        open: true,
        message: 'Deleting cluster... Please wait!',
        type: 'SUCCESS'
      })
    }

    const onStartClusterClicked = (clusterId: string) => {
      const variables = {
        input: {
          cluster_id: clusterId
        }
      }
      triggerStartClusterGQLCall(
        {
          ...startClusterGql,
          variables
        },
        StartClusterSchema
      )

      setSnackbarMessage({
        open: true,
        message: 'Starting cluster... Please wait!',
        type: 'SUCCESS'
      })
    }

    const onReStartClusterClicked = (clusterId: string) => {
      const variables = {
        input: {
          cluster_id: clusterId
        }
      }
      triggerReStartClusterGQLCall(
        {
          ...reStartClusterGql,
          variables
        },
        ReStartClusterSchema
      )

      setSnackbarMessage({
        open: true,
        message: 'Restarting cluster... Please wait!',
        type: 'SUCCESS'
      })
    }

    const handleSnackbarClose = () => {
      setSnackbarMessage({
        open: false,
        message: null,
        type: null
      })
    }
    const closeConfirmBox = () => {
      setDialogState({
        open: false,
        title: '',
        description: '',
        primaryBtnText: '',
        primaryFunc: () => {},
        secondaryBtnText: '',
        secondaryFunc: () => closeConfirmBox()
      })
    }

    const setClusterActionState = (clusterId, optionSelected) => {
      if (optionSelected === 'stop') {
        setDialogState({
          open: true,
          title: 'Stop Cluster',
          description:
            'Terminating the cluster will result in losing the cluster state. Are you sure you want to terminate ?',
          primaryBtnText: 'STOP',
          primaryFunc: () => {
            onStopClusterClicked(clusterId)
            closeConfirmBox()
          },
          secondaryBtnText: 'CANCEL',
          secondaryFunc: () => closeConfirmBox()
        })
      } else if (optionSelected === 'delete') {
        setDialogState({
          open: true,
          title: 'Delete Cluster',
          description:
            'Deleting the cluster will result in permanently loosing the cluster state. Are you sure you want to delete ?',
          primaryBtnText: 'DELETE',
          primaryFunc: () => {
            onDeleteClusterClicked(clusterId)
            closeConfirmBox()
          },
          secondaryBtnText: 'CANCEL',
          secondaryFunc: () => closeConfirmBox()
        })
      } else if (optionSelected === 'start') {
        onStartClusterClicked(clusterId)
      } else if (optionSelected === 'restart') {
        setDialogState({
          open: true,
          title: 'Restart Cluster',
          description:
            'Restarting the cluster will result in losing the cluster state. Are you sure you want to restart ?',
          primaryBtnText: 'RESTART',
          primaryFunc: () => {
            onReStartClusterClicked(clusterId)
            closeConfirmBox()
          },
          secondaryBtnText: 'CANCEL',
          secondaryFunc: () => closeConfirmBox()
        })
      }
    }

    return (
      <>
        <Dialog
          handleClose={closeConfirmBox}
          testIdentifier='dialogBox'
          title={dialogState.title || 'Dialog'}
          open={dialogState.open}
          dialogContent={<div>{dialogState.description}</div>}
          dialogFooter={{
            primaryButton: {
              text: dialogState.primaryBtnText || 'Button',
              onClick: dialogState.primaryFunc,
              testIdentifier: 'primaryButton'
            },
            secondaryButton: {
              text: dialogState.secondaryBtnText || 'Button',
              onClick: dialogState.secondaryFunc,
              testIdentifier: 'secondaryButton'
            }
          }}
        />
        <Snackbar
          open={snackbarMessage.open}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarMessage.type?.toLowerCase()}
            sx={{width: '100%'}}
          >
            {snackbarMessage.message}
          </Alert>
        </Snackbar>
        <Component
          onStopClusterClicked={(clusterId) =>
            setClusterActionState(clusterId, 'stop')
          }
          stopClusterResponse={
            stopClusterLoading ? null : stopClusterResponse || null
          }
          onStartClusterClicked={(clusterId) =>
            setClusterActionState(clusterId, 'start')
          }
          startClusterResponse={
            startClusterLoading ? null : startClusterResponse || null
          }
          onDeleteClusterClicked={(clusterId) =>
            setClusterActionState(clusterId, 'delete')
          }
          deleteClusterResponse={
            deleteClusterLoading ? null : deleteClusterResponse || null
          }
          onRestartClusterClicked={(clusterId) =>
            setClusterActionState(clusterId, 'restart')
          }
          restartClusterResponse={
            reStartClusterLoading ? null : reStartClusterResponse || null
          }
          {...props}
        />
      </>
    )
  }
}

export default ClusterActions
