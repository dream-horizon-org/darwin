import React from 'react'
import {Button, ButtonSizes, ButtonVariants} from '../button/index'
import {CompositionWrapper} from '../composition-wrapper/index'
import {PopoutHorizontalPositions, PopoutVerticalPositions} from './constants'
import {Popout} from './popout'
import {popoutMockData, popoutMockScroll} from './popout.mockData'
import {renderIcon} from './utils'

export const BasicPopout = () => {
  renderIcon()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <CompositionWrapper>
      <Button
        variant={ButtonVariants.TERTIARY}
        size={ButtonSizes.MEDIUM}
        buttonText='Open Popout'
        onClick={handleClick}
      />
      <Popout
        anchorEl={anchorEl}
        optionsList={popoutMockData}
        handleClose={handleClose}
        showOnCloseButton={true}
        anchorOrigin={{
          vertical: PopoutVerticalPositions.BOTTOM,
          horizontal: PopoutHorizontalPositions.LEFT
        }}
        transformOrigin={{
          vertical: PopoutVerticalPositions.TOP,
          horizontal: PopoutHorizontalPositions.LEFT
        }}
      ></Popout>
    </CompositionWrapper>
  )
}

export const PopoutWithScroll = () => {
  renderIcon()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <CompositionWrapper>
      <Button
        theme={'light'}
        variant={ButtonVariants.TERTIARY}
        size={ButtonSizes.MEDIUM}
        buttonText='Open Popout'
        onClick={handleClick}
      />
      <Popout
        theme={'light'}
        anchorEl={anchorEl}
        optionsList={popoutMockScroll}
        handleClose={handleClose}
        showOnCloseButton={true}
        anchorOrigin={{
          vertical: PopoutVerticalPositions.BOTTOM,
          horizontal: PopoutHorizontalPositions.LEFT
        }}
        transformOrigin={{
          vertical: PopoutVerticalPositions.TOP,
          horizontal: PopoutHorizontalPositions.LEFT
        }}
      />
    </CompositionWrapper>
  )
}

export const PopoutWithChildren = () => {
  renderIcon()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [open, setopen] = React.useState<boolean>(false)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <CompositionWrapper>
      <Button
        variant={ButtonVariants.TERTIARY}
        size={ButtonSizes.MEDIUM}
        buttonText='Open Popout'
        onClick={handleClick}
      />
      <Popout
        open={open}
        anchorEl={anchorEl}
        showOnCloseButton={true}
        handleClose={handleClose}
        anchorOrigin={{
          vertical: PopoutVerticalPositions.BOTTOM,
          horizontal: PopoutHorizontalPositions.RIGHT
        }}
        transformOrigin={{
          vertical: PopoutVerticalPositions.TOP,
          horizontal: PopoutHorizontalPositions.RIGHT
        }}
        showChildren={true}
        onMouseEnter={() => setopen(true)}
        onMouseLeave={handleClose}
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <div>
            <h2 style={{margin: '0'}}>Hello</h2>
          </div>
          <div>
            <h6 style={{margin: '0'}}>I am a child</h6>
          </div>
        </div>
      </Popout>
    </CompositionWrapper>
  )
}

export const PopoutWithAnchorChildren = () => {
  renderIcon()
  const [open, setopen] = React.useState<boolean>(false)

  const handlePopoverOpen = () => {
    setopen(true)
    // setAnchorEl(event.currentTarget);
  }

  const handlePopoverClose = () => {
    setopen(false)
  }

  return (
    <CompositionWrapper>
      <Button
        variant={ButtonVariants.TERTIARY}
        size={ButtonSizes.MEDIUM}
        buttonText='Open Popout'
        onClick={handlePopoverOpen}
      />

      <Popout
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        anchorReference='anchorPosition'
        anchorPosition={{top: 660, left: 1030}}
        showOnCloseButton={true}
        open={open}
        handleClose={handlePopoverClose}
        anchorOrigin={{
          vertical: PopoutVerticalPositions.BOTTOM,
          horizontal: PopoutHorizontalPositions.RIGHT
        }}
        transformOrigin={{
          vertical: PopoutVerticalPositions.TOP,
          horizontal: PopoutHorizontalPositions.RIGHT
        }}
        showChildren={true}
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <div>
            <h2 style={{margin: '0'}}>Hello</h2>
          </div>
          <div>
            <h6 style={{margin: '0'}}>I am a child</h6>
          </div>
        </div>
      </Popout>
    </CompositionWrapper>
  )
}
