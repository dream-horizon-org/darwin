import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import TextField from '@mui/material/TextField'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'

import {Divider} from '@mui/material'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  placeholder: string
  value: string
  onValueChange: (value: string) => void
  dataTestestid?: string
}

const SearchBar = (props: IProps) => {
  const {placeholder, value, onValueChange, classes, dataTestestid} = props

  return (
    <FormControl fullWidth>
      <TextField
        className={classes.root}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        data-testid={dataTestestid}
        size='small'
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              {value?.length > 0 && (
                <>
                  <CloseIcon
                    className={classes.closeIcon}
                    onClick={() => onValueChange('')}
                  />
                  <Divider orientation='vertical' className={classes.divider} />
                </>
              )}
              <SearchIcon className={classes.searchIcon} />
            </InputAdornment>
          ),
          className: classes.root
        }}
      />
    </FormControl>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(SearchBar)

export default styleComponent
