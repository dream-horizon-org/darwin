import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Grow from '@mui/material/Grow'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {useHistory} from 'react-router'
import {routes} from '../../../constants'
import {featureFlags} from '../../../utils/featureFlags'
import SearchBar from '../../searchBar'
import useQuery, {WorkflowsQueryParams} from '../../useQuery'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {}

const options = ['Create via YAML']

const ListHeader = (props: IProps) => {
  const {classes} = props
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const query = useQuery()
  const history = useHistory()

  const searchQuery = query.get(WorkflowsQueryParams.QUERY) || ''
  const filtersQuery = query.get(WorkflowsQueryParams.FILTERS)

  const onSearchInput = (str) => {
    history.replace({
      pathname: routes.workflows,
      search: `?${WorkflowsQueryParams.QUERY}=${encodeURIComponent(str)}&${
        WorkflowsQueryParams.FILTERS
      }=${encodeURIComponent(filtersQuery)}`
    })
  }

  const handleCreateClick = () => {
    history.push(routes.createWorkflow)
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return
    }

    setOpen(false)
  }

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    option: string
  ) => {
    setOpen(false)
  }

  return (
    <div className={classes.container}>
      <div className={classes.left}>Workflows</div>
      <div className={classes.right}>
        <div className={classes.searchContainer}>
          <SearchBar
            placeholder={'Search Workflows'}
            value={searchQuery}
            onValueChange={onSearchInput}
            dataTestestid='workflows-search-bar'
          />
        </div>
        {featureFlags.WORKFLOWS.LIST_PAGE.CREATE && (
          <ButtonGroup
            variant='contained'
            ref={anchorRef}
            aria-label='split button'
            className={classes.action}
          >
            <Button
              onClick={handleCreateClick}
              data-testid='workflows-create-button'
            >
              Create
            </Button>
            {/* <Button
              size='small'
              aria-controls={open ? 'split-button-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-label='select merge strategy'
              aria-haspopup='menu'
              onClick={handleToggle}
            >
              <ArrowDropDownIcon />
            </Button> */}
          </ButtonGroup>
        )}
        {featureFlags.WORKFLOWS.LIST_PAGE.CREATE && (
          <Popper
            sx={{
              zIndex: 1
            }}
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            disablePortal
          >
            {({TransitionProps, placement}) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === 'bottom' ? 'center top' : 'center bottom'
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList id='split-button-menu' autoFocusItem>
                      {options.map((option) => (
                        <MenuItem
                          key={option}
                          onClick={(event) =>
                            handleMenuItemClick(event, option)
                          }
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        )}
      </div>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(ListHeader)

export default StyleComponent
