import {WithStyles, withStyles} from '@mui/styles'
import React, {useState} from 'react'
import {
  Control,
  Controller,
  UseFormSetValue,
  UseFormTrigger
} from 'react-hook-form'
import {compose} from 'redux'
import {Icons} from '../../../bit-components/icon/index'
import {Input} from '../../../bit-components/input/index'
import {IComputeLibraryFormData} from '../../../types/compute/common.type'
import CodespacePathSelectionModal from '../../workflows/codespacePathSelectionModal'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  control: Control<IComputeLibraryFormData, any>
  setValue: UseFormSetValue<IComputeLibraryFormData>
  trigger: UseFormTrigger<IComputeLibraryFormData>
}

const WorkspacePath = (props: IProps) => {
  const {classes, control, setValue, trigger} = props

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const openPathModal = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.blur()
    setIsDialogOpen(true)
  }
  return (
    <div className={classes.inputFields}>
      <span className={classes.workspaceHeading}>
        Choose a workspace File Path
      </span>
      <span className={classes.inputPathInfo}>
        Supported: Files with extensions .whl/.zip/.jar/.tar/requirements.txt
      </span>
      <div className={classes.formFieldContainer}>
        <div className={classes.inputWithInfoMessage}>
          <Controller
            key={'workspacePath'}
            name={'workspacePath'}
            control={control}
            render={({field, fieldState: {error}}) => (
              <Input
                {...field}
                label='Path'
                onFocus={(e) => openPathModal(e)}
                onChange={(ev) => {
                  field.onChange(ev.target.value)
                }}
                icon={Icons.ICON_NAVIGATE_NEXT}
                value={field.value}
                error={Boolean(error)}
                assistiveText={error?.message}
              />
            )}
          />
        </div>
      </div>
      {isDialogOpen && (
        <CodespacePathSelectionModal
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          setSelectedNotebookPath={(val: string) => {
            setValue('workspacePath', val)
            trigger('workspacePath')
          }}
        />
      )}
    </div>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  WorkspacePath
)

export default StyleComponent
