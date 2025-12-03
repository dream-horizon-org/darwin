import {createUseStyles} from 'react-jss'
import {pagination as paginationTheme} from '../../design-tokens/index'
const paginationLightTheme = paginationTheme('light')
export const stylesLightTheme = createUseStyles({
  container: {
    flex: 1,
    height: '72px',
    alignItems: 'center',
    justifyContent: 'end',
    display: 'flex',
    minWidth: '572px'
  },
  paginationContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '32px',
    marginRight: paginationLightTheme.ds_pagination_divider_right_spacing
  },
  nextContainer: {
    marginRight: paginationLightTheme.ds_pagination_divider_left_spacing,
    height: '40px',
    display: 'flex'
  },
  pageNumberContainer: {
    margin: `0px ${paginationLightTheme.ds_pagination_dropdown_left_vertical_spacing}px`,
    display: 'flex',
    alignItems: 'center',
    minWidth: '146px'
  },
  pageNumberAutocompleteStyle: {
    width: '64px',
    marginRight: paginationLightTheme.ds_pagination_dropdown_right_spacing
  },
  rowContainer: {
    display: 'flex',
    marginLeft: paginationLightTheme.ds_pagination_divider_right_spacing,
    height: '32px',
    alignItems: 'center'
  },
  rowAutocompleteStyle: {
    width: '100px'
  },
  pageTextContainer: {
    minWidth: '74px',
    marginLeft: paginationLightTheme.ds_pagination_divider_left_spacing,
    display: 'flex'
  }
})

export const typographyLightStyle = {
  color: paginationLightTheme.pagination.ds_pagination_label_text_color,
  marginRight: '8px'
}
