import {
  Autocomplete,
  Box,
  Popper,
  styled,
  TextField,
  Typography
} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useEffect, useState} from 'react'
import {UseFormSetValue} from 'react-hook-form'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Dropdown} from '../../../bit-components/dropdown/index'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {IComputeFormData} from '../../../types/compute/common.type'
import styles, {inputStyles} from './indexJSS'

interface IOption {
  id: number
  label: string
  value: string
  description?: string
}
interface IDropdownList<T> {
  label: string
  id: number
  value: string
  description?: string
}

interface IProps extends WithStyles<typeof styles> {
  onChange: (value: IDropdownList<string>) => void
  dropDownValue: IDropdownList<string>
  error: string
  assistiveText: string
  onBlur: () => void
  setValue: UseFormSetValue<IComputeFormData>
  disabled: boolean
  workflowsMetaData: IWorkflowsDetailsState['workflowsMetaData']
}

const CustomDropDown = (props: IProps) => {
  const {
    classes,
    onChange,
    dropDownValue,
    error,
    assistiveText,
    onBlur,
    setValue,
    disabled = false,
    workflowsMetaData
  } = props

  const currentDropDownValue =
    dropDownValue &&
    workflowsMetaData?.data?.trigger_rules?.find(
      (rule) => rule.value === dropDownValue.value
    )
  return (
    <div>
      <Dropdown
        disabled={disabled}
        clearIcon={true}
        dropDownValue={currentDropDownValue || dropDownValue}
        onChange={(ev, val: IDropdownList<string>) => onChange(val)}
        menuLists={workflowsMetaData?.data?.trigger_rules || []}
        renderOption={(props, option, state) => (
          <>
            <Box
              component='li'
              sx={{padding: option.id === -1 ? '4px' : '4px !important'}}
              {...props}
            >
              <div
                className={`${classes.dropdownLiItemContainer} ${
                  dropDownValue && option.value === dropDownValue?.value
                    ? 'selected'
                    : ''
                }`}
              >
                <div className={classes.dropdownLiName}>{option.label}</div>
                <div className={classes.dropdownLiCreatedBy}>
                  {option.description}
                </div>
              </div>
            </Box>
          </>
        )}
        renderInput={(params) => {
          return (
            <div>
              <TextField
                {...params}
                disabled={disabled}
                onBlur={() => onBlur()}
                error={Boolean(error)}
                sx={inputStyles}
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'off' // disable autocomplete and autofill
                }}
                helperText={Boolean(error) && assistiveText}
              />
            </div>
          )
        }}
      />
      {currentDropDownValue && currentDropDownValue?.description && (
        <Typography className={classes.descriptionText}>
          {currentDropDownValue?.description}
        </Typography>
      )}
    </div>
  )
}
const mapStateToProps = (state: CommonState) => ({
  workflowsMetaData: state.workflowDetailsReducer.workflowsMetaData
})

const styleComponent = compose(
  withStyles(styles, {withTheme: true}),
  connect(mapStateToProps)
)(CustomDropDown)

export default styleComponent
