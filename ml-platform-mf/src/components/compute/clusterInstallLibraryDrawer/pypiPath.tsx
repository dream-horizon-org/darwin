import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'
import {Control, Controller} from 'react-hook-form'
import {compose} from 'redux'
import config from 'config'
import {Input} from '../../../bit-components/input/index'
import {IComputeLibraryFormData} from '../../../types/compute/common.type'
import InfoBarMessage from '../../InfoBarMessage'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  control: Control<IComputeLibraryFormData, any>
  pypiInfoVisible: boolean
  closePypiInfoBar: () => void
}

const PypiPath = (props: IProps) => {
  const {classes, control, pypiInfoVisible, closePypiInfoBar} = props
  const learnMoreClickHandler = () => {
    window.open(config.uiConfig.pypiPackageDocsUrl, '_blank')
  }
  const getPypiAssistiveText = (value: string) => {
    if (!value) {
      return ''
    }

    if (value.includes('==')) {
      return ''
    }
    return 'We suggest you to specify the package version as well with =='
  }

  return (
    <div>
      {pypiInfoVisible && (
        <InfoBarMessage
          msg='We recommend specifying an exact version of the library with == to prevent regressions'
          showLearnMore={true}
          learnMoreClickHandler={learnMoreClickHandler}
          learnMoreText='Learn more'
          type='info'
          closeInfoBar={closePypiInfoBar}
        />
      )}
      <div
        className={`${classes.inputWithInfoMessage} ${classes.packageField}`}
      >
        <Controller
          name='Package'
          control={control}
          render={({field, fieldState: {error}}) => {
            const assistiveText = field.value
              ? 'We suggest you to specify the package version as well with =='
              : ''
            return (
              <Input
                {...field}
                inputType='text'
                label='Package'
                onChange={(ev) => {
                  field.onChange(ev.target.value)
                }}
                value={field?.value?.toString() || ''}
                error={Boolean(error?.message)}
                assistiveText={
                  error?.message || getPypiAssistiveText(field.value)
                }
              />
            )
          }}
        />
      </div>
      <div className={classes.inputWithInfoMessage}>
        <Controller
          name='indexName'
          control={control}
          render={({field, fieldState: {error}}) => {
            const assistiveText = field.value ? 'Default: Index_name' : ''
            return (
              <Input
                {...field}
                inputType='text'
                label='Index_name (default)'
                onChange={(ev) => {
                  field.onChange(ev.target.value)
                }}
                value={field?.value?.toString() || ''}
                error={Boolean(error?.message)}
                assistiveText={error?.message || assistiveText}
              />
            )
          }}
        />
      </div>
    </div>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  PypiPath
)

export default StyleComponent
