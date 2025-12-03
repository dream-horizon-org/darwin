import {Box, Typography} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {compose} from 'redux'

import styles from './tabPanelJSS'

interface IProps extends WithStyles<typeof styles> {
  children: JSX.Element | JSX.Element[] | string | string[]
  index: number
  value: number
}

const TabPanel = (props: IProps) => {
  const {children, value, index, ...other} = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(TabPanel)

export default styleComponent
