import {createUseStyles} from 'react-jss'

export const useSideDrawerStyles = createUseStyles({
  container: {
    height: '100vh',
    width: '242px',
    overflowY: 'hidden',
    top: 0,
    left: 0,
    transition: 'all 0.3s ease-in-out',
    zIndex: '',
    position: 'fixed',
    boxShadow: '5px 0px 18px rgb(0, 0, 0, 0)'
  },
  isClosed: {
    width: '48px',
    boxShadow: 'none'
  },
  hoverShadow: {
    boxShadow:
      '5px 0px 5px  rgb(0, 0, 0, 0.2), 3px 0px 5px  rgb(0, 0, 0, 0.12), 8px 0px 10px  rgb(0, 0, 0, 0.14) '
  }
})
