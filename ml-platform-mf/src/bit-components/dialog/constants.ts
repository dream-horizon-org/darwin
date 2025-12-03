export type ActionButtonProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  text: string
  testIdentifier?: string
  disabled?: boolean
  isLoading?: boolean
  smallFont?: boolean
}
export type DialogFooterProps = {
  children?: React.ReactNode
  primaryButton: ActionButtonProps
  secondaryButton?: ActionButtonProps
}

export type DialogBoxWithSecondaryButtonProp = {
  primaryMockFun: (event: React.MouseEvent<HTMLButtonElement>) => void
  secondaryMockFun: (event: React.MouseEvent<HTMLButtonElement>) => void
}
