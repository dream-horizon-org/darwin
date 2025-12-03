import React, {ReactNode} from 'react'
import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {IconElement, IconSizes, IconVariants} from '../../icon-element/index'
import {Icons} from '../../icon/index'
import {LoaderSize, ProgressCircle} from '../../progress-circle/index'
import {Tooltip, ToolTipPlacement} from '../../tooltip/index'
import {
  TableCellSeverity,
  TableCellSize,
  TableCellType,
  TcCell
} from '../tc-cell/index'
import {IconListDarkThemeStyles} from './styles/darkThemeStyles'
import {IconListLightThemeStyles} from './styles/lightThemeStyles'
type IconsProps = {
  leadingIcon: Icons
  isLoading: boolean
  disabled: boolean
  iconSeverity: string
  tooltipContent: ReactNode
}

export type TcIconListProps = {
  size?: TableCellSize
  /**
   * Select severity of data-cell
   */
  severity?: TableCellSeverity
  /**
   * Select type of data-cell
   */
  type?: TableCellType
  /**
   * onClick function to be provided.
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>, index) => void
  /**
   * iconList to be provided.
   */
  iconList: IconsProps[]
  /**
   * To change theme
   */
  theme?: string
}

export function TcIconList(props: TcIconListProps) {
  const {iconList, onClick} = props
  const {theme} = useBitThemeContext()
  const lightClasses = IconListLightThemeStyles()
  const darkClasses = IconListDarkThemeStyles()
  const styles = theme === 'dark' ? darkClasses : lightClasses

  const onElementClick = (event, index) => {
    event.stopPropagation()
    if (onClick) {
      onClick(event, index)
    }
  }

  return (
    <TcCell size={props?.size} severity={props?.severity} type={props?.type}>
      <div data-testid={'icon-list'} className={styles.iconContainer}>
        {iconList?.map((res, index) => {
          return (
            <div key={index}>
              {!res?.isLoading && (
                <div
                  key={index}
                  onClick={(event) => {
                    if (!res?.disabled) {
                      onElementClick(event, index)
                    }
                  }}
                  className={`${styles.iconListElement} ${
                    res?.disabled && styles.disabledIcon
                  }`}
                >
                  {res?.tooltipContent && (
                    <Tooltip
                      title={res?.tooltipContent}
                      placement={ToolTipPlacement.BottomStart}
                    >
                      <div>
                        <IconElement
                          theme={theme}
                          leadingIcon={res?.leadingIcon}
                          size={IconSizes.MEDIUM}
                          severity={res?.iconSeverity as IconVariants}
                          disabled={res?.disabled}
                        />
                      </div>
                    </Tooltip>
                  )}
                  {!res?.tooltipContent && (
                    <IconElement
                      theme={theme}
                      leadingIcon={res?.leadingIcon}
                      size={IconSizes.MEDIUM}
                      severity={res?.iconSeverity as IconVariants}
                    />
                  )}
                </div>
              )}
              {res?.isLoading && (
                <div
                  onClick={(event) => {
                    event.stopPropagation()
                  }}
                >
                  <ProgressCircle size={LoaderSize.ExtraSmall} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </TcCell>
  )
}
TcIconList.defaultProps = {
  theme: 'dark'
}
