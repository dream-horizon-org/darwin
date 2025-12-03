export type ProgressCircleProps = {
  size: LoaderSize
}

export enum LoaderSize {
  Large = 48,
  Medium = 32,
  Small = 24,
  ExtraSmall = 20,
  XExtraSmall = 16
}

export const LoaderSizeList = [
  {value: LoaderSize.Large, text: 'L'},
  {value: LoaderSize.Medium, text: 'M'},
  {value: LoaderSize.Small, text: 'S'},
  {value: LoaderSize.ExtraSmall, text: 'XS'},
  {value: LoaderSize.XExtraSmall, text: 'XXS'}
]
