import {Accordion as MaterialUiAccordion} from '@mui/material'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import React, {ReactNode, useEffect} from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {
  ActionableIconButtonSizes,
  ActionableIconButtonVariants,
  IconButton
} from '../icon-button/index'
import {Icons} from '../icon/index'
import {stylesDarkTheme} from './styles/darkThemeStyles'
import {stylesLightTheme} from './styles/lightThemeStyles'

export type AccordionProps = {
  /**
   * a node to be rendered in the special component.
   */
  body?: ReactNode
  /**
   * a node to be rendered in the special component.
   */
  actionNode?: ReactNode
  /**
   * header title string
   */
  title: string
  /**
   * disable accordion
   */
  disabled: boolean
  /**
   * to control expand and collapse of accordion
   */
  isExpanded?: boolean
  /**
   * content description count
   */
  actionStatusNode?: ReactNode
  /**
   * content description count
   */
  desc?: string
  /**
   * To change theme
   */
  theme?: string
  /**
   * change function which is optional
   */
  onChange?: (val: boolean) => void
}

export function Accordion({
  body,
  actionNode,
  title,
  actionStatusNode,
  desc,
  disabled,
  isExpanded,
  onChange
}: AccordionProps) {
  const darkClasses = stylesDarkTheme()
  const lightClasses = stylesLightTheme()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses

  const [expanded, setExpanded] = React.useState<boolean>(false)

  const handleChange = (
    event: React.SyntheticEvent,
    isExpandedAccordion: boolean
  ) => {
    setExpanded(isExpandedAccordion)
    if (onChange) {
      onChange(isExpandedAccordion)
    }
  }

  useEffect(() => {
    if (isExpanded !== undefined && isExpanded !== null) {
      setExpanded(isExpanded)
    }
  }, [isExpanded])

  return (
    <MaterialUiAccordion
      expanded={expanded}
      onChange={handleChange}
      className={classes.container}
      disabled={disabled}
    >
      <AccordionSummary
        expandIcon={
          <IconButton
            leadingIcon={Icons.ICON_KEYBOARD_ARROW_DOWN}
            actionableVariants={
              ActionableIconButtonVariants.ACTIONABLE_SECONDARY
            }
            actionableSizes={ActionableIconButtonSizes.MEDIUM}
            actionable={true}
            theme={theme}
          />
        }
        aria-controls='panel1bh-content'
        id='panel1bh-header'
      >
        <Box className={classes.headerWrapper}>
          <Box>
            <Box className={classes.headerTitle}>
              <Typography variant='body1' className={classes.title}>
                {title}
              </Typography>
              {<>{actionStatusNode}</>}
            </Box>
            <Box className={classes.headerDesc}>
              <Typography variant='body1'>{desc}</Typography>
            </Box>
          </Box>
          {<>{actionNode}</>}
        </Box>
      </AccordionSummary>
      {expanded && <Divider className={classes.divider} />}
      <AccordionDetails>{body}</AccordionDetails>
    </MaterialUiAccordion>
  )
}

Accordion.defaultProps = {
  theme: 'dark',
  disabled: false
}
