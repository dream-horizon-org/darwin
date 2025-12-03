import React, {useEffect} from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Divider, DividerAlignment, DividerSeverity} from '../divider/index'
import {Dropdown, DropDownSizes} from '../dropdown/index'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../icon-button/index'
import {Icons} from '../icon/index'
import {Input, InputSizes} from '../input/index'
import {Surface} from '../surface/index'
import {Typography} from '../typography/index'
import {stylesDarkTheme, typographyDarkStyle} from './styles/darkThemeStyles'
import {stylesLightTheme, typographyLightStyle} from './styles/lightThemeStyles'

export type PaginationProps = {
  /**
   * To set a number
   */
  totalRow: number
  /**
   * To set the row per page
   */
  rowsPerPage: {label: string; id: number}
  /**
   * Function to handle row per page
   */
  rowsPerPageHandler: (
    event: React.SyntheticEvent<Element, Event>,
    newValue: {label: string; id: number}
  ) => void
  /**
   * To set the page number
   */
  page: number
  /**
   * Function to handle page change in page number
   */
  pageHandler: (newValue: number) => void
  /**
   * Array to set row per page options
   */
  rowPerPageOptions: {label: string; id: number}[]
  /**
   * Default value of pagination
   */
  defaultRowValue: {label: string; id: number}
  /**
   * To change theme
   */
  theme?: string
}

export function Pagination({
  totalRow,
  rowsPerPage,
  rowsPerPageHandler,
  page,
  pageHandler,
  rowPerPageOptions,
  defaultRowValue
}: PaginationProps) {
  const [tempPage, setTempPage] = React.useState<number>(page)
  useEffect(() => {
    setTempPage(page)
  }, [page])
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? stylesDarkTheme() : stylesLightTheme()
  const LowerLimit = 0

  const nextPageHandler = () => {
    if (page < Math.ceil(totalRow / rowsPerPage?.id)) setTempPage(page + 1)
  }

  const lastPageHandler = () => {
    if (totalRow > rowsPerPage?.id)
      setTempPage(Math.ceil(totalRow / rowsPerPage?.id))
  }

  const isPageDisabled = () => {
    return page >= Math.ceil(totalRow / rowsPerPage?.id) ? true : false
  }

  const onStepClick = () => {
    if (page > LowerLimit) setTempPage(page - 1)
  }

  React.useEffect(() => {
    const maxPage = Math.ceil(totalRow / rowsPerPage?.id)
    if (tempPage > 0 && tempPage <= maxPage) {
      pageHandler(tempPage)
    }
  }, [tempPage])
  return (
    <div data-testid='nagivation'>
      <Surface type={'primary'} theme={theme}>
        <div className={classes.container}>
          <div className={classes.paginationContainer}>
            <div className={classes.nextContainer}>
              <IconButton
                leadingIcon={Icons.ICON_FIRST_PAGE}
                onClick={() => setTempPage(LowerLimit + 1)}
                size={IconButtonSizes.LARGE}
                actionable={true}
                disabled={page <= LowerLimit + 1 ? true : false}
                actionableVariants={
                  ActionableIconButtonVariants.ACTIONABLE_SECONDARY
                }
                dataTestId='firstPageButton'
                theme={theme}
              />
              <IconButton
                leadingIcon={Icons.ICON_CHEVRON_LEFT}
                onClick={onStepClick}
                size={IconButtonSizes.LARGE}
                actionable={true}
                disabled={page <= LowerLimit + 1 ? true : false}
                actionableVariants={
                  ActionableIconButtonVariants.ACTIONABLE_SECONDARY
                }
                dataTestId='previousPageButton'
                theme={theme}
              />
              <div className={classes.pageNumberContainer}>
                <div className={classes.pageNumberAutocompleteStyle}>
                  <Input
                    name='Input'
                    size={InputSizes.SMALL}
                    value={
                      !isNaN(tempPage) &&
                      tempPage <= Math.ceil(totalRow / rowsPerPage?.id)
                        ? tempPage.toString()
                        : ''
                    }
                    inputType={'text'}
                    onChange={(event) => {
                      setTempPage(parseInt(event.target.value))
                    }}
                    theme={theme}
                  />
                </div>
                <div className={classes.pageTextContainer}>
                  <Typography
                    sx={
                      theme === 'dark'
                        ? typographyDarkStyle
                        : typographyLightStyle
                    }
                  >
                    {'of'}
                  </Typography>
                  <Typography
                    sx={
                      theme === 'dark'
                        ? typographyDarkStyle
                        : typographyLightStyle
                    }
                  >
                    {Math.ceil(totalRow / rowsPerPage?.id)}
                  </Typography>
                  <Typography
                    sx={
                      theme === 'dark'
                        ? typographyDarkStyle
                        : typographyLightStyle
                    }
                  >
                    {'pages'}
                  </Typography>
                </div>
              </div>
              <IconButton
                dataTestId='nextPageButton'
                leadingIcon={Icons.ICON_CHEVRON_RIGHT}
                onClick={() => nextPageHandler()}
                actionable={true}
                disabled={isPageDisabled()}
                size={IconButtonSizes.LARGE}
                actionableVariants={
                  ActionableIconButtonVariants.ACTIONABLE_SECONDARY
                }
                theme={theme}
              />
              <IconButton
                dataTestId='lastPageButton'
                leadingIcon={Icons.ICON_LAST_PAGE}
                actionable={true}
                size={IconButtonSizes.LARGE}
                disabled={isPageDisabled()}
                actionableVariants={
                  ActionableIconButtonVariants.ACTIONABLE_SECONDARY
                }
                onClick={() => {
                  lastPageHandler()
                }}
                theme={theme}
              />
            </div>
            <Divider
              alignment={DividerAlignment.Vertical}
              severity={DividerSeverity.Generic}
              theme={theme}
            />
            <div className={classes.rowContainer}>
              <Typography
                sx={
                  theme === 'dark' ? typographyDarkStyle : typographyLightStyle
                }
              >
                {'Rows'}
              </Typography>
              <div className={classes.rowAutocompleteStyle}>
                <Dropdown
                  size={DropDownSizes.Small}
                  defaultValue={defaultRowValue}
                  disableClearable={true}
                  dropDownValue={rowsPerPage}
                  onChange={(event, newValue) => {
                    rowsPerPageHandler(event, newValue)
                  }}
                  menuLists={rowPerPageOptions}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        </div>
      </Surface>
    </div>
  )
}
Pagination.defaultProps = {
  theme: 'dark'
}
