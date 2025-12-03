import React from 'react'
import {createUseStyles} from 'react-jss'

const styles = createUseStyles({
  '@keyframes spin': {
    from: {
      webkitTransform: 'rotate(0deg)',
      transform: 'rotate(0deg)'
    },
    to: {
      webkitTransform: 'rotate(360deg)',
      transform: 'rotate(360deg)'
    }
  },
  loaderContainer: {
    flex: '0 0 25%',
    boxSizing: 'border-box',
    margin: '0',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  loader: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: '2px solid #121212',
    borderTopColor: '#0080ff',
    webkitAnimation: '1s $spin linear infinite',
    animation: '1s $spin linear infinite'
  }
})

interface ICircleLoader {
  isLarge?: boolean
}

const CircleLoader = (props: ICircleLoader) => {
  const classes = styles()
  const {isLarge} = props
  return (
    <div className={classes.loaderContainer}>
      <div
        className={classes.loader}
        style={{
          width: isLarge ? '48px' : '24px',
          height: isLarge ? '48px' : '24px',
          borderWidth: isLarge ? '4px' : '2px'
        }}
      />
    </div>
  )
}

export default CircleLoader
