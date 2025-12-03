import {text_button as textButtonTheme} from '../../design-tokens/index'
export const stylesDarkTheme = () => {
  const button = textButtonTheme('dark')
  return {
    textTransform: 'uppercase',
    fontWeight: 700,
    minWidth: 'unset',
    height: 'max-content',
    borderRadius: `${button.ds_text_button_radius}px`,
    '&.maxWidth': {
      width: '100%'
    },
    '&.small': {
      fontSize: '12px',
      lineHeight: '16px',
      padding: `${button.ds_text_button_radius}px ${button.ds_text_button_horizontal_spacing}px`,
      color: `${button.text_button.text.ds_text_button_default_text_color}`,
      '&:hover': {
        backgroundColor:
          button.text_button.background.ds_text_button_hover_background_color,
        color: button.text_button.text.ds_text_button_hover_text_color
      },
      '&:active': {
        backgroundColor: `${button.text_button.background.ds_text_button_clicked_background_color}4d`,
        color: `${button.text_button.text.ds_text_button_clicked_text_color}4d`
      }
    }
  }
}
