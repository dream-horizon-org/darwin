import {createUseStyles} from 'react-jss'
import {tag as tagTheme} from '../../../design-tokens/index'
const stylesLightTheme = () => {
  const tag = tagTheme('light')
  return createUseStyles({
    tagsCounter: {
      height: '20px',
      borderRadius: tag.ds_tag_counter_radius,
      padding: `${tag.ds_tag_counter_vertical_spacing}px  ${tag.ds_tag_counter_horizontal_spacing}px`,

      background:
        tag.tag.counter.default.ds_tag_counter_default_background_color,
      display: 'inline-flex',
      alignItems: 'center',
      '&.activeBg': {
        background: `${tag.tag.counter.active.ds_tag_counter_active_background_color}`
      },
      '&.disabledBg': {
        background:
          tag.tag.counter.disable.ds_tag_counter_disable_background_color
      }
    },
    tagsCounterNumber: {
      height: '16px',
      fontWeight: 'bold',
      fontSize: '12px',
      padding: `${tag.ds_tag_counter_vertical_spacing}px ${tag.ds_tag_counter_horizontal_spacing}px`,
      fontFamily: 'Roboto',
      display: 'flex',
      color: tag.tag.counter.default.ds_tag_counter_default_text_color,
      alignItems: 'center',
      '&.activeBg': {
        color: tag.tag.counter.active.ds_tag_counter_active_text_color
      },
      '&.disabledBg': {
        color: tag.tag.counter.disable.ds_tag_counter_disable_text_color
      }
    }
  })
}
export default stylesLightTheme
