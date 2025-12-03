import CloseIcon from '@mui/icons-material/Close'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useState} from 'react'
import {Input} from '../../../bit-components/input/index'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  id: string
  label: string
  value: string
  shouldDisableCloseIcon: boolean
  onClose: (idx: number) => void
  onChange: (
    idx: number,
    id: string,
    updatedLabel: string,
    updatedValue: string
  ) => void
  idx: number
  error?: string
}

const RunNowWorkflowParameterRow = (props: IProps) => {
  const {
    classes,
    id,
    label,
    value,
    shouldDisableCloseIcon,
    onClose,
    onChange,
    idx,
    error
  } = props

  const [localLabel, setLocalLabel] = useState(label)
  const [localValue, setLocalValue] = useState(value)

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedLabel = event.target.value
    setLocalLabel(updatedLabel)
    onChange(idx, id, updatedLabel, localValue)
  }

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedValue = event.target.value
    setLocalValue(updatedValue)
    onChange(idx, id, localLabel, updatedValue)
  }

  return (
    <div className={classes.parametersContainer} key={id}>
      <Input
        name={localLabel}
        label='Key'
        onChange={handleLabelChange}
        value={localLabel}
        error={!!error}
        assistiveText={error}
      />
      <Input
        name={localValue}
        label='Value'
        onChange={handleValueChange}
        value={localValue}
      />
      <CloseIcon
        className={`${classes.closeIcon} ${
          shouldDisableCloseIcon ? classes.disabled : ''
        }`}
        onClick={() => (!shouldDisableCloseIcon ? onClose(idx) : {})}
      />
    </div>
  )
}

export default withStyles(styles)(RunNowWorkflowParameterRow)
