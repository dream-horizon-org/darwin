import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useState} from 'react'
import {Control, Controller} from 'react-hook-form'
import {compose} from 'redux'
import {Button, ButtonVariants} from '../../../bit-components/button/index'
import {Icons} from '../../../bit-components/icon/index'
import {Input} from '../../../bit-components/input/index'
import {IComputeLibraryFormData} from '../../../types/compute/common.type'
import InfoBarMessage from '../../InfoBarMessage'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  control: Control<IComputeLibraryFormData, any>
  searchPackageClicked: () => void
}

const MavenLibraries = (props: IProps) => {
  const {classes, control, searchPackageClicked} = props

  return (
    <div>
      <div className={classes.mavenContainer}>
        <div className={classes.mavenInputField}>
          <div>
            <Button
              buttonText='Search Packages'
              onClick={searchPackageClicked}
              variant={ButtonVariants.SECONDARY}
              leadingIcon={Icons.ICON_SEARCH}
            />
          </div>
          <div className={classes.inputWithInfoMessage}>
            <Controller
              name='coordinates'
              control={control}
              render={({field, fieldState: {error}}) => {
                return (
                  <Input
                    {...field}
                    inputType='text'
                    label='Maven Coordinates (com.microsoft.azure:synapseml_0.9.3)'
                    onChange={(ev) => {
                      field.onChange(ev.target.value)
                    }}
                    value={field?.value?.toString() || ''}
                    error={Boolean(error?.message)}
                    assistiveText={error?.message}
                  />
                )
              }}
            />
          </div>
          <div className={classes.inputWithInfoMessage}>
            <Controller
              name='repository'
              control={control}
              render={({field, fieldState: {error}}) => {
                return (
                  <Input
                    {...field}
                    inputType='text'
                    label='Repository'
                    onChange={(ev) => {
                      field.onChange(ev.target.value)
                    }}
                    value={field?.value?.toString() || ''}
                    error={Boolean(error?.message)}
                    assistiveText={error?.message}
                  />
                )
              }}
            />
          </div>
          <div className={classes.inputWithInfoMessage}>
            <Controller
              name='exclusions'
              control={control}
              render={({field, fieldState: {error}}) => {
                return (
                  <Input
                    {...field}
                    inputType='text'
                    label='Exclusions (log4j:log4j,junit:junit)'
                    onChange={(ev) => {
                      field.onChange(ev.target.value)
                    }}
                    value={field?.value?.toString() || ''}
                    error={Boolean(error?.message)}
                    assistiveText={error?.message}
                  />
                )
              }}
            />
          </div>
          <div className={classes.infoMessageContainer}>
            <InfoOutlinedIcon className={classes.mavenInfoIcon} />
            <span className={classes.infoMessage}>
              Maven library addition is only supported for runtimes after Ray
              2.37
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  MavenLibraries
)

export default StyleComponent
