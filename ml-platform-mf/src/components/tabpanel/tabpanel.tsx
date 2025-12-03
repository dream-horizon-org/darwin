import {Box, Typography} from '@mui/material'
import React from 'react'

interface Props {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = (props: Props) => {
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
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

export default TabPanel
