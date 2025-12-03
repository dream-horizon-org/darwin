import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    searchContainer: {
      padding: '8px',
      boxShadow:
        '0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.2)',
      marginBottom: '4px'
    },
    listLabel: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px'
    },
    activeItem: {
      backgroundColor: aliasTokens.ds_filter_item_active_background_color
    },
    placeholder: {
      color: aliasTokens.ds_form_field_placeholder_color
    },
    checkBoxLabel: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.ds_filter_default_text_color,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '160px'
    },
    filterButton: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      padding: '4px 8px 4px 12px',
      borderRadius: '4px',
      color: aliasTokens.ds_chip_default_text_color,
      textTransform: 'capitalize',
      height: '36px',
      width: '100%',
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
      border: `1px solid ${aliasTokens.ds_form_field_border_color}`,
      '&.active, &:hover': {
        backgroundColor: 'transparent'
        // color: aliasTokens.ds_chip_active_hover_text_color
      },
      '&.error': {
        border: `1px solid ${aliasTokens.ds_ticker_error_icon_color}`
      },
      '&.disabled': {
        backgroundColor: aliasTokens.ds_disabled_mui_field_background_color,
        color: aliasTokens.ds_footer_text_color,
        cursor: 'default'
      }
    },
    dateRangeWrapper: {
      '& .rdrInRange, .rdrStartEdge, .rdrEndEdge': {
        background: aliasTokens.ds_chip_active_hover_background_color,
        color: aliasTokens.ds_chip_active_hover_text_color
      },
      '& .rdrDateRangePickerWrapper': {
        flexDirection: 'row-reverse'
      },
      '& .rdrDefinedRangesWrapper': {
        borderLeft: `1px solid ${aliasTokens.date_range_filter_border_color}`,
        borderRight: 'none',
        background: aliasTokens.date_range_filter_background_color,
        color: aliasTokens.date_range_filter_text_color,
        width: 'auto'
      },
      '& .rdrStaticRange': {
        borderBottom: 'none',
        backgroundColor: aliasTokens.date_range_filter_background_color,
        color: aliasTokens.date_range_filter_text_color,
        margin: '4px',
        overflow: 'hidden',
        borderRadius: '4px'
      },
      '& .rdrInputRangeInput': {
        border: `1px solid ${aliasTokens.date_range_filter_border_color}`,
        color: aliasTokens.date_range_filter_text_color,
        background: aliasTokens.date_range_filter_active_color,
        '&:focus': {
          color: aliasTokens.date_range_filter_text_color
        },
        '&:hover': {
          color: aliasTokens.date_range_filter_text_color
        }
      },
      '& .rdrDateDisplayWrapper': {
        backgroundColor: aliasTokens.date_range_filter_background_color
      },
      '& .rdrDateDisplayItemActive': {
        borderColor: aliasTokens.date_range_filter_border_color
      },
      '& .rdrDateDisplayItem': {
        backgroundColor: aliasTokens.date_range_filter_active_color
      },
      '& .rdrDateDisplayItemActive input': {
        color: aliasTokens.date_range_filter_text_color
      },
      '& .rdrDateDisplayItem input': {
        color: aliasTokens.date_range_filter_text_color
      },
      '& .rdrNextPrevButton': {
        background: aliasTokens.date_range_filter_active_color,
        '&:hover': {
          background: aliasTokens.date_range_filter_active_button_color
        }
      },
      '& .rdrPprevButton i': {
        borderColor: `transparent ${aliasTokens.date_range_filter_text_color} transparent transparent`
      },
      '& .rdrNextButton i': {
        borderColor: `transparent transparent transparent ${aliasTokens.date_range_filter_text_color}`
      },
      '& .rdrMonthAndYearPickers select': {
        color: aliasTokens.date_range_filter_text_color
      },
      '& .rdrMonthName, .rdrWeekDay, .rdrDay': {
        color: aliasTokens.date_range_filter_text_color
      },
      '& .rdrDayNumber span': {
        color: aliasTokens.date_range_filter_text_color
      },
      '& .rdrDefinedRangesWrapper .rdrStaticRangeSelected': {
        backgroundColor: aliasTokens.date_range_filter_active_color
      },
      '& .rdrStaticRange:hover .rdrStaticRangeLabel, .rdrStaticRange:focus .rdrStaticRangeLabel':
        {
          background: aliasTokens.date_range_filter_active_color
        },
      '& .rdrCalendarWrapper': {
        background: aliasTokens.date_range_filter_background_color
      },
      '& .rdrInputRanges': {
        display: 'none'
      },
      '& .rdrStaticRangeLabel': {
        padding: '18px 20px'
      }
    },
    errorContainer: {
      color: aliasTokens.ds_ticker_error_icon_color,
      fontSize: '12px',
      lineHeight: '16px',
      marginTop: '4px',
      marginLeft: '12px'
    },
    actionContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '8px',
      gap: '8px',
      padding: '8px 16px 0 16px',
      background: aliasTokens.date_range_filter_active_color
    }
  })

export default styles
