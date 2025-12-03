import {createUseStyles} from 'react-jss'
import {
  accordion as accordianTheme,
  divider as dividerTheme
} from '../../design-tokens/index'

const accordianDesignSetDarkTheme = accordianTheme('dark')
const dividerDesignSetDarkTheme = dividerTheme('dark')

export const stylesDarkTheme = createUseStyles({
  container: {
    minWidth: `${accordianDesignSetDarkTheme.ds_accordion_min_width}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    fontFamily: 'Roboto',
    '&.MuiAccordion-root': {
      boxShadow: 'none',
      backgroundColor:
        accordianDesignSetDarkTheme.accordian.background
          .ds_accordion_header_default_background_color,
      border: `${accordianDesignSetDarkTheme.ds_accordion_border_weight}px ${accordianDesignSetDarkTheme.border_style.ds_accordion_border_style} ${accordianDesignSetDarkTheme.accordian.border.ds_accordion_border_color}`,
      borderRadius: `${accordianDesignSetDarkTheme.ds_accordion_radius}px !important`,
      '&:hover': {
        '& .MuiAccordionSummary-root': {
          backgroundColor:
            accordianDesignSetDarkTheme.accordian.background
              .ds_accordion_header_hover_background_color,
          '&.Mui-expanded': {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0
          }
        }
      },
      '& .MuiAccordionSummary-root': {
        padding: `${accordianDesignSetDarkTheme.ds_accordion_header_vertical_spacing}px ${accordianDesignSetDarkTheme.ds_accordion_header_horizontal_spacing}px`,
        gap: '8px',
        minHeight: '32px',
        borderRadius: `${accordianDesignSetDarkTheme.ds_accordion_radius}px`,
        '& .MuiAccordionSummary-content': {
          margin: 0
        }
      }
    }
  },
  headerWrapper: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  title: {
    '&.MuiTypography-root': {
      color:
        accordianDesignSetDarkTheme.accordian.text
          .ds_accordion_header_title_text_color,
      fontSize: '16px',
      fontWeight: 700
    }
  },
  headerDesc: {
    '& :first-child': {
      '&.MuiTypography-root': {
        color:
          accordianDesignSetDarkTheme.accordian.text
            .ds_accordion_header_subtitle_text_color,
        fontSize: '12px',
        fontWeight: 400
      }
    }
  },
  divider: {
    width: '100%',
    background:
      dividerDesignSetDarkTheme.divider.ds_divider_border_generic_color
  }
})
