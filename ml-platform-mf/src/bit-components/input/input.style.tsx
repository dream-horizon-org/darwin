import {createUseStyles} from 'react-jss'

export const inputBorderStyles = createUseStyles({
  hideDefaultBorder: {
    '&.MuiFormControl-root > .MuiOutlinedInput-root:not(:hover, :active) > fieldset':
      {
        borderColor: 'transparent'
      }
  }
})
