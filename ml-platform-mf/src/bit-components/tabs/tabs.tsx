import MuiTab from '@mui/material/Tab'
import MuiTabs from '@mui/material/Tabs'
import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Icons} from '../icon/index'
import {TagsCounter} from '../tags/tags-counter/index'
import {IconPosition, TabsVariants} from './constants'
import {stylesDarkTheme} from './styles/tabsDarkThemeStyles'
import {stylesLightTheme} from './styles/tabsLightThemeStyles'
import {tabCustomStyles} from './tabs.style'
import {
  getIconPositionClassName,
  getTabClassName,
  getTabIconClassName,
  getTabValue
} from './utils'

export interface TabLabelProps {
  /**
   * tab label to be render
   */
  label: string
  /**
   * You can provide your own value. Otherwise, we fallback to the child position index.
   */
  value?: number
  /**
   * If counter provided, tab will render with counter
   */
  counter?: number
  /**
   * If true, the tab will be disabled
   */
  disabled?: boolean
  /**
   * To be used an identifier for testing.
   */
  testIdentifier?: string
  /**
   * The label for the Tab as a string.
   */
  ariaControl?: string
  /**
   * The icon for the Tab.
   */
  icon?: Icons
}

export type TabsProps = {
  /**
   * Label array which needs to be rendered
   */
  tabLabels: Array<TabLabelProps>
  /**
   * Position of icon in tab to be rendered
   */
  tabLabelIconPosition?: IconPosition
  /**
   * onChange function to be provided
   */
  onChange: (event: React.SyntheticEvent<Element, Event>, value: any) => void
  /**
   * value is index position of tab to be selected
   */
  value: number
  /**
   * To change the variant of the component.
   */
  variant?: TabsVariants
  /**
   * To be used an identifier for testing.
   */
  testIdentifier?: string
  /**
   * The label for the Tabs as a string.
   */
  ariaLabel?: string
  /**
   * To be used an identifier for console variant of tabs.
   */
  isConsoleVariant?: boolean
  /**
   * Option to disable ripple effect in tabs
   */
  disableRipple?: boolean
  /**
   * To change theme
   */
  theme?: string
}

export function Tabs(props: TabsProps) {
  const classes = tabCustomStyles()
  const {theme} = useBitThemeContext()
  const dark = stylesDarkTheme()
  const light = stylesLightTheme()

  const tabStyle = () => {
    const styles = theme === 'dark' ? dark : light
    return styles
  }

  return (
    <MuiTabs
      value={props.value}
      onChange={props.onChange}
      sx={tabStyle()}
      variant={props.variant}
      data-testid={props?.testIdentifier}
      scrollButtons={false}
      aria-label={props?.ariaLabel}
      className={`${props?.isConsoleVariant && classes.consoleTabSection}`}
    >
      {props?.tabLabels?.map((tab, index) => (
        <MuiTab
          key={getTabValue(tab.value, index)}
          value={getTabValue(tab.value, index)}
          className={`${
            props?.value === getTabValue(tab.value, index)
              ? props?.isConsoleVariant
                ? 'muiConsoleTab'
                : 'muiSelectedTab'
              : ''
          }`}
          disableRipple={props?.disableRipple}
          label={
            <div className={classes.tabContainer}>
              {tab?.icon &&
                props?.tabLabelIconPosition === IconPosition.LEFT && (
                  <span
                    className={`${tab.icon} ${getTabIconClassName(
                      props.value,
                      getTabValue(tab.value, index),
                      tab.disabled
                    )}`}
                    data-testid='tabWithIcon'
                  ></span>
                )}
              <span
                className={`${getTabClassName(
                  props?.value,
                  getTabValue(tab?.value, index),
                  tab?.disabled
                )} ${props?.isConsoleVariant && 'consoleTab'}
                ${getIconPositionClassName(props?.tabLabelIconPosition)} `}
              >
                {tab?.label}
              </span>
              {tab?.counter !== undefined && (
                <TagsCounter
                  theme={theme}
                  counter={tab.counter}
                  active={props.value === getTabValue(tab.value, index)}
                  disabled={tab.disabled}
                />
              )}
              {tab.icon &&
                props?.tabLabelIconPosition === IconPosition.RIGHT && (
                  <span
                    className={`${tab.icon} ${getTabIconClassName(
                      props.value,
                      getTabValue(tab.value, index),
                      tab.disabled
                    )}`}
                    data-testid='tabWithIcon'
                  ></span>
                )}
            </div>
          }
          disabled={tab.disabled}
          data-testid={tab?.testIdentifier}
          aria-controls={tab?.ariaControl}
        />
      ))}
    </MuiTabs>
  )
}

Tabs.defaultProps = {
  variant: TabsVariants.STANDARD,
  tabLabelIconPosition: IconPosition.RIGHT,
  theme: 'dark'
}
