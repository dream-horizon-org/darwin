import Avatar from '@mui/material/Avatar'
import React, {CSSProperties, useState} from 'react'
import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {
  ActionableIconButtonSizes,
  ActionableIconButtonVariants,
  IconButton
} from '../../icon-button/index'
import {Icons} from '../../icon/index'
import {Tooltip, ToolTipPlacement} from '../../tooltip/index'
import {Typography, TypographyVariants as Variant} from '../../typography/index'
import {
  TableCellAlignment,
  TableCellSeverity,
  TableCellSize,
  TcCell
} from '../tc-cell/index'
import darkThemeStyles from './styles/darkThemeStyles'
import lightThemeStyles from './styles/lightThemeStyles'
import {TypographyVariants} from './tcTypography/constants'
import {TcTypography} from './tcTypography/tcTypography'

export type TcDataProps = {
  /**
   * To render the text inside the TableCell.
   */
  text: string | number
  /**
   * To render the secondary text inside the TableCell.
   */
  secondaryText?: string | number
  /**
   * To set the size of TableCell.
   */
  size?: TableCellSize
  /**
   * To set the severity of TableCell.
   */
  severity?: TableCellSeverity
  /**
   * If true toolTip will be visible on hover (only for text, icons and avatar will not be render if true)
   */
  showToolTip?: boolean
  /**
   * If true toolTip will be visible on hover for icon
   */
  showToolTipIcon?: boolean
  /**
   * tooltipText is text different then actual rendering text
   */
  tooltipText?: string
  /**
   * Select children alingment
   */
  align?: TableCellAlignment
  /**
   * Icon placed before the text.
   */
  leadingIcon?: Icons
  /**
   * Icon placed after the text.
   */
  trailingIcon?: Icons
  /**
   * Avatar url (always center align by default)
   */
  avatarLink?: string
  /**
   * onClick function to be provided.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * onClick icon to be provided.
   */
  onClickIcon?: Icons
  /**
   * For providing sub variants for actionableButton (only works when the actionable is true)
   */
  actionableVariants?: ActionableIconButtonVariants
  /**
   * For providing different variants for actionableButton (only works when the actionable is true)
   */
  actionableSizes?: ActionableIconButtonSizes
  /* Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
  /**
   * Trailing tooltip items
   */
  trailingTooltipItems?: Array<string>
  /**
   * Prop to set max-width of the text space (works only if showToolTip prop is false)
   */
  maxCellWidth?: number
  /**
   * To change theme
   */
  theme?: string

  /**
   * Highlight text
   */
  highlightText?: string
  /**
   * Highlight color
   */
  highLightStyle?: CSSProperties
  /**
   *  On mouse over event
   */
  onMouseOver?: (e) => void
  /**
   * On mouse leave event
   */
  onMouseLeave?: (e) => void
  /**
   * Show tooltip on maxCellWidth
   */
  showToolTipOnMaxCellWidth?: boolean
}
// eslint-disable-next-line complexity
export const TcData = (props: TcDataProps) => {
  const {
    size,
    text,
    severity,
    showToolTip,
    align,
    leadingIcon,
    trailingIcon,
    avatarLink,
    maxCellWidth,
    onClick,
    onClickIcon,
    actionableVariants,
    actionableSizes,
    stickyPosition,
    trailingTooltipItems,
    secondaryText,
    showToolTipIcon,
    tooltipText,
    highlightText,
    highLightStyle,
    onMouseOver,
    onMouseLeave,
    showToolTipOnMaxCellWidth
  } = props
  const [hoverStatus, setHover] = useState(false)
  const darkClasses = darkThemeStyles()
  const lightClasses = lightThemeStyles()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses

  const getTitle = (items: Array<string>) => {
    return items.join(', ')
  }
  const renderedIcon =
    leadingIcon && !avatarLink ? (
      <span className={`${classes.icon} ${leadingIcon} leading`}></span>
    ) : avatarLink ? (
      <Avatar src={avatarLink} className={`${classes.avatar} ${size}`} />
    ) : (
      <></>
    )

  const HighlightedCell = (
    highLightColor: CSSProperties,
    highLightText: string,
    originalText: string | number
  ) => {
    if (typeof originalText === 'number') {
      originalText = originalText.toString()
    }
    const regex = new RegExp(`(${highLightText})`, 'gi') // Case-insensitive search
    if (!regex.test(originalText)) {
      return originalText
    }

    const parts = originalText.split(regex)

    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === String(highLightText).toLowerCase() ? (
            <span key={index} style={highLightStyle}>
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    )
  }

  return (
    <TcCell
      onMouseOver={(e) => {
        if (onMouseOver) onMouseOver(e)
      }}
      onMouseLeave={(e) => {
        if (onMouseLeave) onMouseLeave(e)
      }}
      theme={theme}
      size={size}
      severity={severity}
      stickyPosition={stickyPosition}
      align={avatarLink ? TableCellAlignment.Left : align}
    >
      {showToolTip ? (
        <Tooltip
          theme={theme}
          disableHoverListener={!hoverStatus}
          title={text}
          placement={ToolTipPlacement.TopStart}
        >
          <div className={classes.extras}>
            {showToolTipIcon ? (
              <Tooltip
                theme={theme}
                title={tooltipText ?? text}
                placement={ToolTipPlacement.Top}
              >
                {renderedIcon}
              </Tooltip>
            ) : (
              renderedIcon
            )}
            <TcTypography
              themes={theme}
              setHover={setHover}
              className={`${classes.textBox} ${
                secondaryText ? classes.textBoxPrimary : ''
              } ${size}`}
              variant={TypographyVariants.BodyMedium}
            >
              {highlightText && highLightStyle
                ? HighlightedCell(highLightStyle, highlightText, text)
                : text}
            </TcTypography>
            {secondaryText && (
              <TcTypography
                themes={theme}
                setHover={setHover}
                className={`${classes.textBoxSecondary} ${size}`}
                variant={TypographyVariants.BodyMedium}
              >
                {highlightText && highLightStyle
                  ? HighlightedCell(
                      highLightStyle,
                      highlightText,
                      secondaryText
                    )
                  : secondaryText}
              </TcTypography>
            )}
          </div>
        </Tooltip>
      ) : (
        <div className={classes.container}>
          {showToolTipIcon ? (
            <Tooltip
              theme={theme}
              title={tooltipText ?? text}
              placement={ToolTipPlacement.Top}
            >
              {renderedIcon}
            </Tooltip>
          ) : (
            renderedIcon
          )}
          {maxCellWidth && !showToolTipOnMaxCellWidth && (
            <div>
              <div>
                <Typography
                  theme={theme}
                  maxContentWidth={maxCellWidth}
                  variant={Variant.BodyMedium}
                  className={`${classes.textBox} ${
                    secondaryText ? classes.textBoxPrimary : ''
                  } ${size}`}
                >
                  {highlightText && highLightStyle
                    ? HighlightedCell(highLightStyle, highlightText, text)
                    : text}
                </Typography>
              </div>
              {secondaryText && (
                <div>
                  <Typography
                    theme={theme}
                    className={`${classes.textBoxSecondary} ${size}`}
                    maxContentWidth={maxCellWidth}
                    variant={Variant.BodyMedium}
                  >
                    {highlightText && highLightStyle
                      ? HighlightedCell(
                          highLightStyle,
                          highlightText,
                          secondaryText
                        )
                      : secondaryText}
                  </Typography>
                </div>
              )}
            </div>
          )}
          {maxCellWidth && showToolTipOnMaxCellWidth && (
            <Tooltip theme={theme} title={text}>
              <div>
                <div>
                  <Typography
                    theme={theme}
                    maxContentWidth={maxCellWidth}
                    variant={Variant.BodyMedium}
                    className={`${classes.textBox}  ${
                      secondaryText ? classes.textBoxPrimary : ''
                    }${size}`}
                  >
                    {highlightText && highLightStyle
                      ? HighlightedCell(highLightStyle, highlightText, text)
                      : text}
                  </Typography>
                </div>
                {secondaryText && (
                  <div>
                    <Typography
                      theme={theme}
                      className={`${classes.textBoxSecondary}  ${size}`}
                      maxContentWidth={maxCellWidth}
                      variant={Variant.BodyMedium}
                    >
                      {highlightText && highLightStyle
                        ? HighlightedCell(
                            highLightStyle,
                            highlightText,
                            secondaryText
                          )
                        : secondaryText}
                    </Typography>
                  </div>
                )}
              </div>
            </Tooltip>
          )}
          {!maxCellWidth && (
            <div>
              <div>
                <Typography
                  theme={theme}
                  variant={Variant.BodyMedium}
                  className={`${classes.textBox} ${
                    secondaryText ? classes.textBoxPrimary : ''
                  } ${size}`}
                >
                  {highlightText && highLightStyle
                    ? HighlightedCell(highLightStyle, highlightText, text)
                    : text}
                </Typography>
              </div>
              {secondaryText && (
                <div>
                  <Typography
                    theme={theme}
                    variant={Variant.BodyMedium}
                    className={`${classes.textBoxSecondary} ${size}`}
                  >
                    {highlightText && highLightStyle
                      ? HighlightedCell(
                          highLightStyle,
                          highlightText,
                          secondaryText
                        )
                      : secondaryText}
                  </Typography>
                </div>
              )}
            </div>
          )}
          {trailingTooltipItems && trailingTooltipItems.length > 0 && (
            <Tooltip theme={theme} title={getTitle(trailingTooltipItems)}>
              <div className={classes.extras}>
                <span>+</span>
                <span>{trailingTooltipItems.length}</span>
              </div>
            </Tooltip>
          )}
          {trailingIcon && !onClick && (
            <span className={`${classes.icon} ${trailingIcon} trailing`}></span>
          )}
          {onClick && (
            <IconButton
              theme={theme}
              leadingIcon={onClickIcon ? onClickIcon : Icons.ICON_HIGHLIGHT_OFF}
              onClick={onClick}
              actionableVariants={actionableVariants}
              actionableSizes={actionableSizes}
              actionable={true}
            />
          )}
        </div>
      )}
    </TcCell>
  )
}

TcData.defaultProps = {
  size: TableCellSize.Large,
  severity: TableCellSeverity.Default,
  theme: 'dark'
}
