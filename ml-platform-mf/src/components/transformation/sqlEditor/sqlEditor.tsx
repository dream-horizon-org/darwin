import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React from 'react'
import {ISetScrollOptions} from 'react-codemirror2'
import {UseFormRegister} from 'react-hook-form'
import {compose} from 'redux'
import {featureCreationForm} from '../../../types/featureCreationType.type'
import {SqlEditor} from '../../sqlEditor/sqlEditor'

import styles from './sqlEditorJSS'

interface IProps extends WithStyles<typeof styles> {
  sqlQuery: string
  readOnly?: boolean
  onChangeSQLQuery?: (value: string) => void
  sqlQueryError?: string
  className?: string
  scroll?: ISetScrollOptions
  register?: UseFormRegister<featureCreationForm>
  errors?: {
    [x: string]: any
  }
  mode: string
}

const SQLEditor = (props: IProps) => {
  const {classes, sqlQuery, readOnly, onChangeSQLQuery, sqlQueryError, mode} =
    props
  return (
    <>
      <SqlEditor
        readOnly={readOnly}
        text={sqlQuery}
        onBeforeChange={(editor, data, value) => onChangeSQLQuery(value)}
        {...props}
        mode={mode}
      />
      <span className={classes.error}>{sqlQueryError}</span>
    </>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(SQLEditor)

export default styleComponent
