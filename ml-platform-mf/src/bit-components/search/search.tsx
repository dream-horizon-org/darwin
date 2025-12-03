import {Box, TextField} from '@mui/material'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Select, {SelectChangeEvent} from '@mui/material/Select'
import React, {useEffect, useRef, useState} from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Chip, ChipSizes} from '../chip/index'
import {
  ActionableIconButtonSizes,
  ActionableIconButtonVariants,
  IconButton
} from '../icon-button/index'
import {Icons} from '../icon/index'
import {menuProps} from './search.types'
import stylesDarkTheme, {
  styleDarkThemeListItem,
  stylesDarkSearchInputStyle,
  stylesDarkThemeSearch,
  stylesDarkThemeSearchListStyle
} from './styles/darkThemeStyles'
import stylesLightTheme, {
  styleLightThemeListItem,
  stylesLightSearchInputStyle,
  stylesLightThemeSearch,
  stylesLightThemeSearchListStyle
} from './styles/lightThemeStyles'
export type SearchProps = {
  /**
   * for placeholder to render
   */
  placeholder?: string
  /**
   * function to be called on search
   */
  onSearch: (searchTerm: string) => void
  /**
   * initial value for the search
   */
  initiaValue?: string
  /**
   * if true component is disabled
   */
  disabled?: boolean
  /**
   *to pass array of options to search for Array<{value:string, text:string}>
   */
  searchByOptions?: Array<{value: string | number; text: string}>
  /**
   * to pass value for the searchBy options
   */
  searchByValue?: string
  /**
   * function to be called on changing searchBy options
   */
  onChangeForSearchBy?: (value: any) => void
  /**
   * To be used an identifier for testing the search component.
   */
  testIdentifier?: string
  /**
   * To be used to hide default menu option.
   */
  showDefaultMenu?: boolean
  /**
   * Identifier on searchBy select
   */
  testIdentifierForSearchSelect?: string
  /**
   * To change theme
   */
  theme?: string
  /**
   * If true, the input element is required.
   */
  required?: boolean
  /**
   * To turn off the autocomplete
   */
  autoComplete?: string
  /**
   * To turn on the autoSearch
   */
  autoSearch?: boolean
  /**
   * drop down list node
   */
  renderList?: ({
    listItems,
    ...rest
  }: {
    [x: string]: any
    listItems: any
  }) => JSX.Element
  /**
   * function to be called on input text change
   */
  onAutoSearchChange?: (searchTerm: string) => void
  /**
   * auto search dropdown list items array
   */
  listItems?: {id: number; value: any}[]
  /**
    Text to display when there are no options.
   */
  noOptionsText?: string
  /**
     To show the auto search list
     */
  showAutoSearchList?: boolean
}

export function Search(props: SearchProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [text, setText] = useState('')
  const divRef = useRef<HTMLDivElement>(null)
  const {
    disabled,
    initiaValue,
    searchByOptions,
    showDefaultMenu,
    onChangeForSearchBy,
    searchByValue,
    required,
    testIdentifier,
    testIdentifierForSearchSelect,
    autoComplete,
    autoSearch,
    renderList,
    onAutoSearchChange,
    listItems,
    noOptionsText,
    showAutoSearchList
  } = props
  const lightClasses = stylesLightTheme()
  const darkClasses = stylesDarkTheme()
  const {theme} = useBitThemeContext()
  const classes = theme === 'light' ? lightClasses : darkClasses
  useEffect(() => {
    if (initiaValue !== null) {
      setText(initiaValue || '')
    }
  }, [initiaValue])

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e?.target?.value)
    if (autoSearch && onAutoSearchChange) {
      onAutoSearchChange(e?.target?.value)
    }
  }

  const getStylesListItem = () => {
    return theme === 'light' ? styleLightThemeListItem : styleDarkThemeListItem
  }

  const getStylesSearch = () => {
    return theme === 'light' ? stylesLightThemeSearch : stylesDarkThemeSearch
  }
  const getStylesSearchInput = () => {
    return theme === 'light'
      ? stylesLightSearchInputStyle
      : stylesDarkSearchInputStyle
  }
  const getStylesSearchList = () => {
    return theme === 'light'
      ? stylesLightThemeSearchListStyle
      : stylesDarkThemeSearchListStyle
  }

  const clearCallback = () => {
    setText('')
    props.onSearch('')
    if (autoSearch && onAutoSearchChange) {
      onAutoSearchChange('')
    }
  }

  const searchCallback = () => {
    props.onSearch(text)
  }

  const handleSearchOnEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      searchCallback()
    }
  }
  const handleSelectOnChange = (e: SelectChangeEvent) => {
    if (onChangeForSearchBy) {
      onChangeForSearchBy(e?.target.value)
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (divRef.current && !divRef.current.contains(event.target)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const icon = (
    dataTestId: string,
    leadingIcon: Icons,
    onClick: () => void,
    actionableVariants: ActionableIconButtonVariants,
    actionableSizes: ActionableIconButtonSizes,
    actionable: boolean,
    isSelected: boolean,
    isDisabled: boolean
  ) => {
    return (
      <IconButton
        dataTestId={dataTestId}
        leadingIcon={leadingIcon}
        onClick={onClick}
        actionableVariants={actionableVariants}
        actionableSizes={actionableSizes}
        actionable={actionable}
        isSelected={isSelected}
        disabled={isDisabled}
        theme={theme}
      />
    )
  }

  return (
    <Box ref={divRef}>
      <TextField
        placeholder={props.placeholder}
        value={text}
        fullWidth
        name='SearchInput'
        onChange={handleOnChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => !autoSearch && setIsFocused(false)}
        onKeyPress={handleSearchOnEnter}
        autoComplete={autoComplete}
        data-testid={testIdentifier}
        required={required}
        InputProps={{
          ...(searchByOptions && {
            startAdornment: (
              <InputAdornment sx={getStylesSearchInput()} position='start'>
                <FormControl fullWidth>
                  <Select
                    value={searchByValue}
                    onChange={handleSelectOnChange}
                    displayEmpty
                    MenuProps={menuProps(classes)}
                    data-testid={testIdentifierForSearchSelect}
                  >
                    {showDefaultMenu && (
                      <MenuItem sx={getStylesListItem()} value=''>
                        Search by
                      </MenuItem>
                    )}
                    {searchByOptions.map((element) => {
                      return (
                        <MenuItem
                          key={element?.value}
                          sx={getStylesListItem()}
                          className={` ${
                            searchByValue === element?.value ? 'selected' : ''
                          }`}
                          value={element?.value}
                        >
                          {element?.text}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </InputAdornment>
            )
          }),
          endAdornment: (
            <InputAdornment position='end'>
              {text.length >= 1 && (
                <>
                  {icon(
                    'close-icon',
                    Icons.ICON_CLOSE,
                    clearCallback,
                    ActionableIconButtonVariants.ACTIONABLE_TERTIARY,
                    ActionableIconButtonSizes.SMALL,
                    true,
                    false,
                    false
                  )}
                  <Divider className='divider' orientation='vertical' />
                </>
              )}
              {icon(
                'search-icon',
                Icons.ICON_SEARCH,
                searchCallback,
                ActionableIconButtonVariants.ACTIONABLE_SECONDARY,
                ActionableIconButtonSizes.MEDIUM,
                true,
                isFocused && text.length > 0,
                text.length === 0
              )}
            </InputAdornment>
          )
        }}
        className={`${disabled ? 'disabled' : null} medium iconRightPadding ${
          searchByOptions ? 'isSearchBy' : ''
        }`}
        sx={getStylesSearch()}
      />
      {autoSearch && isFocused && showAutoSearchList && (
        <Box sx={getStylesSearchList()}>
          <>
            {listItems && listItems.length > 0 ? (
              <>
                {renderList &&
                  renderList({
                    listItems,
                    theme,
                    text,
                    setText,
                    isFocused,
                    setIsFocused
                  })}
              </>
            ) : (
              <Chip
                theme={theme}
                size={ChipSizes.Medium}
                label={noOptionsText ?? ''}
              />
            )}
          </>
        </Box>
      )}
    </Box>
  )
}

Search.defaultProps = {
  placeholder: 'Search...',
  showDefaultMenu: true,
  theme: 'dark'
}

export default Search
