import {createUseStyles} from 'react-jss'

const buttonJss = createUseStyles({
  materialButton: {
    position: 'relative',
    display: 'inline-block',
    boxSizing: 'border-box',
    border: 'none',
    borderRadius: '4px',
    padding: '0 16px',
    minWidth: '64px',
    height: '40px',
    width: '100%',
    verticalAlign: 'middle',
    textAlign: 'center',
    textOverflow: 'ellipsis',
    textTransform: 'uppercase',
    color: 'rgb(var(--pure-material-onprimary-rgb, 255, 255, 255))',
    backgroundColor: '#109e38',
    boxShadow:
      '0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '36px',
    overflow: 'hidden',
    outline: 'none',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: '0',
      bottom: '0',
      left: '0',
      right: '0',
      backgroundColor: 'rgb(var(--pure-material-onprimary-rgb, 255, 255, 255))',
      opacity: '0',
      transition: 'opacity 0.2s'
    },
    '&:after': {
      content: '""',
      position: 'absolute',
      left: '50%',
      top: '50%',
      borderRadius: '50%',
      padding: '50%',
      width: '32px',
      height: '32px',
      backgroundColor: 'rgb(var(--pure-material-onprimary-rgb, 255, 255, 255))',
      opacity: '0',
      transform: 'translate(-50%, -50%) scale(1)',
      transition: 'opacity 1s, transform 0.5s'
    },
    '&:hover': {
      boxShadow:
        '0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12)',
      '&:before': {
        opacity: '0.08'
      },
      '&:focus': {
        '&:before': {
          opacity: '0.3'
        }
      }
    },
    '&:focus': {
      boxShadow:
        '0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12)',
      '&:before': {
        opacity: '0.08'
      }
    },
    '&:active': {
      boxShadow:
        '0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12)',
      '&:after': {
        opacity: '0.32',
        transform: 'translate(-50%, -50%) scale(0)',
        transition: 'transform 0s'
      }
    },
    '&:disabled': {
      cursor: 'initial',
      '&:before': {
        opacity: '0'
      },
      '&:after': {
        opacity: '0'
      }
    }
  }
})

export default buttonJss
