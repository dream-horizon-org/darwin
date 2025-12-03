import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import {Dropdown} from '../../../bit-components/dropdown/index'
import {Input} from '../../../bit-components/input/index'
import {TextArea} from '../../../bit-components/text-area/index'

import React from 'react'
import {Controller, useWatch} from 'react-hook-form'
import {compose} from 'redux'
import {ToolTipPlacement} from '../../../bit-components/tooltip/index'
import {defaultDropdownValue} from '../../../modules/compute/pages/computeDetails/constants'
import Info from '../../Info'
import {predefinedToolTips} from '../../Info/constants'
import styles from './computeAdvanceConfigurationJss'
interface IProps extends WithStyles<typeof styles> {
  control: any
  computeAvailabilityZonesData: Array<any>
  computeInstanceRolesData: Array<any>
}

const ComputeAdvanceConfiguration = (props: IProps) => {
  const {classes, control, computeInstanceRolesData} = props

  const computeInstanceRolesList = (computeInstanceRolesData || []).map(
    (item, idx) => ({
      id: idx,
      label: item.display_name,
      value: item.display_name,
      roleId: item.instance_role_id
    })
  )
  const disabledForm = useWatch({control, name: 'disabledForm'}) || false
  return (
    <div className={classes.wrapper}>
      <div className={classes.heading1}>System Properties</div>
      <div className={classes.inputWrapper}>
        <div className={classes.inputComp}>
          <Controller
            name={`advance.environmentVariables`}
            control={control}
            render={({field, fieldState: {error}}) => (
              <TextArea
                {...field}
                disabled={disabledForm}
                label='Environment Variables'
              />
            )}
          />
        </div>
        <div className={classes.infoWrapper}>
          <Info
            msg={predefinedToolTips.environmentVariables}
            placement={ToolTipPlacement.BottomStart}
          />
        </div>
      </div>
      <div className={classes.inputWrapper}>
        <div className={classes.inputComp}>
          <Controller
            name={`advance.initScripts`}
            control={control}
            render={({field, fieldState: {error}}) => {
              return (
                <TextArea
                  {...field}
                  disabled={disabledForm}
                  value={field.value || ''}
                  label='Init scripts'
                />
              )
            }}
          />
        </div>
        <div className={classes.infoWrapper}>
          <Info
            msg={predefinedToolTips.initScripts}
            placement={ToolTipPlacement.BottomStart}
          />
        </div>
      </div>
      <br></br>
      <div className={classes.heading1}>Ray Parameters</div>
      <div className={classes.rayParamsWrapper}>
        <div className={classes.inputWrapper}>
          <div className={classes.rayParamsInputComp}>
            <Controller
              name={`advance.rayParams.objectStoreMemory`}
              control={control}
              render={({field, fieldState: {error}}) => (
                <Input
                  {...field}
                  disabled={disabledForm}
                  value={field.value?.toString() || ''}
                  inputType='number'
                  label='Object Store Memory %'
                  error={Boolean(error)}
                  assistiveText={Boolean(error) && error.message}
                />
              )}
            />
          </div>
          <div className={classes.infoWrapper}>
            <Info
              msg={predefinedToolTips.objectStoreMemory}
              placement={ToolTipPlacement.BottomStart}
            />
          </div>
        </div>
        <div className={classes.inputWrapper}>
          <div
            className={`${classes.rayParamsInputComp} ${classes.rayParamsInputWrapper}`}
          >
            <Controller
              name={`advance.rayParams.cpusOnHead`}
              control={control}
              render={({field, fieldState: {error}}) => (
                <Input
                  {...field}
                  disabled={disabledForm}
                  value={field.value?.toString() || ''}
                  inputType='number'
                  label="CPU's on Head"
                  error={Boolean(error)}
                  assistiveText={Boolean(error) && error.message}
                />
              )}
            />
          </div>
          <div className={classes.infoWrapper}>
            <Info
              msg={predefinedToolTips.cpuOnHead}
              placement={ToolTipPlacement.BottomStart}
            />
          </div>
        </div>
      </div>
      <br></br>
      <div className={classes.heading1}>Cloud Properties</div>
      <div className={classes.inputWrapper}>
        <div className={classes.inputComp}>
          <Controller
            name={`advance.instanceRole`}
            control={control}
            render={({field, fieldState: {error}}) => (
              <Dropdown
                fieldVariant='withOutline'
                {...field}
                disabled={disabledForm}
                menuLists={computeInstanceRolesList}
                label={'Instance Role'}
                onChange={(ev, val) => field.onChange(val)}
                dropDownValue={field.value || defaultDropdownValue}
                error={Boolean(error)}
                assistiveText={Boolean(error) && error.message}
              />
            )}
          />
        </div>
        <div className={classes.infoWrapper}>
          <Info
            msg={predefinedToolTips.instanceRole}
            placement={ToolTipPlacement.BottomStart}
          />
        </div>
      </div>
    </div>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(
  ComputeAdvanceConfiguration
)

export default styleComponent
