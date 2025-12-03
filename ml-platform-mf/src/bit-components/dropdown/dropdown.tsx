import type {AutocompleteRenderInputParams} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import React, {ReactNode, useState} from 'react'
import {Chip, ChipSizes} from '../chip/index'
import {
  IconPosition,
  ListItemDropdown
} from '../list-item/list-item-dropdown/index'

import {Paper} from '@mui/material'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {IconElement, IconSizes} from '../icon-element/index'
import {Icons} from '../icon/index'
import {ProgressCircle} from '../progress-circle/index'
import {DropDownSizes, FieldVariants} from './constants'
import {boxStyle} from './dropdown.style'
import {
  autoCompleteDarkStyle,
  autoCompletePaperDarkStyle,
  inputDarkStyles,
  stylesDarkTheme
} from './styles/dropdownDarkThemeStyles'
import {
  autoCompleteLightStyle,
  autoCompletePaperLightStyle,
  inputLightStyles,
  stylesLightTheme
} from './styles/dropdownLightThemeStyles'
import {transformMenuList} from './utils'

export type DropdownProps = {
  /**
   * To set the size of dropdown
   */
  size?: DropDownSizes
  /**
   *  On mouse enter event
   */
  onMouseEnter?: (e, props, option) => ReactNode
  /**
   * On mouse out event
   */
  onMouseOut?: (e, props, option) => ReactNode

  /**
   * To handle key down event
   */
  handleKeyCallback?: (e: React.KeyboardEvent<HTMLDivElement>) => void
  /**
   * To render tags
   */
  handleRenderTags?: (
    valueTags: readonly string[] | object[],
    getTagProps
  ) => React.ReactNode
  /**
   * To set free solo
   */
  freeSolo?: boolean
  /**
   * To disable or enable clear icon
   */
  clearIcon?: boolean
  /**
   * To set placeholder text
   */
  placeholder?: string
  /**
   * To disable portal
   */
  disablePortal?: boolean
  /**
   * To render custom helper text component
   */
  helperTextComponent?: JSX.Element
  /**
   * To set the menuList
   */
  menuLists: Array<object> | Array<number> | Array<string>
  /**
   * To set the multiple
   */
  isMultipleSelection?: boolean
  /**
   * To set the label
   */
  label?: string
  /**
   * To set the image
   */
  isListWithIcon?: boolean
  /**
   * To set the value
   */
  dropDownValue?: any
  /**
   * To disable typing in input
   */
  disableInput?: boolean
  /**
   * To disable input after number of inputs
   */
  disableInputBar?: boolean
  /**
   * To change the value
   */
  onChange: (event: React.SyntheticEvent<Element, Event>, value: any) => void
  /**
   * To set the default value
   */
  defaultValue?: any
  /**
   * To remove the clearable option
   */
  disableClearable?: Boolean
  /**
   * To pass the data test Id
   */
  dataTestId?: String
  /**
   * Assistive text for dropdown
   */
  assistiveText?: String
  /**
   * Can add new option in list
   */
  canAddNewOption?: boolean
  /**
   * on Enter key Pressed handler
   */
  handleEnterKey?: (value: {label: string; id: number}) => void
  /**
   * Specify icon position of dropdown
   */
  iconPosition?: IconPosition
  /**
   * If true, the error state is enabled.
   */
  error?: boolean
  /**
   * to provide onChange on input
   */
  onInputChange?: (
    event: React.SyntheticEvent<Element, Event>,
    value?: string,
    reason?: string
  ) => void
  /**
   * to provide value on input
   */
  inputValue?: string
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   * To listen when field is out of focus
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  /**
   * To listen when field is in focus
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  /**
   * To change theme
   */
  theme?: string
  /**
   * If true, the input element is required.
   */
  required?: boolean
  /**
   * To filter selected options
   */
  filterSelectedOptions?: boolean
  /**
   * To render Input
   */
  renderInput?: (params: AutocompleteRenderInputParams) => ReactNode
  /**
   * To render options
   */
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: any,
    state: object
  ) => ReactNode
  /**
   * To show loading state
   */
  loading?: boolean
  /**
   * To show pop over Icon
   */
  showPopoverIcon?: boolean
  /**
   * To show label as placeholder
   */
  showLabelAsPlaceholder?: boolean
  /**
   * To get options as Label
   */
  getOptionLabel?: (option: any) => string
  /**
   * To get options disabled
   */
  getOptionDisabled?: (option: any) => boolean
  /**
   * To limit tags
   */
  limitTags?: number
  /**
   * To disable filtering
   */
  disableDefaultFiltering?: boolean
  /**
   * Custom popper height
   */
  customPopperHeight?: string
  /**
   * To load more results
   */
  loadMoreResults?: (currentOptionsCount: number, filter: string) => void
  /**
   * transform menuList
   */
  enableTransformMenuList?: boolean
  /**
   * boolean to open dropdown
   */
  open?: boolean
  /**
   * boolean to open dropdown
   */
  InputProps?: any
  /**
   * to render checkbox on left
   */
  renderOptionCheckBox?: boolean
  /**
  element is focused during the first mount.
  */
  autoFocus?: boolean
  /**
   * To define input field variants
   */
  fieldVariant: 'withOutline' | 'withoutOutline'
  /**
   * To add start icons for render input
   */
  startAdornment?: Icons
}
export function Dropdown({
  size,
  menuLists,
  isMultipleSelection,
  label,
  isListWithIcon,
  dropDownValue,
  onChange,
  onMouseEnter,
  onMouseOut,
  defaultValue,
  disableClearable,
  dataTestId,
  assistiveText,
  canAddNewOption,
  handleEnterKey,
  iconPosition,
  disabled,
  error,
  onBlur,
  onFocus,
  onInputChange,
  required,
  inputValue,
  placeholder,
  disablePortal,
  freeSolo,
  handleKeyCallback,
  handleRenderTags,
  helperTextComponent,
  InputProps,
  disableInputBar,
  disableInput,
  renderInput,
  renderOption,
  filterSelectedOptions,
  loading,
  showPopoverIcon,
  showLabelAsPlaceholder,
  getOptionLabel,
  getOptionDisabled,
  limitTags,
  disableDefaultFiltering,
  customPopperHeight,
  loadMoreResults,
  enableTransformMenuList,
  open,
  renderOptionCheckBox,
  autoFocus,
  fieldVariant,
  startAdornment
}: DropdownProps) {
  const darkClasses = stylesDarkTheme()
  const lightClasses = stylesLightTheme()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses

  const getAutoCompleteStyle = (sizes) => {
    return theme === 'dark'
      ? autoCompleteDarkStyle(sizes)
      : autoCompleteLightStyle(sizes)
  }

  const autocompletePaperDark = autoCompletePaperDarkStyle()
  const autocompletePaperLight = autoCompletePaperLightStyle()
  const getAutoCompletePaperStyle = () => {
    return theme === 'dark' ? autocompletePaperDark : autocompletePaperLight
  }

  const getInputStyles = (isDisabled) => {
    return theme === 'dark'
      ? inputDarkStyles(isDisabled)
      : inputLightStyles(isDisabled)
  }

  const [text, setText] = useState('')
  const uniqueId = (length = 16) =>
    parseInt(
      Math.ceil(Math.random() * Date.now())
        .toPrecision(length)
        .toString()
        .replace('.', '')
    )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && text && handleEnterKey && canAddNewOption)
      handleEnterKey({label: text, id: uniqueId()})
  }
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e?.target?.value)
  }

  return (
    <>
      {isMultipleSelection ? (
        <Autocomplete
          open={open}
          inputValue={inputValue}
          onInputChange={onInputChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          limitTags={disabled ? -1 : limitTags}
          value={dropDownValue}
          getOptionDisabled={getOptionDisabled}
          onChange={onChange}
          multiple
          freeSolo={freeSolo}
          isOptionEqualToValue={(option, value) => {
            return JSON.stringify(option) === JSON.stringify(value)
          }}
          disablePortal={disablePortal}
          filterOptions={
            disableDefaultFiltering ? (options) => options : undefined
          }
          loading={loading}
          ListboxProps={{
            style: {
              maxHeight: customPopperHeight
            },
            onScroll: (event: React.SyntheticEvent) => {
              if (loadMoreResults && menuLists) {
                const listboxNode = event.currentTarget
                if (
                  listboxNode.scrollTop + listboxNode.clientHeight >
                  listboxNode.scrollHeight - 2
                ) {
                  loadMoreResults(menuLists.length, dropDownValue)
                }
              }
            },
            role: 'list-box'
          }}
          data-testid={dataTestId}
          defaultValue={defaultValue}
          className={`${dropDownValue?.length > 0 && 'autocomplete'} ${
            disabled ? 'disabled' : ''
          }`}
          sx={getAutoCompleteStyle(size)}
          PaperComponent={({children}) => (
            <Paper sx={getAutoCompletePaperStyle()}>{children}</Paper>
          )}
          disableClearable={disableClearable ? true : false}
          options={
            enableTransformMenuList
              ? transformMenuList(menuLists).map((option) => option)
              : menuLists
          }
          id='tags-outlined'
          getOptionLabel={
            getOptionLabel ? getOptionLabel : (option) => option.label
          }
          filterSelectedOptions={filterSelectedOptions}
          renderTags={
            handleRenderTags
              ? handleRenderTags
              : (valueTags: readonly string[] | object[], getTagProps) =>
                  valueTags.map((option, index: number) => {
                    return (
                      <div key={index} className={classes.chipWrapper}>
                        <Chip
                          selected={true}
                          label={option.label ?? option}
                          {...getTagProps({index})}
                          size={ChipSizes.Small}
                          avatarText={option?.avatarText}
                          avatarSize={option?.avatarSize}
                        />
                      </div>
                    )
                  })
          }
          renderInput={
            renderInput
              ? renderInput
              : (params) => (
                  <TextField
                    error={error}
                    sx={getInputStyles(disabled)}
                    className={`${size} ${
                      disableInputBar ? 'disableInputBar' : null
                    }`}
                    {...params}
                    required={required}
                    value={text}
                    onChange={handleOnChange}
                    label={showLabelAsPlaceholder ? '' : label}
                    placeholder={showLabelAsPlaceholder ? label : placeholder}
                    helperText={
                      helperTextComponent ?? (
                        <span className={'helperText'}>
                          <span>{assistiveText}</span>
                        </span>
                      )
                    }
                    onKeyDown={handleKeyCallback ?? handleKeyDown}
                    disabled={disableInput}
                    InputProps={{
                      ...params.InputProps,
                      ...InputProps,
                      className: `${fieldVariant}`,
                      startAdornment: (
                        <>
                          {startAdornment && (
                            <IconElement
                              leadingIcon={startAdornment}
                              size={IconSizes?.SMALL}
                            />
                          )}
                          {params.InputProps.startAdornment}
                        </>
                      ),
                      endAdornment: (
                        <React.Fragment>
                          {params.InputProps.endAdornment}
                          {InputProps?.endAdornment ?? <></>}
                        </React.Fragment>
                      )
                    }}
                    autoFocus={autoFocus}
                  />
                )
          }
          noOptionsText={
            canAddNewOption && text ? (
              <span className={classes.addOptionsTextWrap}>
                Press 'Enter' to add {text}
              </span>
            ) : (
              'No Options available'
            )
          }
          renderOption={
            renderOption
              ? renderOption
              : (props, option, state) => {
                  if (
                    !enableTransformMenuList &&
                    option === 'Loading More Options...'
                  ) {
                    return (
                      <Box
                        {...props}
                        component='li'
                        key={option}
                        onClick={(e) => {
                          e.preventDefault()
                        }}
                        onMouseEnter={(e) => {
                          e.stopPropagation()

                          if (onMouseEnter) {
                            onMouseEnter(e, props, option)
                          }
                        }}
                        onMouseOut={(e) => {
                          e.stopPropagation()

                          if (onMouseOut) {
                            onMouseOut(e, props, option)
                          }
                        }}
                      >
                        <div className={classes.loadingContainer}>
                          <div className={classes.loadingIcon}>
                            <ProgressCircle size={24} />
                          </div>
                          <div className={classes.loadingText}>{option}</div>
                        </div>
                      </Box>
                    )
                  }
                  return (
                    <Box
                      component='li'
                      sx={boxStyle}
                      {...props}
                      onMouseEnter={(e) => {
                        e.stopPropagation()

                        if (onMouseEnter) {
                          onMouseEnter(e, props, option)
                        }
                      }}
                      onMouseOut={(e) => {
                        e.stopPropagation()

                        if (onMouseOut) {
                          onMouseOut(e, props, option)
                        }
                      }}
                    >
                      {isListWithIcon ? (
                        <ListItemDropdown
                          text={option.label}
                          icon={option.icon}
                          key={option.id}
                          iconPosition={iconPosition}
                          secondaryText={option?.secondaryText}
                          tertiaryText={option?.tertiaryText}
                          avatarSrc={option?.avatarSrc}
                          avatarText={option?.avatarText}
                          theme={theme}
                          isSelected={state.selected}
                          hasPermission={option?.hasPermission}
                        />
                      ) : renderOptionCheckBox ? (
                        <ListItemDropdown
                          text={option.label}
                          renderCheckBox={true}
                          iconPosition={IconPosition.LEFT}
                          isSelectedCheckBox={state.selected}
                        />
                      ) : (
                        <ListItemDropdown
                          isSelected={state.selected}
                          text={
                            typeof option === 'string' ? option : option.label
                          }
                          id={typeof option === 'string' ? option : option.id}
                          theme={theme}
                        />
                      )}
                    </Box>
                  )
                }
          }
        />
      ) : (
        <Autocomplete
          open={open}
          inputValue={inputValue}
          onInputChange={onInputChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          getOptionDisabled={getOptionDisabled}
          data-testid={dataTestId}
          sx={getAutoCompleteStyle(size)}
          defaultValue={defaultValue}
          PaperComponent={({children}) => (
            <Paper sx={getAutoCompletePaperStyle()}>{children}</Paper>
          )}
          value={dropDownValue}
          disableClearable={disableClearable ? true : false}
          disablePortal
          onChange={onChange}
          loading={loading}
          options={
            enableTransformMenuList
              ? transformMenuList(menuLists).map((option) => option)
              : menuLists
          }
          noOptionsText={
            canAddNewOption && text ? (
              <span className={classes.addOptionsTextWrap}>
                Press 'Enter' to add {text}
              </span>
            ) : (
              'No Options available'
            )
          }
          forcePopupIcon={showPopoverIcon}
          id='tags-outlined'
          className={` ${disabled ? 'disabled11' : ''}`}
          getOptionLabel={
            getOptionLabel ? getOptionLabel : (option) => option.label
          }
          isOptionEqualToValue={(option, value) => {
            return JSON.stringify(option) === JSON.stringify(value)
          }}
          renderInput={
            renderInput
              ? renderInput
              : (params) => (
                  <TextField
                    {...params}
                    error={error}
                    InputProps={{
                      ...params.InputProps,
                      ...InputProps,
                      className: `${fieldVariant}`,
                      startAdornment: (
                        <>
                          {startAdornment && (
                            <IconElement
                              leadingIcon={startAdornment}
                              size={IconSizes?.SMALL}
                            />
                          )}
                          {params.InputProps.startAdornment}
                        </>
                      ),
                      endAdornment: (
                        <React.Fragment>
                          {params.InputProps.endAdornment}
                          {InputProps?.endAdornment ?? <></>}
                        </React.Fragment>
                      )
                    }}
                    sx={getInputStyles(disabled)}
                    className={`${size} ${
                      disableInputBar ? 'disableInputBar' : null
                    }`}
                    required={required}
                    label={showLabelAsPlaceholder ? '' : label}
                    placeholder={showLabelAsPlaceholder ? label : ''}
                    value={text}
                    onChange={handleOnChange}
                    onKeyDown={handleKeyDown}
                    helperText={
                      helperTextComponent ?? (
                        <span className={'helperText'}>
                          <span>{assistiveText}</span>
                        </span>
                      )
                    }
                    disabled={disableInput}
                    autoFocus={autoFocus}
                  />
                )
          }
          renderOption={
            renderOption
              ? renderOption
              : (props, option, state) => (
                  <Box
                    component='li'
                    sx={boxStyle}
                    {...props}
                    onMouseEnter={(e) => {
                      e.stopPropagation()

                      if (onMouseEnter) {
                        onMouseEnter(e, props, option)
                      }
                    }}
                    onMouseOut={(e) => {
                      e.stopPropagation()

                      if (onMouseOut) {
                        onMouseOut(e, props, option)
                      }
                    }}
                  >
                    {isListWithIcon ? (
                      <ListItemDropdown
                        text={option.label}
                        isSelected={state.selected}
                        icon={option.icon}
                        key={option.id}
                        iconPosition={iconPosition}
                        secondaryText={option?.secondaryText}
                        tertiaryText={option?.tertiaryText}
                        avatarSrc={option?.avatarSrc}
                        avatarText={option?.avatarText}
                        theme={theme}
                        hasPermission={option?.hasPermission}
                      />
                    ) : (
                      <ListItemDropdown
                        text={
                          typeof option === 'string' ? option : option.label
                        }
                        isSelected={state.selected}
                        id={typeof option === 'string' ? option : option.id}
                        theme={theme}
                      />
                    )}
                  </Box>
                )
          }
        />
      )}
    </>
  )
}

Dropdown.defaultProps = {
  size: DropDownSizes.Large,
  dataTestId: 'dropdown',
  canAddNewOption: false,
  freeSolo: false,
  placeholder: '',
  clearIcon: true,
  disablePortal: false,
  disableInput: false,
  theme: 'dark',
  filterSelectedOptions: false,
  enableTransformMenuList: true,
  autoFocus: false,
  fieldVariant: FieldVariants.OUTLINED
}
