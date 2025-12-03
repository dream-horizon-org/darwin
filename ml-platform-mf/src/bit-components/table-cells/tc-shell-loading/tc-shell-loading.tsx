import React, {ReactNode} from 'react'
import {
  AnimationVariants,
  ShellLoading,
  ShellVariant
} from '../../shell-loading/index'
import {TcCell, TcCellProps} from '../tc-cell/index'

export interface TcShellLoadingProps extends TcCellProps {
  /**
   * a node to be rendered in the special component.
   */
  children?: ReactNode
  /**
   * Animation for the shell loading
   */
  animation?: AnimationVariants
  /**
   * Height of the shell loading
   */
  height?: string | number
  /**
   * Width of the shell loading
   */
  width?: string | number
  /**
   * The type of content that will be rendered
   */
  variant?: ShellVariant
  /**
   *
   */
  testIdentifier?: string
  /**
   *
   */
  loading?: boolean
  /**
   * To change theme
   */
  theme?: string
}

export function TcShellLoading({
  children,
  variant,
  align,
  animation,
  height,
  severity,
  size,
  stickyPosition,
  testIdentifier,
  type,
  width,
  loading,
  theme
}: TcShellLoadingProps) {
  return (
    <TcCell
      severity={severity}
      stickyPosition={stickyPosition}
      type={type}
      size={size}
      align={align}
      loading={loading}
      theme={theme}
    >
      <ShellLoading
        theme={theme}
        animation={animation}
        height={height}
        variant={variant}
        width={width}
        testIdentifier={testIdentifier}
      >
        {children}
      </ShellLoading>
    </TcCell>
  )
}

TcShellLoading.defaultProps = {
  loading: false,
  theme: 'dark'
}
