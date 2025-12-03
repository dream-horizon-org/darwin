import {
  actionable_icon_button as actionTheme,
  divider as dividerTheme,
  modal as modalTheme
} from '../../design-tokens/index'
export const stylesDarkTheme = () => {
  const modal = modalTheme('dark')
  const actionable = actionTheme('dark')
  const DividerTheme = dividerTheme('dark')
  return {
    '& .MuiPaper-root': {
      '&.MuiDialog-paper': {
        width: 'max-content',
        margin: 0,
        background: modal.modal.ds_modal_background_color,
        boxShadow: '0px 0px 34px rgba(0, 0, 0, 0.16)',
        borderRadius: `${modal.ds_modal_radius}px`,
        maxWidth: 'unset',
        fontFamily: 'Roboto'
      }
    },
    '& .header': {
      display: 'flex',
      alignItems: 'center',
      padding: `${modal.ds_modal_header_top_spacing}px ${modal.ds_modal_header_horizontal_spacing}px`,
      color: modal.modal.ds_modal_header_title_text_color,
      fontSize: '18px',
      lineHeight: '24px',
      fontWeight: 700,
      justifyContent: 'space-between'
    },
    '& .title': {marginRight: `${modal.ds_modal_header_icon_left_spacing}px`},
    '& .closeIconDiv': {
      width: `${modal.ds_modal_header_icon_size}px`,
      height: `${modal.ds_modal_header_icon_size}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      '& .closeIcon': {
        fontSize: `${modal.ds_modal_header_icon_size}px`,
        '&:before': {
          color:
            actionable.actionable_icon_button.secondary.icon
              .ds_actionable_icon_secondary_default_icon_color
        }
      }
    },
    '& .dialogContent': {
      paddingLeft: `${modal.ds_modal_header_horizontal_spacing}px`,
      paddingRight: `${modal.ds_modal_header_horizontal_spacing}px`,
      paddingBottom: `${modal.ds_modal_header_bottom_spacing}px`,
      color: modal.modal.ds_modal_header_body_text_color,
      // width: `${modal.ds_modal_subtitle_width}px`,
      fontSize: '14px',
      lineHeight: '20px',
      overflowWrap: 'break-word',
      overflow: 'hidden',
      '&.noPadding': {
        paddingLeft: '0px',
        paddingRight: '0px'
      }
    },
    '& .dialogContentWithoutFixedWidth': {
      paddingLeft: `${modal.ds_modal_header_horizontal_spacing}px`,
      paddingRight: `${modal.ds_modal_header_horizontal_spacing}px`,
      paddingBottom: `${modal.ds_modal_header_bottom_spacing}px`,
      color: modal.modal.ds_modal_header_body_text_color,
      fontSize: '14px',
      lineHeight: '20px',
      overflowWrap: 'break-word',
      overflow: 'hidden',
      '&.noPadding': {
        paddingLeft: '0px',
        paddingRight: '0px'
      }
    },
    '& .divider': {
      width: '100%',
      height: '1px',
      background: DividerTheme.divider.ds_divider_border_generic_color
    },

    '& .dialogFooter': {
      padding: `${modal.ds_modal_footer_vertical_spacing}px ${modal.ds_modal_footer_right_spacing}px`
    },
    '& .footerContainer': {
      width: '100%'
    }
  }
}
