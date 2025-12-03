import {Close} from '@mui/icons-material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {
  Button,
  ButtonProps,
  ButtonSizes,
  ButtonVariants
} from '../../../bit-components/button/index'
import styles from './indexJSS'

interface RunIdBarProps extends WithStyles<typeof styles> {
  runId: string
  buttonText: string
  text: String
  onButtonClick: (runId: string) => void
}

const WorkflowRepairBar: React.FC<RunIdBarProps> = ({
  runId,
  buttonText,
  text,
  onButtonClick,
  classes
}) => {
  const [showBar, setShowBar] = React.useState(true)

  const onClose = () => {
    setShowBar(false)
  }

  return showBar ? (
    <div className={classes.container}>
      <div className={classes.textContainer}>
        <div className={classes.info}>
          <InfoOutlinedIcon className={classes.infoIcon} />
          <span>
            <span className={classes.repairText}>{`${text} #${runId}`}</span>
          </span>
        </div>
        <div className={classes.repairButton}>
          <Button
            buttonText={buttonText}
            size={ButtonSizes.MEDIUM}
            variant={ButtonVariants.SECONDARY}
            onClick={() => onButtonClick(runId)}
          />
          <Close className={classes.closeButton} onClick={onClose} />
        </div>
      </div>
    </div>
  ) : (
    <></>
  )
}

export default withStyles(styles)(WorkflowRepairBar)
