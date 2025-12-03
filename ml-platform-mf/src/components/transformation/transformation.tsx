import {
  AppBar,
  FormControlLabel,
  Link,
  Radio,
  RadioGroup,
  Tab,
  Tabs
} from '@mui/material'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React, {useState} from 'react'

import LaunchIcon from '@mui/icons-material/Launch'
import {UseFormRegister} from 'react-hook-form'
import {compose} from 'redux'
import {featureCreationForm} from '../../types/featureCreationType.type'
import CustomCode from './customCode/customCode'
import SQLEditor from './sqlEditor/sqlEditor'
import TabPanel from './tabPanel/tabPanel'
import styles from './transformationJSS'

interface IProps extends WithStyles<typeof styles> {
  showSQLEditor: boolean
  onChangeShowSQLEditor: (value: string) => void
  sqlQuery: string
  sqlQueryError: string
  onChangeSQLQuery: (value: string) => void
  register: UseFormRegister<featureCreationForm>
  errors: {
    [x: string]: any
  }
}

const Transformation = (props: IProps) => {
  const {classes} = props

  const a11yProps = (index: any) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.heading}>
        <h3>Transformation</h3>
        <Link
          href='http://datahub.d11tech.in/'
          target='_blank'
          className={classes.datahubLink}
        >
          DATA HUB
          <LaunchIcon className={classes.launchIcon} />
        </Link>
      </div>
      <div>
        <RadioGroup
          row
          aria-label='position'
          name='position'
          value={props.showSQLEditor ? 'sql' : 'custom-code'}
          onChange={(e) => props.onChangeShowSQLEditor(e.target.value)}
        >
          <FormControlLabel
            value='sql'
            control={<Radio color='primary' />}
            label='SQL'
          />
          <FormControlLabel
            value='custom-code'
            control={<Radio color='primary' />}
            label='Custom Code'
            className={classes.customCode}
          />
        </RadioGroup>
      </div>
      {props.showSQLEditor ? (
        <SQLEditor
          register={props.register}
          errors={props.errors}
          sqlQuery={props.sqlQuery}
          sqlQueryError={props.sqlQueryError}
          onChangeSQLQuery={props.onChangeSQLQuery}
          mode='sql'
        />
      ) : (
        <CustomCode register={props.register} errors={props.errors} />
      )}
    </div>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(
  Transformation
)

export default styleComponent
