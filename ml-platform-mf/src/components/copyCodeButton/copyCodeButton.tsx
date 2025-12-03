import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Button from '@mui/material/Button'
import Menu, {MenuProps} from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {styled} from '@mui/material/styles'
import * as React from 'react'
import {Icons} from '../../bit-components/icon/index'
import {SelectionOnCopyCode} from '../../modules/featureStoreV2/graphqlAPIs/getFeatureGroups'
import {aliasTokens} from '../../theme.contants'

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right'
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right'
    }}
    {...props}
  />
))(({theme}) => ({
  '& .MuiPaper-root': {
    border: 'none',
    background: aliasTokens.tertiary_background_color,
    borderRadius: '4px',
    marginTop: theme.spacing(1),
    maxWidth: '210px',
    color: aliasTokens.neutral_text_color,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
    '& .MuiMenu-list': {
      padding: '4px',
      display: 'flex',
      flexDirection: 'column'
    },
    '& .MuiMenuItem-root': {
      padding: '8px',
      display: 'inline-block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',

      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5)
      },
      '&:active': {
        backgroundColor: aliasTokens.secondary_background_color,
        borderRadius: '4px'
      },
      '&:hover': {
        backgroundColor: aliasTokens.secondary_background_color,
        borderRadius: '4px'
      }
    }
  }
}))

export interface IProps {
  copyCodes: SelectionOnCopyCode[]
}

export default function CopyCodeButton(props: IProps) {
  let copyTimeStamp = null
  const {copyCodes} = props
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [copyButtonText, setCopyButtonText] = React.useState('Copy Code')
  const open = Boolean(anchorEl)

  const setAndResetCopyButtonText = () => {
    setCopyButtonText('Copied')
    clearTimeout(copyTimeStamp)
    copyTimeStamp = setTimeout(() => {
      setCopyButtonText('Copy Code')
    }, 3000)
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = (copyCode: string) => {
    setAnchorEl(null)
    if (copyCode) {
      navigator.clipboard.writeText(copyCode)
      setAndResetCopyButtonText()
    }
  }

  React.useEffect(() => {
    return () => clearTimeout(copyTimeStamp)
  }, [])

  return (
    <>
      <Button
        id='demo-customized-button'
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        variant='contained'
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          backgroundColor: '#0074E8',
          color: aliasTokens.primary_text_color,
          borderRadius: '4px',
          fontWeight: 700,
          fontSize: '14px',
          lineHeight: '20px',
          height: '28px'
        }}
      >
        {copyButtonText}
      </Button>
      <StyledMenu
        id='demo-customized-menu'
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {copyCodes.map((copyCode) => (
          <MenuItem
            key={copyCode.name}
            onClick={() => handleClose(copyCode.value)}
            disableRipple
            data-testid='copy-code-menu-item'
          >
            <span style={{marginRight: '11px'}} className={Icons.ICON_COPY} />
            Copy as {copyCode.name}
          </MenuItem>
        ))}
      </StyledMenu>
    </>
  )
}
