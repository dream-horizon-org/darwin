import React from 'react'

import {WithStyles, withStyles} from '@mui/styles'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Dialog} from '../../bit-components/dialog/index'
import {CommonState, ICommonState} from '../../reducers/commonReducer'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  dialogConfig: ICommonState['dialogConfig']
}

const DialogContainer = (props: IProps) => {
  const {dialogConfig} = props

  return (
    <div data-testid={dialogConfig.dataTestId}>
      <Dialog
        handleClose={dialogConfig.onClose}
        title={dialogConfig.title}
        open={dialogConfig.open}
        dialogContent={<div>{dialogConfig.message}</div>}
        dialogFooter={{
          primaryButton: {
            text: dialogConfig.primaryBtnText,
            onClick: dialogConfig.onPrimaryBtnClicked
          },
          secondaryButton: {
            text: dialogConfig.secondaryBtnText,
            onClick: dialogConfig.onSecondaryBtnClicked
          }
        }}
      />
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  dialogConfig: state.commonReducer.dialogConfig
})

const mapDispatchToProps = (dispatch) => {
  return {}
}

const styleComponent = compose(
  withStyles(styles, {withTheme: true}),
  connect(mapStateToProps, mapDispatchToProps)
)(DialogContainer)

export default styleComponent
