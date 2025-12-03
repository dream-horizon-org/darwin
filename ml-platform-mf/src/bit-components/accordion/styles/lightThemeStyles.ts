import {createUseStyles} from 'react-jss'
import {
  accordion as accordianTheme,
  divider as dividerTheme
} from '../../design-tokens/index'

const accordianDesignSetLightTheme = accordianTheme('light')
const dividerDesignSetLightTheme = dividerTheme('light')

export const stylesLightTheme = createUseStyles({
  container: {
    minWidth: `${accordianDesignSetLightTheme.ds_accordion_min_width}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    fontFamily: 'Roboto',
    '&.MuiAccordion-root': {
      boxShadow: 'none',
      backgroundColor:
        accordianDesignSetLightTheme.accordian.background
          .ds_accordion_header_default_background_color,
      border: `${accordianDesignSetLightTheme.ds_accordion_border_weight}px ${accordianDesignSetLightTheme.border_style.ds_accordion_border_style} ${accordianDesignSetLightTheme.accordian.border.ds_accordion_border_color}`,
      borderRadius: `${accordianDesignSetLightTheme.ds_accordion_radius}px !important`,
      '&:hover': {
        '& .MuiAccordionSummary-root': {
          backgroundColor:
            accordianDesignSetLightTheme.accordian.background
              .ds_accordion_header_hover_background_color,
          '&.Mui-expanded': {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0
          }
        }
      },
      '& .MuiAccordionSummary-root': {
        padding: `${accordianDesignSetLightTheme.ds_accordion_header_vertical_spacing}px ${accordianDesignSetLightTheme.ds_accordion_header_horizontal_spacing}px`,
        gap: '8px',
        minHeight: '32px',
        borderRadius: `${accordianDesignSetLightTheme.ds_accordion_radius}px`,
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
        accordianDesignSetLightTheme.accordian.text
          .ds_accordion_header_title_text_color,
      fontSize: '16px',
      fontWeight: 700
    }
  },
  headerDesc: {
    '& :first-child': {
      '&.MuiTypography-root': {
        color:
          accordianDesignSetLightTheme.accordian.text
            .ds_accordion_header_subtitle_text_color,
        fontSize: '12px',
        fontWeight: 400
      }
    }
  },
  divider: {
    width: '100%',
    background:
      dividerDesignSetLightTheme.divider.ds_divider_border_generic_color
  }
})
