import {useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useHistory, useLocation} from 'react-router-dom'
import {setDialogConfig} from '../../../actions/commonActions'

export enum NavigationMode {
  BACK = 'back',
  PUSH = 'push'
}

/**
 *
 * @param title usePreventNavigation
 * @param message This is a custom hook that prevents a route change (Reload, Change URL, etc...)
 * @returns bypassGuard(route: <Custom Route or "back">)
 */
export const usePreventNavigation = (
  title: string,
  message: string,
  dialogDataTestId: string = 'route-prevention-dialog',
  mode: NavigationMode = NavigationMode.PUSH
) => {
  const [blocked, setBlocked] = useState<boolean>(true)
  const [nextLocation, setNextLocation] = useState<string | null>(null)
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)
  const history = useHistory()
  const dispatch = useDispatch()

  const bypassGuard = (route: string) => {
    setBlocked(false)
    if (route === 'back') {
      history.goBack()
    } else {
      setNextLocation(route)
    }
  }

  const handleClose = () => {
    setModalIsOpen(false)
    setNextLocation(null)
  }

  const handleConfirm = () => {
    setBlocked(false)
    setModalIsOpen(false)
  }

  const handler = (e: BeforeUnloadEvent) => {
    e.preventDefault()
    e.returnValue = ''
  }

  useEffect(() => {
    if (blocked) {
      const unblock = history.block((location) => {
        setNextLocation(location.pathname)
        setModalIsOpen(true)
        return false
      })

      window.addEventListener('beforeunload', handler)

      return () => {
        unblock()
        window.removeEventListener('beforeunload', handler)
      }
    } else if (mode === NavigationMode.BACK) {
      history.goBack()
    } else {
      // nextLocation && history.push(nextLocation)
      history.goBack()
    }
  }, [blocked, nextLocation, history])

  useEffect(() => {
    dispatch(
      setDialogConfig({
        title,
        message,
        open: modalIsOpen,
        onClose: handleClose,
        secondaryBtnText: 'Cancel',
        primaryBtnText: 'Yes',
        onPrimaryBtnClicked: handleConfirm,
        onSecondaryBtnClicked: handleClose,
        dataTestId: dialogDataTestId
      })
    )
  }, [modalIsOpen])

  return {bypassGuard}
}
