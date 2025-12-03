import withStyles from '@mui/styles/withStyles'
import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import {compose} from 'redux'

import styles from './loadingSkeletonJSS'

const LoadingSkeleton = () => {
  return <Skeleton duration={0.1} />
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(
  LoadingSkeleton
)

export default styleComponent
